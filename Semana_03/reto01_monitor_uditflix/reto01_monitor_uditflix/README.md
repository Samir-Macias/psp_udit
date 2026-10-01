# README · Monitor del Catálogo de UDITflix

* **Módulo:** 0490 · Programación de Servicios y Procesos
* **Autor/a:** Samir Adrian Macías Hernández
* **Reto:** ☐ Reto A (vídeos) · ☒ Reto B (contenidos)
* **Tecnología:** Java + `ProcessBuilder` (procesos del sistema operativo)
* **RA vinculado:** RA1 · Programación de aplicaciones compuestas por varios procesos

> 💡 **Cómo usar este README:** No es un trámite que se rellena al final. Es tu cuaderno de pensamiento durante el reto. Las secciones marcadas con 🧠 sirven para reflexionar sobre cómo se ha estructurado la solución.

---

## 📺 Qué es esta app

Es un programa de consola en Java que simula el monitor de disponibilidad para el catálogo de **UDITflix**. 

Recorre una matriz con 5 tipos de contenido (*Series, Películas, Documentales, Anime e Infantil*) y lanza de forma dinámica un proceso externo (`ping`) hacia la dirección de comprobación asociada a cada uno. Para cada contenido, el monitor:
1. Muestra el nombre de la sección.
2. Lanza el proceso del sistema operativo y muestra su **PID** único.
3. Vacía el búfer de salida del proceso (`InputStream`).
4. Captura el código de salida mediante `waitFor()` para determinar e imprimir si el servicio está **ACTIVO** o **CAÍDO**.

![Ejecución del Monitor UDITflix](src/main/java/org/example/image/image.png)

---

## 🧠 Antes de empezar: planifico

* **Con mis palabras, ¿qué me pide el reto?**  
  Crear una aplicación en Java que tome 5 servicios de un catálogo, haga una comprobación de red individual a cada uno ejecutando el comando `ping` del sistema operativo, y muestre en consola el PID del proceso y si está funcional o caído.

* **¿Qué parte de la píldora de clase creo que voy a reutilizar?**  
  Toda la configuración inicial de `ProcessBuilder`, la redirección de errores `redirectErrorStream(true)`, el uso de `getInputStream()` con `BufferedReader` y la sincronización del proceso con `waitFor()`.

* **¿Qué parte me da más respeto o no sé por dónde empezar?**  
  Integrar el `ProcessBuilder` dentro del bucle `for` garantizando que el buffer de lectura (`BufferedReader`) se consuma completamente en cada iteración para que la ejecución no se bloquee ni se mezclen los datos entre iteraciones.

* **Mi plan en 3-4 pasos, en orden:**
  1. Definir la matriz bidimensional `String[][]` con los contenidos y sus direcciones IP de prueba.
  2. Diseñar un bucle `for` que recorra la matriz e instancie un `ProcessBuilder` dinámico por cada fila.
  3. Leer la salida del proceso con `BufferedReader` y obtener el código de salida con `waitFor()`.
  4. Evaluar el resultado con una condición `if` para imprimir el estado del servicio y cerrar recursos.

* **Predicción:**  
  Si todas las IP fueran `127.0.0.1`, todos los elementos saldrían como `ESTADO: ACTIVO` porque `127.0.0.1` es el *loopback* local y siempre responde. Si todas fueran IP inexistentes (ej. `10.255.255.1`), el comando fallaría dando un código distinto de cero, resultando en `ESTADO: CAÍDO` para todas.

---

## 🎯 Objetivo del reto

Partir de lo aprendido en la píldora (lanzar un único proceso) y dar el salto a gestionar múltiples procesos secuenciales utilizando estructuras de datos (`String[][]`) y bucles de control (`for`).

---

## 🛠️️ Componentes y conceptos utilizados

| Componente / concepto | Para qué se usa en esta app | Con mis palabras |
| :--- | :--- | :--- |
| **`ProcessBuilder`** | Prepara la orden (`ping -c 1 ip`) que se enviará al OS. | Es el encargado de configurar la orden del sistema antes de lanzarla. |
| **`start()`** | Lanza el proceso del sistema. | Pulsa el "botón de inicio" para ejecutar el comando en un hilo separado. |
| **`Process`** | Representación del proceso en ejecución. | El objeto Java que permite interactuar con el programa nativo. |
| **`pid()`** | Identificador del proceso. | Es la matrícula numérica que el sistema le asigna a ese `ping` en concreto. |
| **`getInputStream()`** | Recupera la salida del proceso. | La tubería por donde fluye el texto que escribe el comando en consola. |
| **`BufferedReader` + `readLine()`** | Lee el flujo de texto. | Herramienta que lee y vacía la salida del proceso línea por línea. |
| **`waitFor()`** | Pausa Java hasta que el proceso termina. | Ordena a Java esperar a que el comando termine y devuelva su resultado. |
| **`Matriz String[][]`** | Almacena el catálogo de datos. | Una tabla de 2 columnas donde guardo el nombre del contenido y su IP. |
| **`Bucle for`** | Controla el flujo de repetición. | La estructura que repite todo el análisis para cada fila del catálogo. |

**¿Qué contiene cada posición de mi matriz?**
* `matriz[i][0]` → Nombre del tipo de contenido (ej: *"Series"*, *"Películas"*).
* `matriz[i][1]` → Dirección IP de comprobación (ej: *"127.0.0.1"*, *"10.255.255.1"*).

---

## 🚀 Cómo ejecutar el proyecto

1. Clonar el repositorio de GitHub o abrir el proyecto en **IntelliJ IDEA**.
2. Verificar que la estructura de paquetes coincida con `org.example.MonitorUditflix`.
3. Ejecutar la clase principal `MonitorUditflix.java`.

⚠️ **Nota de compatibilidad de SO:**  
El comando `ping` utiliza `-c` para limitar los intentos en **macOS y Linux**, mientras que en **Windows** se utiliza `-n`.  
* Este proyecto ha sido probado en: **macOS**.

---

## 🔍 Mientras programo: mi diario de decisiones

| Qué intentaba | Qué pasó realmente | Qué hice / qué aprendí |
| :--- | :--- | :--- |
| Probar el `ProcessBuilder` fuera del bucle. | Solo comprobaba un servicio estático. | Moví la instanciación de `ProcessBuilder` dentro del `for` pasándole la variable `ip`. |
| Evitar que el programa se quedara colgado. | Descubrí que sin el `while` de lectura, el búfer de entrada se llenaba. | Mantuve la lectura completa con `readLine()` para vaciar el stream antes del `waitFor()`. |
| Formatear la salida por consola. | Aparecía todo el texto bruto del comando `ping`. | Consumí las líneas en el `while` sin imprimirlas para mantener la interfaz limpia. |

---

## 🧭 De la píldora al reto: cómo di el salto

* **¿Qué tenía la píldora que ya no me sirve tal cual?**  
  La píldora ejecutaba una comprobación única con valores fijos dentro del `main`. No servía para procesar múltiples ítems dinámicamente.

* **¿Qué he tenido que añadir para repetirlo cinco veces? ¿Por qué esa estructura y no otra?**  
  Una matriz bidimensional `String[][]` para asociar cada categoría con su IP y un bucle `for`. Se eligió esta estructura por ser la más eficiente para relacionar dos atributos del mismo tipo.

* **¿Qué parte del código es exactamente igual en todas las vueltas del bucle y qué parte cambia?**  
  * **Igual:** La llamada a `pb.redirectErrorStream(true)`, la creación del `BufferedReader`, el bucle de vaciado y el `waitFor()`.
  * **Cambia:** El valor del parámetro IP enviado a `ProcessBuilder`, el nombre del contenido impreso y el PID generado por el sistema.

* **Si mañana UDITflix tuviera 500 elementos en lugar de 5, ¿qué tendría que cambiar en mi código?**  
  El bucle `for` funcionaría sin cambios gracias a `catalogo.length`. Sin embargo, a nivel de arquitectura, realizar 500 pings secuenciales sería muy lento. Habría que implementar concurrencia (`ExecutorService` / hilos) para realizar las comprobaciones en paralelo y cargar los datos desde un archivo externo (JSON/CSV) o base de datos.

---

## 🧠 Qué he aprendido

* **Hilo vs. proceso:** Un proceso es un programa independiente en ejecución con su propio espacio de memoria aislado asignado por el sistema operativo, mientras que un hilo es una unidad de ejecución más ligera que coexiste dentro del mismo proceso.
* **PID:** Es el número entero con el que el sistema operativo identifica de forma única a cada proceso activo. Cambia en cada ejecución porque el kernel asigna PIDs libres dinámicamente.
* **`start()` vs. `waitFor()`:** `start()` inicia la ejecución del subproceso en segundo plano sin detener el flujo de Java, mientras que `waitFor()` bloquea el hilo principal de Java hasta que el subproceso finalice.
* **Código de salida:** `0` indica ejecución exitosa del comando nativo (en este caso, la IP respondió). Un número mayor a `0` indica un error (timeout, destino inalcanzable, etc.).
* **Fiabilidad del sistema:** El estado `ACTIVO`/`CAÍDO` depende de que el host acepte paquetes ICMP. Podría haber falsos negativos si un servidor está activo pero tiene un firewall que bloquea las peticiones `ping`.

---

## 🐞 Dificultades y cómo las resolví

* **Dificultad 1:**  
  * **Qué síntoma vi:** Exposición no deseada de credenciales en el terminal durante el control de versiones con Git.
  * **Cuál era la causa real:** El remoto de Git contenía un token de autenticación en la URL (`https://ghp_...`).
  * **Cómo la encontré:** Al revisar la traza de ejecución del comando `git push` en la terminal.
  * **Cómo evitaré que me vuelva a pasar:** Configurando el gestor de credenciales nativo del sistema operativo (`osxkeychain`) y utilizando URL HTTPS limpias sin credenciales embebidas.

---

## 🪞 Autoevaluación

| Puedo explicar a un compañero... | 🔴 No | 🟡 Más o menos | 🟢 Sí |
| :--- | :---: | :---: | :---: |
| Qué hace `ProcessBuilder` | ☐ | ☐ | ☑ |
| Qué hace `start()` y por qué no espera | ☐ | ☐ | ☑ |
| Qué representa el PID | ☐ | ☐ | ☑ |
| Para qué sirve `getInputStream()` | ☐ | ☐ | ☑ |
| Qué hace `waitFor()` y qué devuelve | ☐ | ☐ | ☑ |
| Qué hay en cada posición de la matriz | ☐ | ☐ | ☑ |
| Qué hace el `for` en mi programa | ☐ | ☐ | ☑ |

* **Mi predicción del principio, ¿acerté?**  
  Sí, se confirmó que las peticiones a `127.0.0.1` retornan código `0` (`ACTIVO`) y las direcciones no enrutables como `10.255.255.1` retornan error (`CAÍDO`).

* **Lo que haría diferente si empezara de nuevo:**  
  Parametrizar las banderas del comando `ping` según el sistema operativo detectado (`System.getProperty("os.name")`) para hacer el código totalmente multiplataforma entre Windows y macOS/Linux.

* **Lo que todavía no tengo claro y quiero preguntar en clase:**  
  Cómo gestionar de forma óptima la interrupción de procesos en Java cuando un subproceso se queda bloqueado de forma indefinida por un fallo de red.

---

## 🤝 Declaración de autoría

Este reto no permite herramientas de generación de código mediante IA. Consulté únicamente: la píldora de clase, mis apuntes, la documentación de Java e IntelliJ IDEA.

* [x] **Confirmo que el código es mío y que puedo explicarlo línea a línea.**

---

## 📂 Estructura del proyecto

```text
psp_udit/
├── Semana_03/
│   └── CentinelaDemo/
│       ├── .gitignore
│       ├── pom.xml
│       └── src/
│           └── main/
│               └── java/
│                   └── org/
│                       └── example/
│                           └── MonitorUditflix.java
└── README.md

