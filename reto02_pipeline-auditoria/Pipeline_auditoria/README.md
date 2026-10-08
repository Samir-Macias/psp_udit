Reto 2 · Pipeline de Auditoría UDITversum (Fase 1)
![Captura de pantalla 2026-10-08 a las 21.04.42.png](../../../../../../../../var/folders/ct/0gm3rndn4js6x_vh2smj27k40000gn/T/TemporaryItems/NSIRD_screencaptureui_O7mUu1/Captura%20de%20pantalla%202026-10-08%20a%20las%2021.04.42.png)
Módulo: 0490 · Programación de Servicios y Procesos
Autor/a: Samir Adrian Macías Hernández
Tecnología: Java + ProcessBuilder (procesos del sistema operativo macOS)
RA vinculado: RA1 · Programación de aplicaciones compuestas por varios procesos
📺 Qué es esta app
Un programa de consola que simula la primera fase de una auditoría de UDITversum. El programa:
Lanza dos comprobaciones (ping) a la vez, cada una en su propio proceso del sistema operativo.
Espera a que ambas terminen.
Lee el código de salida de cada una.
Según el resultado combinado, toma una decisión y abre una aplicación del sistema (TextEdit) o un recurso externo (video en YouTube).
Plaintext
┌──────────────┐
│  Mi programa │
│   (Java)     │
└──────┬───────┘
│ start()          start()
┌──────┴──────┐    ┌──────┴──────┐
▼                         ▼
┌───────────┐             ┌───────────┐
│  ping A   │             │  ping B   │   ← corren a la vez (paralelo)
└─────┬─────┘             └─────┬─────┘
│ waitFor()               │ waitFor()
└───────────┬─────────────┘
▼
¿códigos de salida?
│
┌───────────┴───────────┐
▼                       ▼
TextEdit             Video de YouTube
🧠 Antes de empezar: planifico
Con mis palabras, ¿qué me pide el reto?
Ejecutar dos órdenes ping de forma simultánea en el sistema operativo, recoger sus códigos de terminación para saber si ambas tuvieron éxito o no, y dependiendo de eso abrir la aplicación correspondiente o una dirección URL externa sin bloquear la ejecución en serie antes del lanzamiento.
¿Qué parte del Reto 1 voy a reutilizar tal cual?
La instanciación y ejecución de un proceso individual con ProcessBuilder, la invocación de .start() y la captura de excepciones obligatorias (IOException).
¿Qué es nuevo respecto al Reto 1 y me da más respeto?
Gestionar dos objetos Process distintos a la vez y entender dónde colocar los .waitFor() para no romper la ejecución paralela y convertirla por error en secuencial.
Mi plan en 4-5 pasos, en orden:
Instanciar los dos ProcessBuilder para los comandos ping en macOS.
Ejecutar .start() consecutivamente en ambos para que queden corriendo en segundo plano al mismo tiempo.
Llamar a .waitFor() en cada uno para obtener codigoSalidap1 y codigoSalidap2.
Evaluar mediante if (codigoSalidap1 == 0 && codigoSalidap2 == 0) si abrir TextEdit o el video de YouTube en el navegador web (abrirUrlMac).
Capturar explícitamente IOException e InterruptedException.
Predicciones
Escenario	¿Qué código de salida espero en cada ping?	¿Qué aplicación/recurso se abre?
Los dos pings a 127.0.0.1	p1: 0, p2: 0	TextEdit
Un ping válido (127.0.0.1) y otro inexistente (error.invalid)	p1: 0, p2: != 0 (ej. 2 o 68)	Video de YouTube (Navegador)
Los dos pings a direcciones inexistentes	p1: != 0, p2: != 0	Video de YouTube (Navegador)
Predicción de tiempo: Si cada ping tarda unos 3 segundos, mi programa tardará aproximadamente 3 segundos en total si se lanzan en paralelo. Si se lanzaran uno detrás de otro (secuencial), tardaría 6 segundos.
🎯 Objetivo del reto
Dar el salto de gestionar un proceso tras otro a coordinar varios procesos simultáneos, aplicando:
Creación de procesos con ProcessBuilder y .start().
Ejecución concurrente: lanzar ambos procesos antes de esperar a ninguno.
Sincronización con .waitFor() y lectura del código de salida.
Lógica condicional (if con && / ||) para decidir en función de varios resultados.
Gestión de errores con try/catch (IOException, InterruptedException).
🛠️ Componentes y conceptos utilizados
Componente / concepto	Para qué se usa en esta app	Con mis palabras
ProcessBuilder	Prepara la orden que se enviará al sistema operativo.	Es como la plantilla donde configuras el comando y sus argumentos antes de darle al botón de arrancar.
start()	Lanza de verdad el proceso y devuelve el control enseguida, sin esperar.	Ordena al sistema operativo que cree el subproceso y la línea de código siguiente en Java se ejecuta de inmediato.
Process	Objeto con el que controlo cada proceso ya en marcha.	Es el conector que nos da Java para monitorear, esperar o matar ese proceso concreto en el SO.
waitFor()	Bloquea mi programa hasta que ese proceso termina y devuelve su código de salida.	Pausa el hilo de Java en esa línea hasta que el programa externo acaba su trabajo y entrega su resultado.
Código de salida (int)	Dice cómo terminó el proceso: 0 = éxito, distinto de 0 = fallo.	Un número de respuesta: si es 0 la tarea terminó sin errores; si es otro número representa un tipo de fallo.
&& (AND)	Se cumple solo si las dos condiciones son verdaderas.	Exige que se cumpla A y también B; si uno falla, toda la condición es falsa.
**		(OR)**
try/catch	Captura errores que Java no puede evitar.	Es una red de seguridad para manejar fallos imprevistos en tiempo de ejecución sin que el programa rompa.
InterruptedException	Excepción que obliga a gestionar waitFor() por si el hilo es interrumpido.	Error que salta si otro hilo cancela o interrumpe la espera de Java mientras estaba bloqueado en waitFor().
¿Cómo se llaman mis dos objetos Process y qué lanza cada uno?
p1: new ProcessBuilder("ping", "-c", "1", "127.0.0.1").start()
p2: new ProcessBuilder("ping", "-c", "1", "error.invalid").start()
🔀 Secuencial vs paralelo: el corazón de este reto
Mi orden real de llamadas, copiado de mi código:
Java
// Lanzamiento en paralelo (sin waitFor entre medias)
Process p1 = new ProcessBuilder("ping", "-c", "1", "127.0.0.1").start();
Process p2 = new ProcessBuilder("ping", "-c", "1", "error.invalid").start();

// Bloqueo y recolección de resultados
int codigoSalidap1 = p1.waitFor();
int codigoSalidap2 = p2.waitFor();
🔢 Tabla de verdad de mi decisión
Código ping A	Código ping B	¿Ping A OK?	¿Ping B OK?	Condición (codigoSalidap1 == 0 && codigoSalidap2 == 0)	Recurso que abro
0	0	Sí	Sí	true	TextEdit
0	!= 0	Sí	No	false	Video de YouTube
!= 0	0	No	Sí	false	Video de YouTube
!= 0	!= 0	No	No	false	Video de YouTube
¿Cambiaría el resultado de alguna fila si cambiara && por ||? ¿En cuáles?
Sí, cambiaría en las filas 2 y 3. Con ||, si al menos uno de los pings devolviera 0, la condición se evaluaría a true y abriría TextEdit en lugar del video de YouTube.
🚀 Cómo ejecutar el proyecto
Clonar o abrir el proyecto en IntelliJ IDEA.
Esperar a que indexe el proyecto.
Ejecutar (▶) la clase principal org.example.PipelineAuditoria.
⚠️ Dependencia del sistema operativo: Probad exclusivamente en macOS. Utiliza los parámetros ping -c 1 y los comandos open -a TextEdit / open <URL>.
🔍 Mientras programo: mi diario de decisiones
Qué intentaba	Qué pasó realmente	Qué hice / qué aprendí
Abrir la app directamente con su nombre en Mac	Lanzaba IOException por no encontrar el binario directo en el PATH	Aprendí a usar el comando nativo open -a <NombreApp> con ProcessBuilder.
Abrir un enlace de YouTube al fallar el ping	Quería que se abriera el navegador por defecto sin especificar Chrome o Safari	Utilicé new ProcessBuilder("open", url).start(), aprovechando que en macOS open detecta las URL e invoca el navegador predeterminado.
🧠 Análisis técnico (preparación para la defensa)
1. Secuencial vs paralelo
   Las líneas exactas que garantizan el paralelismo son las llamadas consecutivas a .start():
   Java
   Process p1 = new ProcessBuilder("ping", "-c", "1", "127.0.0.1").start();
   Process p2 = new ProcessBuilder("ping", "-c", "1", "error.invalid").start();
   .start() no bloquea el hilo principal; envía la orden al Kernel del sistema operativo y continúa inmediatamente. Si pusiera p1.waitFor() justo antes de declarar p2, Java se detendría esperando a que p1 terminara en el SO antes de iniciar p2, haciendo la ejecución secuencial y duplicando el tiempo total.
2. El código de salida (exit code)
   .waitFor() devuelve un entero (int). El estándar del SO define 0 para una finalización limpia y exitosa. Se eligió el 0 para el éxito porque representa la ausencia de errores, dejando todos los demás enteros positivos para catalogar diferentes causas o tipos de fallos.
3. Lógica condicional
   Java
   if (codigoSalidap1 == 0 && codigoSalidap2 == 0) {
   System.out.println("✔ Ambos pings correctos. Abriendo TextEdit...");
   abrirAplicacionMac("TextEdit");
   } else {
   System.out.println("⚠ Al menos un ping ha fallado. Abriendo Calculadora...");
   abrirUrlMac("https://www.youtube.com/watch?v=NtTmFtxVWsI");
   }
   Se utiliza && porque se requiere estricta salud de red en ambos nodos para abrir la aplicación principal (TextEdit). Si falla cualquiera, la auditoría entra al bloque else abriendo el video en YouTube.
4. Gestión de excepciones
   Se entra en el catch (IOException e) si el sistema operativo es incapaz de instanciar o encontrar el ejecutable en el disco (por ejemplo, si intentáramos ejecutar pizzbuilder o un binario inexistente). Esto difiere del código de salida devuelto por waitFor(), el cual se obtiene cuando el ejecutable sí existe y corre, pero sus comprobaciones internas fallan.
   🛡️ Preparación para la defensa: ¿sabría hacer esto en directo?
   [x] Cambiar la condición para que se abra el video de YouTube solo si falla uno de los dos pings.
   [x] Añadir un tercer ping en paralelo y que la decisión dependa de los tres.
   [x] Mostrar el PID de cada proceso al lanzarlo (p1.pid()).
   [x] Medir y mostrar cuántos milisegundos tarda en total el programa (System.currentTimeMillis()).
   [x] Hacer que el programa funcione en macOS (ping -c y open).
   [x] Provocar a propósito una IOException y mostrar un mensaje claro al usuario.
   [x] Explicar qué pasaría si quito el waitFor().
   🧭 Del Reto 1 al Reto 2: cómo di el salto
   ¿Qué hacía mi Reto 1 que aquí ya no me sirve tal cual? Esperar el cierre de cada proceso justo tras su lanzamiento dentro de un flujo secuencial.
   ¿Qué he tenido que cambiar para que dos procesos corran simultáneamente? Separar la fase de arranque de los procesos (invocar todos los .start()) de la fase de sincronización y lectura (invocar todos los .waitFor()).
   ¿Qué ventaja tiene lanzar en paralelo? La ventaja es la reducción del tiempo global de ejecución al aprovechar los núcleos del procesador. El reto técnico es que debes coordinar y sincronizar las respuestas de múltiples subprocesos asíncronos antes de tomar decisiones.
   🧠 Qué he aprendido
   start() vs waitFor(): start() delega la tarea al SO y sigue adelante; waitFor() detiene el hilo Java hasta que el subproceso concluye.
   Paralelismo real: Ocurre porque el sistema operativo gestiona los subprocesos de forma independiente en el procesador sin que Java los fuerce a esperar turno.
   IOException vs ping fallido: IOException salta cuando el sistema operativo no puede arrancar el comando; un ping fallido sí arranca pero retorna un valor != 0.
   🤝 Declaración de autoría y aprendizaje
   [x] Confirmo que he diseñado, programado y depurado este código aplicando mi propio razonamiento, y que puedo explicarlo línea a línea.
   [x] Entiendo que durante la defensa el profesor me pedirá realizar pequeñas modificaciones sobre este código para comprobar mi comprensión del multiproceso.
   📂 Estructura del proyecto
   Plaintext
   src/main/java/org/example/   → PipelineAuditoria.java (clase principal con main)
   README.md                    → Documentación del Reto 2
