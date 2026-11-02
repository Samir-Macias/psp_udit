import { useState, useEffect, useRef } from 'react';
import { 
  RotateCcw, 
  Terminal as TerminalIcon, 
  Cpu, 
  Clock, 
  Sliders, 
  Zap, 
  Info,
  Server,
  Shuffle,
  BarChart3
} from 'lucide-react';

type ModuleId = 'cat' | 'ses' | 'por' | 'ana';
type ThreadState = 'NEW' | 'RUNNABLE' | 'TIMED_WAITING' | 'TERMINATED';
type LogType = 'normal' | 'header' | 'main' | 'warning' | 'start' | 'finish' | 'success' | 'metric';

type ModuleConfig = {
  id: ModuleId;
  name: string;
  threadName: string;
  prio: number;
  prioLabel: string;
  color: string;
  borderClass: string;
  badgeClass: string;
};

type ActiveModule = ModuleConfig & { lat: number };
type TerminalLog = { id: number; text: string; type: LogType };
type Metrics = { totalReal: number; maxLat: number; sumLat: number; savings: number };

// Strict module requirements for Reto 3
const INITIAL_MODULES: ModuleConfig[] = [
  { 
    id: 'cat', 
    name: 'catalogo-metadatos', 
    threadName: 'DL-catalogo', 
    prio: 10, 
    prioLabel: 'Thread.MAX_PRIORITY (10)',
    color: '#64748b',
    borderClass: 'border-slate-200',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200'
  },
  { 
    id: 'ses', 
    name: 'sesion-y-perfil',     
    threadName: 'DL-sesion',   
    prio: 10, 
    prioLabel: 'Thread.MAX_PRIORITY (10)',
    color: '#64748b',
    borderClass: 'border-slate-200',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200'
  },
  { 
    id: 'por', 
    name: 'portadas-assets',     
    threadName: 'DL-portadas', 
    prio: 5,  
    prioLabel: 'Thread.NORM_PRIORITY (5)',
    color: '#64748b',
    borderClass: 'border-slate-200',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200'
  },
  { 
    id: 'ana', 
    name: 'analiticas',          
    threadName: 'DL-analitica',
    prio: 1,  
    prioLabel: 'Thread.MIN_PRIORITY (1)',
    color: '#64748b',
    borderClass: 'border-slate-200',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200'
  },
];

export default function App() {
  const [modules] = useState(INITIAL_MODULES);
  
  // Custom latencies state
  const [latencies, setLatencies] = useState<Record<ModuleId, number>>({
    cat: 1840,
    ses: 1120,
    por: 3610,
    ana: 2950
  });

  const [useManualLatencies, setUseManualLatencies] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'concurrent' | 'sequential'>('concurrent');
  
  // Live execution states
  const [threadStates, setThreadStates] = useState<Partial<Record<ModuleId, ThreadState>>>({});
  const [threadProgress, setThreadProgress] = useState<Partial<Record<ModuleId, number>>>({});
  const [threadElapsed, setThreadElapsed] = useState<Partial<Record<ModuleId, number>>>({});
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<Partial<Record<ModuleId, ReturnType<typeof setInterval>>>>({});
  const logTerminalRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll terminal log
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Clean up timers & intervals on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      Object.values(intervalsRef.current).forEach((interval) => {
        if (interval !== undefined) clearInterval(interval);
      });
    };
  }, []);

  // Generate new random latencies (1000 + Random.nextInt(3001))
  const generateRandomLatencies = () => {
    if (isRunning) return;
    const newLats = {
      cat: Math.floor(1000 + Math.random() * 3001),
      ses: Math.floor(1000 + Math.random() * 3001),
      por: Math.floor(1000 + Math.random() * 3001),
      ana: Math.floor(1000 + Math.random() * 3001)
    };
    setLatencies(newLats);
  };

  const addLog = (text: string, type: LogType = 'normal') => {
    setTerminalLogs(prev => [...prev, { id: Date.now() + Math.random(), text, type }]);
  };

  // Reset all state
  const resetSimulation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    Object.values(intervalsRef.current).forEach((interval) => {
      if (interval !== undefined) clearInterval(interval);
    });
    intervalsRef.current = {};

    setIsRunning(false);
    setMetrics(null);
    setTerminalLogs([]);

    const initialStates: Partial<Record<ModuleId, ThreadState>> = {};
    const initialProgress: Partial<Record<ModuleId, number>> = {};
    const initialElapsed: Partial<Record<ModuleId, number>> = {};

    modules.forEach(m => {
      initialStates[m.id] = 'NEW';
      initialProgress[m.id] = 0;
      initialElapsed[m.id] = 0;
    });

    setThreadStates(initialStates);
    setThreadProgress(initialProgress);
    setThreadElapsed(initialElapsed);
  };

  // Run Download Simulation
  const runSimulation = (executionMode: 'concurrent' | 'sequential' = 'concurrent') => {
    resetSimulation();
    setIsRunning(true);
    setMode(executionMode);

    // Active latency assignment
    const activeModules = modules.map(m => ({
      ...m,
      lat: latencies[m.id] || 2000
    }));

    addLog("========================================================================", "header");
    addLog(`   UDITflix BACKEND · MOTOR DE DESCARGA (${executionMode === 'concurrent' ? 'PARALELO: start() + join()' : 'SECUENCIAL: run() en main'})   `, "header");
    addLog("========================================================================", "header");

    if (executionMode === 'concurrent') {
      runConcurrent(activeModules);
    } else {
      runSequential(activeModules);
    }
  };

  // --- CONCURRENT SIMULATION MODE ---
  const runConcurrent = (activeModules: ActiveModule[]) => {
    addLog(`[MAIN] Descargando ${activeModules.length} módulos en paralelo con ArrayList<Thread>...\n`, "main");

    const startTime = performance.now();
    let completedCount = 0;

    activeModules.forEach((m) => {
      // OS Thread Scheduling delay simulation
      const startDelay = Math.floor(Math.random() * 40) + 10;

      // Transition to RUNNABLE
      const t1 = setTimeout(() => {
        setThreadStates(prev => ({ ...prev, [m.id]: 'RUNNABLE' }));
      }, startDelay);

      // Transition to TIMED_WAITING (Thread.sleep) and print START trace
      const t2 = setTimeout(() => {
        setThreadStates(prev => ({ ...prev, [m.id]: 'TIMED_WAITING' }));
        
        // Formatted printf output matching Java
        const pName = m.threadName.padEnd(13);
        const pPrio = String(m.prio).padEnd(2);
        const pMod = m.name.padEnd(19);
        addLog(`--> [${pName} | Prioridad=${pPrio}] Iniciando: ${pMod} (${m.lat} ms)`, "start");

        // Live progress tracking
        const startMs = performance.now();
        intervalsRef.current[m.id] = setInterval(() => {
          const elapsed = performance.now() - startMs;
          const pct = Math.min(100, (elapsed / m.lat) * 100);
          
          setThreadProgress(prev => ({ ...prev, [m.id]: pct }));
          setThreadElapsed(prev => ({ ...prev, [m.id]: Math.min(m.lat, Math.round(elapsed)) }));

          if (pct >= 100) {
            clearInterval(intervalsRef.current[m.id]);
          }
        }, 30);

      }, startDelay + 60);

      // Thread finishes Thread.sleep() -> TERMINATED
      const t3 = setTimeout(() => {
        setThreadStates(prev => ({ ...prev, [m.id]: 'TERMINATED' }));
        setThreadProgress(prev => ({ ...prev, [m.id]: 100 }));
        setThreadElapsed(prev => ({ ...prev, [m.id]: m.lat }));

        const pName = m.threadName.padEnd(13);
        const pPrio = String(m.prio).padEnd(2);
        addLog(`<-- [${pName} | Prioridad=${pPrio}] ¡COMPLETADO! ${m.name}`, "finish");

        completedCount++;

        // All threads finished (join() unlocked)
        if (completedCount === activeModules.length) {
          const totalReal = Math.round(performance.now() - startTime);
          const maxLat = Math.max(...activeModules.map(x => x.lat));
          const sumLat = activeModules.reduce((acc, x) => acc + x.lat, 0);

          addLog("\n========================================================================", "header");
          addLog("[MAIN] Todos los módulos completados", "success");
          addLog(`Tiempo total real:          ${totalReal} ms`, "metric");
          addLog(`Duración del más lento:     ${maxLat} ms`, "metric");
          addLog(`Suma de todas (secuencial): ${sumLat} ms`, "metric");
          addLog("========================================================================", "header");

          setMetrics({
            totalReal,
            maxLat,
            sumLat,
            savings: Math.round(((sumLat - totalReal) / sumLat) * 100)
          });

          setIsRunning(false);
        }

      }, startDelay + 60 + m.lat);

      timersRef.current.push(t1, t2, t3);
    });
  };

  // --- SEQUENTIAL SIMULATION MODE ---
  const runSequential = (activeModules: ActiveModule[]) => {
    addLog(`[MAIN] ADVERTENCIA: Ejecutando en hilo main (bloqueante, uno tras otro)...\n`, "warning");

    const startTime = performance.now();
    let cumulativeDelay = 100;

    activeModules.forEach((m, idx) => {
      // Start sequential module
      const tStart = setTimeout(() => {
        setThreadStates(prev => ({ ...prev, [m.id]: 'RUNNABLE' }));
        
        setTimeout(() => {
          setThreadStates(prev => ({ ...prev, [m.id]: 'TIMED_WAITING' }));
          
          const pName = "main".padEnd(13);
          const pPrio = "5 ".padEnd(2);
          const pMod = m.name.padEnd(19);
          addLog(`--> [${pName} | Prioridad=${pPrio}] Ejecutando: ${pMod} (${m.lat} ms)`, "start");

          const startMs = performance.now();
          intervalsRef.current[m.id] = setInterval(() => {
            const elapsed = performance.now() - startMs;
            const pct = Math.min(100, (elapsed / m.lat) * 100);
            
            setThreadProgress(prev => ({ ...prev, [m.id]: pct }));
            setThreadElapsed(prev => ({ ...prev, [m.id]: Math.min(m.lat, Math.round(elapsed)) }));

            if (pct >= 100) {
              clearInterval(intervalsRef.current[m.id]);
            }
          }, 30);
        }, 40);

      }, cumulativeDelay);

      // Finish sequential module
      cumulativeDelay += m.lat + 80;

      const tEnd = setTimeout(() => {
        setThreadStates(prev => ({ ...prev, [m.id]: 'TERMINATED' }));
        setThreadProgress(prev => ({ ...prev, [m.id]: 100 }));
        setThreadElapsed(prev => ({ ...prev, [m.id]: m.lat }));

        const pName = "main".padEnd(13);
        const pPrio = "5 ".padEnd(2);
        addLog(`<-- [${pName} | Prioridad=${pPrio}] Terminado: ${m.name}`, "finish");

        // Last module finished
        if (idx === activeModules.length - 1) {
          const totalReal = Math.round(performance.now() - startTime);
          const maxLat = Math.max(...activeModules.map(x => x.lat));
          const sumLat = activeModules.reduce((acc, x) => acc + x.lat, 0);

          addLog("\n========================================================================", "header");
          addLog("[MAIN] Descarga secuencial completada", "success");
          addLog(`Tiempo total real:          ${totalReal} ms`, "metric");
          addLog(`Duración del más lento:     ${maxLat} ms`, "metric");
          addLog(`Suma de todas (secuencial): ${sumLat} ms`, "metric");
          addLog("========================================================================", "header");

          setMetrics({
            totalReal,
            maxLat,
            sumLat,
            savings: 0
          });

          setIsRunning(false);
        }

      }, cumulativeDelay);

      timersRef.current.push(tStart, tEnd);
    });
  };

  return (
    <div className="min-h-screen bg-stone-100 text-slate-800 font-sans antialiased selection:bg-slate-300 selection:text-slate-900">
      
      {/* TOP BAR */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-800 p-2 rounded-lg">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  UDIT<span className="text-slate-500">flix</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-slate-500 border border-stone-200 font-semibold">
                  RETO 3 · PSP 2º DAM
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Motor Concurrente de Descarga Masiva de Assets
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* CONTROLS BAR */}
        <div className="border border-stone-200 bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-medium text-slate-500 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full mb-4">
                <Server className="w-3.5 h-3.5" />
                <span>PSP · Simulador de concurrencia Java</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                Optimizador de Descarga Masiva de Assets
              </h1>
              <p className="text-slate-500 text-sm mt-2 max-w-2xl leading-relaxed">
                Compara la ejecución secuencial con <code className="text-slate-700 bg-stone-100 px-1 rounded">run()</code> y la concurrente con <code className="text-slate-700 bg-stone-100 px-1 rounded">start()</code> y <code className="text-slate-700 bg-stone-100 px-1 rounded">join()</code>.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => runSimulation('concurrent')}
                disabled={isRunning}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-3 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Descarga Concurrente (start + join)</span>
              </button>

              <button
                onClick={() => runSimulation('sequential')}
                disabled={isRunning}
                className="flex items-center space-x-2 bg-white hover:bg-stone-50 text-slate-700 font-medium px-4 py-3 rounded-lg border border-stone-300 transition-colors disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>Simular Secuencial (run en main)</span>
              </button>

              <button
                onClick={generateRandomLatencies}
                disabled={isRunning}
                title="Generar nuevas latencias aleatorias entre 1000 y 4000 ms"
                className="p-3 bg-white hover:bg-stone-50 text-slate-600 rounded-lg border border-stone-300 transition-colors disabled:opacity-50"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={resetSimulation}
                disabled={isRunning}
                title="Reiniciar simulador"
                className="p-3 bg-white hover:bg-stone-50 text-slate-600 rounded-lg border border-stone-300 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: WORKERS & CONFIG (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WORKERS MONITOR & CONFIG */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <h2 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                    Módulos & Prioridades (RT1, RT2, RT3)
                  </h2>
                </div>
                
                <button
                  onClick={() => setUseManualLatencies(!useManualLatencies)}
                  disabled={isRunning}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                    useManualLatencies 
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-stone-300'
                  }`}
                >
                  {useManualLatencies ? 'Editar Latencias' : 'Latencias del Azar (RT2)'}
                </button>
              </div>

              {/* THREAD CARDS */}
              <div className="space-y-3">
                {modules.map((m) => {
                  const st = threadStates[m.id] || 'NEW';
                  const pct = threadProgress[m.id] || 0;
                  const elapsedMs = threadElapsed[m.id] || 0;
                  const latMs = latencies[m.id] || 2000;

                  return (
                    <div key={m.id} className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                      
                      {/* HEADER ROW */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                          <span className="text-sm font-semibold text-slate-800">
                            {m.threadName}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({m.name})
                          </span>
                        </div>

                        {/* PRIORITY BADGE */}
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${m.badgeClass}`}>
                          prio={m.prio}
                        </span>
                      </div>

                      {/* MANUAL LATENCY ADJUSTMENT */}
                      {useManualLatencies && (
                        <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-stone-200">
                          <span className="text-slate-500">Latencia (ms):</span>
                          <input
                            type="number"
                            min="500"
                            max="5000"
                            step="100"
                            value={latencies[m.id] || 2000}
                            onChange={(e) => setLatencies({ ...latencies, [m.id]: Math.max(500, Number(e.target.value)) })}
                            disabled={isRunning}
                            className="w-24 bg-white border border-stone-300 text-slate-800 font-semibold text-right text-xs rounded-md px-2 py-1 focus:border-slate-500 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* LIVE PROGRESS & STATE */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">Estado del hilo</span>
                          <span className={`font-bold px-2 py-0.5 rounded ${
                            st === 'NEW' ? 'bg-stone-200 text-slate-600' :
                            st === 'RUNNABLE' ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                            st === 'TIMED_WAITING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {st}
                          </span>
                        </div>

                        <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-75 rounded-full"
                            style={{ 
                              width: `${pct}%`,
                              backgroundColor: st === 'TERMINATED' ? '#64748b' : m.color
                            }}
                          />
                        </div>

                        <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>Progreso: {Math.round(pct)}%</span>
                          <span>{elapsedMs} ms / {latMs} ms</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* TECHNICAL INFO BOX */}
              <div className="p-3 bg-slate-50 rounded-xl border border-stone-200 text-xs text-slate-600 flex items-start space-x-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-slate-800">RT4 · ArrayList:</strong> Los 4 hilos arrancan en paralelo con <code className="text-slate-800 bg-stone-200 px-1 rounded">start()</code>. Después, el hilo principal invoca <code className="text-slate-800 bg-stone-200 px-1 rounded">join()</code> para esperar a que todos pasen a <code className="text-slate-800 bg-stone-200 px-1 rounded">TERMINATED</code>.
                </p>
              </div>
            </div>

            {/* PERFORMANCE METRICS */}
            <div className="border border-stone-200 bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-stone-200 pb-3">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Rendimiento de descarga
                </h3>
              </div>

              {metrics ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <span className="text-[9px] text-slate-500 block uppercase">Tiempo real</span>
                      <span className="text-sm sm:text-base font-semibold text-slate-900">{metrics.totalReal} ms</span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <span className="text-[9px] text-slate-500 block uppercase">Más lento</span>
                      <span className="text-sm sm:text-base font-semibold text-slate-900">{metrics.maxLat} ms</span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <span className="text-[9px] text-slate-500 block uppercase">Suma secuencial</span>
                      <span className="text-sm sm:text-base font-semibold text-slate-900">{metrics.sumLat} ms</span>
                    </div>
                  </div>

                  {mode === 'concurrent' && metrics.savings > 0 && (
                    <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-slate-500" />
                        <span>Ahorro de tiempo concurrente:</span>
                      </div>
                      <strong className="text-slate-900 text-sm">{metrics.savings}% más rápido</strong>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-center text-xs text-slate-500">
                  Haz clic en "Descarga Concurrente" para evaluar el tiempo total real vs la suma secuencial.
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: EXECUTION LOG */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[620px]">
              
              <div className="bg-white px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Registro de ejecución</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Salida simulada del hilo principal y los workers</p>
                </div>
                <span className="text-[11px] text-slate-600 font-medium bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                  {mode === 'concurrent' ? 'Concurrente' : 'Secuencial'}
                </span>
              </div>

              {/* LOG MESSAGES DISPLAY */}
              <div 
                ref={logTerminalRef}
                className="p-5 font-mono text-xs overflow-y-auto space-y-2 flex-1 leading-relaxed text-slate-700 selection:bg-slate-200 selection:text-slate-900"
              >
                {terminalLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <TerminalIcon className="w-9 h-9 text-slate-300" />
                    <p className="text-center max-w-sm text-xs leading-relaxed">
                      Inicia una simulación para ver aquí el orden de ejecución y la finalización de cada hilo.
                    </p>
                  </div>
                ) : (
                  terminalLogs.map((log) => {
                    let styleClass = "text-slate-600";
                    if (log.type === "header") styleClass = "text-slate-800 font-semibold";
                    if (log.type === "main") styleClass = "text-slate-700";
                    if (log.type === "warning") styleClass = "text-amber-800 font-semibold";
                    if (log.type === "start") styleClass = "text-slate-600";
                    if (log.type === "finish") styleClass = "text-slate-800 font-medium";
                    if (log.type === "success") styleClass = "text-slate-800 font-semibold bg-slate-100 px-2 py-1 rounded-md border border-slate-200 inline-block";
                    if (log.type === "metric") styleClass = "text-slate-800 font-semibold";

                    return (
                      <div key={log.id} className={`whitespace-pre-wrap break-words font-mono ${styleClass}`}>
                        {log.text}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex justify-between items-center text-[11px] text-slate-500">
                <span>{mode === 'concurrent' ? 'Paralelo · start() + join()' : 'Secuencial · hilo main'}</span>
                <span>{terminalLogs.length} eventos</span>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 bg-white py-5 text-center text-xs text-slate-500">
        <p>UDITflix · Programación de Servicios y Procesos (PSP 2º DAM) · Reto 3</p>
      </footer>

    </div>
  );
}