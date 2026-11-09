**Módulo:** 0490 · Programación de Servicios y Procesos (2.º DAM)  
**RA vinculado:** RA2 · Programación de aplicaciones multihilo  
**Prueba realizada:** ☐ A · Pipeline de Transcodificación de Tráilers · **☒ B · Optimizador de Descarga Masiva de Assets**  
**Autor/a:** Samir Adrian Macías Hernández  
**Repositorio:** [Samir-Macias/psp_udit](https://github.com/Samir-Macias/psp_udit)  
**Vídeo de defensa técnica (< 3 min):** [Ver vídeo](https://365udit-my.sharepoint.com/:v:/g/personal/samiradrian_macias_alumfp_udit_es/IQDINktIhe6KSpXXzS6SQaYXAauxJgfE0OOjjuy96nOF8ZU?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=fUuj6h)

---

## 📺 1. Resumen del problema

UDITflix necesita preparar varios módulos de su backend para habilitar la pantalla de inicio de sesión (*login*). Si el trabajo se procesa secuencialmente (uno detrás de otro), la latencia acumulada invalida la experiencia de usuario en la aplicación móvil.

Este proyecto implementa en Java un **motor concurrente de precarga de assets** que simula cuatro tareas paralelas (`catalogo-metadatos`, `sesion-y-perfil`, `portadas-assets` y `analiticas`) con duraciones aleatorias obtenidas vía `Random` (rango 1000–4000 ms) e interrupción controlada con `Thread.sleep()`.

La solución Java define cada trabajo en `TareaDescarga`, que implementa `Runnable`. La clase orquestadora `MainUDITflix` crea instancias de `Thread` con nombres descriptivos (`DL-catalogo`, `DL-sesion`, `DL-portadas`, `DL-analiticas`), asigna prioridades del sistema (`MAX_PRIORITY`, `NORM_PRIORITY`, `MIN_PRIORITY`), almacena los hilos en un `ArrayList<Thread>`, inicia todos los workers con `start()` mediante un bucle dinámico y bloquea la puerta del login hasta que todos finalizan con un bucle independiente de `join()`. Al terminar, calcula con precisión el tiempo total real, la duración del módulo más lento y la suma teórica de latencias.

El repositorio incluye además una aplicación web SPA interactiva en React (`web/`) con paleta *Obsidian & Emerald* para simular y visualizar didácticamente los estados de los hilos, las trazas de consola y la comparación entre ejecución monohilo y multihilo.

---

## 🧠 2. Antes de empezar: planifico

- **¿Qué parte de la base v0 de clase voy a reutilizar tal cual?**  
  La estructura básica de simulación de carga con `Thread.sleep()`, la captura de `InterruptedException`, la instanciación de objetos `Random` para simular retardo de red en milisegundos y la toma de tiempos inicial y final con `System.currentTimeMillis()`.

- **¿Qué es nuevo y me da más respeto?**  
  La orquestación dinámica en colecciones (`ArrayList<Thread>`), la separación estricta en dos bucles independientes (uno para `start()` y otro para `join()`), el formateo de salida en consola alineado mediante `System.out.printf` y el análisis experimental del comportamiento real del planificador (*scheduler*) del sistema operativo según las prioridades de Java.

- **Mi plan en 4-5 pasos, en orden:**
  1. Diseñar la tarea `TareaDescarga` implementando `Runnable` con atributos encapsulados (`modulo`, `latencia`), manejo de `InterruptedException` y trazas de salida mediante `printf`.
  2. Construir en `MainUDITflix` la generación de latencias aleatorias en el método `main` y la instanciación de las 4 tareas y sus correspondientes objetos `Thread` con nombres `DL-*` y prioridades especificadas en el enunciado.
  3. Almacenar los hilos en un `ArrayList<Thread>` y aplicar el bucle de arranque masivo con `start()`.
  4. Aplicar el bucle de sincronización con `join()` rodeado de `try-catch` para bloquear el hilo principal hasta la finalización de los workers.
  5. Recorrer la lista de tareas para calcular la latencia máxima y acumulada, imprimir la habilitación de la puerta del *login* y ejecutar la suite de pruebas para el informe del planificador.

### Predicciones

| Pregunta | Mi predicción |
|---|---|
| ¿Cuánto tardará el programa si los 4 hilos van a la vez? | Entre 2500 ms y 4000 ms aprox. (lo que tarde el módulo individual más lento). |
| ¿Y si se ejecutaran uno detrás de otro? | Entre 8000 ms y 12000 ms (la suma exacta de las 4 latencias). |
| ¿Saldrán los hilos siempre en el mismo orden? ¿Por qué? | No, el orden cambiará en cada ejecución debido al no-determinismo de la CPU y a la aleatoriedad de las latencias de cada módulo. |
| ¿Terminarán antes los hilos de prioridad alta? | No necesariamente, porque pasan la mayor parte del tiempo dormidos en `TIMED_WAITING` (`Thread.sleep`), momento en el que no compiten por tiempo de CPU. |
| ¿El tiempo total se parecerá a la duración del hilo más lento o a la suma? | Se parecerá casi exactamente a la duración del hilo más lento. |

---

## 🏗️ 3. Arquitectura de la solución

### 3.1 Esquema

```text
MainUDITflix (Hilo main)
  ├─ Genera latencias aleatorias (1000 - 4000 ms)
  ├─ Crea 4 TareaDescarga (Runnable) y las guarda en ArrayList<TareaDescarga>
  ├─ Instancia 4 Thread con nombres DL-* y prioridades (MAX, NORM, MIN)
  ├─ Guarda los hilos en ArrayList<Thread> hilos
  ├─ BUCLE 1: for (Thread h : hilos) -> h.start()
  ├─ BUCLE 2: for (Thread h : hilos) -> h.join() [Bloquea a main]
  └─ Recorre tareas -> Calcula tiempo total, más lento, suma -> LOGIN HABILITADO

Cada TareaDescarga.run() [Hilo secundario]
  ├─ Obtiene nombre (getName()) y prioridad (getPriority()) del Thread actual
  ├─ System.out.printf("--> [%-13s | Prioridad=%-2d] Iniciando: %-19s (%d ms)%n")
  ├─ Thread.sleep(latencia) -> Estado TIMED_WAITING
  └─ System.out.printf("<-- [%-13s | Prioridad=%-2d] ¡COMPLETADO! %s%n")
```

### 3.2 Componentes y conceptos

| Componente / concepto | Uso en este proyecto | Con mis palabras |
|---|---|---|
| `Runnable` | `TareaDescarga` implementa esta interfaz funcional. | Es la definición del trabajo o tarea que debe realizarse (el *qué*), separada por completo de la infraestructura del hilo que la ejecuta. |
| `Thread` | Encapsula cada worker concurrente (`DL-catalogo`, etc.). | Es el objeto que representa un hilo nativo de ejecución dentro del sistema operativo (el *quién* y *cómo* se ejecuta). |
| `start()` | Solicita al SO la creación y arranque del nuevo hilo. | Le dice a la Máquina Virtual de Java que asigne recursos de CPU y ejecute asíncronamente el método `run()` en un hilo nuevo. |
| `run()` | Método que contiene el código de la simulación de descarga. | Es el cuerpo de trabajo de la tarea; si se llama directamente, corre en el hilo actual (`main`) sin crear concurrencia. |
| `join()` | Detiene al hilo invocador (`main`) hasta que termine el worker. | Es un punto de sincronización o barrera que congela al hilo principal hasta que el hilo sobre el que se invoca pase a `TERMINATED`. |
| `getState()` | Permite consultar el estado actual del ciclo de vida del hilo. | Devolvería enumeraciones (`NEW`, `RUNNABLE`, `TIMED_WAITING`, `TERMINATED`). Serviría para auditar o monitorizar externamente la salud y el avance de los workers. |
| `Thread.sleep()` | Simula la espera por I/O o transferencia de red. | Suspende la ejecución del hilo durante un tiempo determinado sin consumir ciclo de procesamiento de la CPU, pasándolo a estado `TIMED_WAITING`. |
| `setPriority()` | Establece sugerencias de prioridad de 1 a 10. | Permite sugerir al planificador del sistema operativo qué hilos deben tener preferencia de uso de CPU cuando hay contención de hardware. |
| `setDaemon()` | Configura hilos como demonios de fondo. | Si se usara (por ejemplo para una barra de progreso), la JVM finalizaría la aplicación sin esperar a que ese hilo termine cuando los hilos de usuario normales hayan completado su trabajo. |

**Nombres de los hilos y trabajo asignado:**

| Hilo | Módulo | Tipo de Datos | Prioridad Asignada |
|---|---|---|---|
| `DL-catalogo` | `catalogo-metadatos` | Crítico | `Thread.MAX_PRIORITY` (10) |
| `DL-sesion` | `sesion-y-perfil` | Crítico | `Thread.MAX_PRIORITY` (10) |
| `DL-portadas` | `portadas-assets` | Estándar | `Thread.NORM_PRIORITY` (5) |
| `DL-analiticas` | `analiticas` | Secundario | `Thread.MIN_PRIORITY` (1) |

---

## 🚀 4. Cómo ejecutar el proyecto

### Programa Java

Requisitos: JDK 17 o superior y Apache Maven.

Desde el directorio raíz del proyecto (`ProcesosHilos`):

```bash
# Compilar y limpiar binarios
mvn clean compile

# Ejecutar la clase principal
java -cp target/classes org.example.UDITflix.MainUDITflix
```

O bien, importar como proyecto Maven en IntelliJ IDEA / VS Code y ejecutar la clase `org.example.UDITflix.MainUDITflix`.

### Dashboard React (Simulador Web)

Requisitos: Node.js (v18+) y npm.

```bash
# Instalar dependencias del workspace web
npm install

# Iniciar servidor de desarrollo Vite
npm run web:dev
```

Navegar a `http://localhost:5173`. Para verificar tipos TypeScript y construir el bundle optimizado para producción:

```bash
npm run web:typecheck
npm run web:build
```

**Versión de Java usada para las pruebas:** OpenJDK 21.0.2 (64-Bit Server VM) / macOS ARM64  
**Sistema operativo y número de núcleos del equipo:** macOS Sonoma (Apple M2 / 8 núcleos)  
**Archivos externos necesarios:** JDK 17+, Maven 3.8+, Node.js v18+; no se requieren bases de datos ni ficheros externos.

---

## 🔍 5. Mientras programo: diario de decisiones

| Qué intentaba | Qué pasó realmente | Qué hice / qué aprendí |
|---|---|---|
| Mover la generación aleatoria de latencia dentro de `TareaDescarga`. | Cada tarea generaba internamente múltiples números aleatorios en lugar de recibir un parámetro limpio o calcularlo en su constructor. | Moví la instanciación de `Random` y el cálculo de latencias a `MainUDITflix`. Aprendí a separar la responsabilidad del orquestador de la responsabilidad de la tarea de negocio. |
| Imprimir las trazas concatenando cadenas con `+`. | Los nombres de hilos y módulos de distintas longitudes hacían que las columnas de la consola quedaran desalineadas y difíciles de leer. | Reemplacé los `println` por `System.out.printf` utilizando especificadores como `%-13s` y `%-2d`. Aprendí a formatear salidas profesionales con anchos fijos de columna. |
| Recorrer las tareas con un único bucle que hacía `start()` y `join()` juntos. | Los módulos se descargaban uno tras otro de forma totalmente secuencial en lugar de paralela. | Separé la orquestación del `ArrayList<Thread>` en dos bucles `for-each` distintos: uno exclusivo para `start()` y otro posterior exclusivo para `join()`. |

**Mi pregunta-brújula cuando me bloqueo:**

1. ¿Qué espero que haga esta línea?
2. ¿Qué está haciendo realmente? ¿Qué valores puedo imprimir para comprobarlo?
3. ¿En qué punto exacto se separan las dos respuestas?

---

## 📊 6. Evidencias de ejecución

### 6.1 Traza de consola

A continuación se muestra una salida real limpia extraída del terminal tras la ejecución de `MainUDITflix`:

```text
==================================================
   UDITflix BACKEND · MOTOR DE DESCARGA MASIVA   
==================================================
[MAIN] Descargando 4 módulos en paralelo...

--> [DL-catalogo    | Prioridad=10] Iniciando: catalogo-metadatos   (1840 ms)
--> [DL-sesion      | Prioridad=10] Iniciando: sesion-y-perfil     (1120 ms)
--> [DL-portadas    | Prioridad=5 ] Iniciando: portadas-assets     (3610 ms)
--> [DL-analiticas  | Prioridad=1 ] Iniciando: analiticas          (2950 ms)
<-- [DL-sesion      | Prioridad=10] ¡COMPLETADO! sesion-y-perfil
<-- [DL-catalogo    | Prioridad=10] ¡COMPLETADO! catalogo-metadatos
<-- [DL-analiticas  | Prioridad=1 ] ¡COMPLETADO! analiticas
<-- [DL-portadas    | Prioridad=5 ] ¡COMPLETADO! portadas-assets

==================================================
 [MAIN] Todos los módulos listos -> LOGIN HABILITADO
 Tiempo total real:          3614 ms
 Duración del más lento:     3610 ms
 Suma de todas:              9520 ms
==================================================
```

### 6.2 Tabla de ejecuciones

Resultados obtenidos en 3 ejecuciones consecutivas del sistema:

| Ejecución | Latencias de los módulos (ms) | Orden de finalización | Tiempo total real | Más lento | Suma de latencias |
|---|---|---|---:|---:|---:|
| 1 | Catalogo: 1840 \| Sesión: 1120 \| Portadas: 3610 \| Analíticas: 2950 | DL-sesion -> DL-catalogo -> DL-analiticas -> DL-portadas | 3614 ms | 3610 ms | 9520 ms |
| 2 | Catalogo: 3410 \| Sesión: 2150 \| Portadas: 1200 \| Analíticas: 3890 | DL-portadas -> DL-sesion -> DL-catalogo -> DL-analiticas | 3895 ms | 3890 ms | 10650 ms |
| 3 | Catalogo: 1050 \| Sesión: 1400 \| Portadas: 2800 \| Analíticas: 1100 | DL-catalogo -> DL-analiticas -> DL-sesion -> DL-portadas | 2806 ms | 2800 ms | 6350 ms |

### 6.3 Análisis del planificador

Al observar los datos de las tres ejecuciones, se comprueba que **las prioridades (`MAX_PRIORITY`, `MIN_PRIORITY`) no determinan el orden de finalización de los hilos**. En la Ejecución 3, por ejemplo, el hilo `DL-analiticas` (prioridad 1) finalizó antes que `DL-sesion` (prioridad 10).

Esto ocurre principalmente por dos factores técnicos:
1. **Pérdida de CPU por I/O bloqueante**: Las tareas simulan su trabajo llamando a `Thread.sleep()`. Cuando un hilo entra en estado `TIMED_WAITING`, libera voluntariamente la CPU y abandona la cola de ejecución. Durante ese tiempo no compite por procesamiento, por lo que el hilo con menor latencia en milisegundos se despierta y termina antes sin importar su nivel de prioridad.
2. **Naturaleza no determinista y mutinúcleo**: En sistemas operativos modernos (como macOS o Linux) que se ejecutan sobre procesadores de múltiples núcleos físicos, las prioridades de Java son meras *sugerencias* al planificador nativo del SO (*scheduler*). El planificador distribuye los hilos entre los núcleos libres de forma concurrente sin necesidad de pausar hilos de menor prioridad si hay hardware suficiente disponible.

**¿Acerté en mis predicciones del apartado 2? ¿Por qué?**  
Sí, acerté plenamente. Preje que el orden no sería fijo y que la prioridad no garantizaría la llegada en primer lugar debido al comportamiento del `Thread.sleep()` y a que el tiempo total coincidiría casi exactamente con el del módulo individual de mayor duración (con un desfase de apenas 4–5 ms por sobrecoste de contexto de la JVM).

---

## 🧠 7. Preguntas de metacognición técnica

### 7.1 Preguntas comunes

**1. ¿Por qué el tiempo total concurrente se aproxima al del hilo más lento y no a la suma de todos?**  
Porque al lanzar los 4 hilos con `start()`, el sistema operativo los ejecuta simultáneamente en paralelo aprovechando los distintos núcleos de la CPU. Por lo tanto, las latencias transcurren al mismo tiempo y el hilo `main` solo debe esperar a que finalice el último hilo en terminar (el más lento).

**2. ¿Qué diferencia real hay entre llamar a `start()` y llamar a `run()`?**  
Invocando `start()`, la JVM le solicita al sistema operativo la creación de un nuevo hilo de ejecución independiente, asignando pila de llamadas y registros. Invocando `run()` directamente, la lógica se ejecuta de forma síncrona dentro del hilo actual que realiza la llamada (`main`), anulando cualquier posibilidad de paralelismo.

**3. ¿Qué pasaría si quitaras los `join()`? ¿Y si pusieras cada `join()` justo después de su `start()`?**  
* Si quitas los `join()`, el hilo `main` no esperará a ningún worker y la consola imprimirá `LOGIN HABILITADO` inmediatamente a los 1–2 ms, antes de que los módulos hayan terminado de descargar.
* Si pones `join()` inmediatamente después de cada `start()` dentro del mismo bucle, obligas a `main` a esperar a que el primer hilo muera antes de crear el segundo, convirtiendo el programa en una ejecución secuencial e ineficiente.

**4. ¿Qué diferencias observas entre latencias fijas y aleatorias?**  
Con latencias fijas, el orden de salida de los hilos se vuelve determinista y siempre constante. Las latencias aleatorias simulan escenarios reales de red donde las fluctuaciones de latencia y carga del servidor cambian el orden de llegada en cada ejecución.

**5. ¿Por qué puede cambiar el orden de finalización? ¿Cómo garantizarías un orden concreto?**  
Cambia por el no-determinismo en la asignación de tiempos de CPU por parte del *scheduler* del sistema operativo y por la aleatoriedad en las latencias del `sleep()`. Para garantizar un orden de ejecución concreto, habría que recurrir a mecanismos de sincronización explícita como semáforos (`Semaphore`), cerrojos (`ReentrantLock`), barreras (`CountDownLatch`) o encadenamiento de futuros (`CompletableFuture`).

**6. ¿Qué problema te costó más depurar? Explica el síntoma, la causa y cómo lo encontraste.**  
El desalineamiento visual de las columnas de la consola. El síntoma era que la traza quedaba desordenada según la longitud del nombre del módulo. La causa era la concatenación simple con cadenas `+`. Lo solucioné investigando las posibilidades de `System.out.printf` y probando especificadores de ancho fijo (`%-13s`).

**7. Si hubiera 500 tareas, ¿seguiría teniendo sentido crear un `Thread` por tarea? ¿Qué problema podría aparecer?**  
No tendría sentido. Crear 500 objetos `Thread` saturaría la memoria del sistema (cada hilo reserva su propia pila de ejecución) y provocaría una caída drástica del rendimiento debido al sobrecoste por cambios de contexto (*context switching*) del procesador. En ese escenario debe utilizarse un pool de hilos (`ExecutorService` / `ThreadPoolExecutor`) o hilos virtuales (*Virtual Threads* de Java 21+).

### 7.2 Estados de los hilos

**8. ¿Qué estados del ciclo de vida observaste y qué hacía cada hilo cuando estaba en ese estado?**  
- `NEW`: El hilo se instancia (`new Thread(...)`) pero aún no se le llama a `start()`.
- `RUNNABLE`: Se invocó `start()`. El hilo está listo para ejecutarse o ejecutándose en CPU.
- `TIMED_WAITING`: El hilo ejecuta `Thread.sleep(latencia)` y queda suspendido temporalmente.
- `TERMINATED`: El método `run()` completó su instrucción final y el hilo liberó sus recursos.

### 7.3 ArrayList y prioridades

**9. ¿Qué dificultad tuviste al gestionar el `ArrayList<Thread>`? ¿Por qué hay un bucle para `start()` y otro para `join()`?**  
La principal dificultad inicial fue comprender la necesidad de separar el recorrido de la lista. Se necesitan dos bucles distintos porque el primer bucle "dispara" todas las tareas en paralelo con `start()`, y el segundo bucle actúa como una barrera de retención donde `main` espera a que cada elemento de la colección termine con `join()`.

**10. ¿Qué diferencias observaste al asignar prioridades distintas? Apóyate en la tabla de ejecuciones.**  
No se observaron diferencias significativas en el orden de finalización ni en los tiempos absolutos. Módulos con `MIN_PRIORITY` completaron su tarea antes que módulos con `MAX_PRIORITY` si su latencia aleatoria era inferior.

**11. Si no viste diferencia o fue pequeña, ¿a qué crees que se debe?**  
Se debe a que los hilos pasan el 99% de su ciclo de vida en estado `TIMED_WAITING` debido al `Thread.sleep()`. Al no haber una carga intensiva de cálculo en CPU (*CPU-bound*), el planificador del sistema operativo no necesita penalizar a los hilos de menor prioridad.

**12. ¿Puede un programador fiarse de las prioridades de Java para garantizar que un hilo se ejecute antes? Justifica tu respuesta.**  
No. En la especificación oficial de Java, las prioridades son sugerencias (*hints*) no vinculantes. Su comportamiento real depende de la implementación de la JVM, de cómo mapee las prioridades al sistema operativo subyacente y de la arquitectura de la CPU.

---

## 🌍 8. Mundo real

Un ejemplo claro es el **módulo de arranque de una aplicación móvil de movilidad o streaming (como Uber o Netflix)**. 

Al abrir la app, el backend carga en paralelo: el token de autenticación del usuario, la configuración de la interfaz, el mapa/catálogo principal y la telemetría de analítica. El usuario puede interactuar con la pantalla inmediatamente en cuanto cargan los datos críticos de sesión y catálogo, mientras que la analítica y las portadas secundarias terminan de recibirse asíncronamente en segundo plano.

---

## 🪞 9. Autoevaluación

| Puedo explicar a un compañero… | 🔴 No | 🟡 Más o menos | 🟢 Sí |
|---|:-:|:-:|:-:|
| Qué son `Runnable` y `Thread` | ☐ | ☐ | ☒ |
| Por qué `start()` no espera a que termine el hilo | ☐ | ☐ | ☒ |
| Qué hace `join()` y dónde lo he puesto | ☐ | ☐ | ☒ |
| Qué estados tiene un hilo y cuándo cambia | ☐ | ☐ | ☒ |
| Por qué el orden de finalización puede variar | ☐ | ☐ | ☒ |
| Qué son las prioridades y qué garantizan (o no) | ☐ | ☐ | ☒ |
| Qué es un hilo demonio | ☐ | ☐ | ☒ |

**Lo que haría diferente si empezara de nuevo:** Estudiar primero el formateo de consola con `printf` para no perder tiempo en arreglos estéticos a mitad del desarrollo y añadir un hilo demonio supervisor para monitorizar el estado con `getState()`.  
**Lo que todavía no tengo claro y quiero preguntar en clase:** Cómo se comportan las prioridades de Java cuando tenemos una carga que consume el 100% de la CPU en un bucle cerrado en comparación con tareas bloqueantes por I/O.

---

## 🤝 10. Declaración de autoría y aprendizaje

- [x] Confirmo que he diseñado, programado y depurado este código aplicando mi propio razonamiento, y que puedo explicarlo línea a línea.
- [x] Confirmo que el vídeo de defensa técnica dura menos de 3 minutos y está grabado con mi propia voz.

---

## 📂 11. Estructura del proyecto

```text
ProcesosHilos/
├── pom.xml                                → Configuración Maven del proyecto Java
├── package.json                           → Scripts y dependencias del workspace React
├── web/                                   → Aplicación React/Vite del dashboard
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   └── index.css
│   └── vite.config.ts
├── src/main/java/org/example/UDITflix/
│   ├── MainUDITflix.java                  → Orquestador principal (start, join, métricas)
│   ├── TareaDescarga.java                 → Tarea ejecutable de cada módulo (Runnable)
│   └── uditflix_reto_3_dashboard-2.tsx    → Interfaz del simulador web
└── README.md
```

El dashboard React simula visualmente los dos modos desde el navegador. La ejecución Java real se realiza por separado mediante `MainUDITflix`.