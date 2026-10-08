# 🚀 Reto 2: Pipeline de Auditoría UDITversum (Fase 1)
![Captura de pantalla 2026-10-08 a las 21.22.29.png](../../../../../../../../var/folders/ct/0gm3rndn4js6x_vh2smj27k40000gn/T/TemporaryItems/NSIRD_screencaptureui_C158XL/Captura%20de%20pantalla%202026-10-08%20a%20las%2021.22.29.png)


* 📘 **Módulo:** `0490 · Programación de Servicios y Procesos`
* 🧑‍💻 **Autor/a:** Samir Adrian Macías Hernández
* ⚙️ **Tecnología:** Java + `ProcessBuilder` (procesos del sistema operativo macOS)
* 🎯 **RA vinculado:** RA1 · Programación de aplicaciones compuestas por varios procesos

---

## 📺 Qué es esta app

Es un programa de consola que simula la **primera fase de una auditoría de UDITversum**. Su flujo de trabajo es el siguiente:

1. **Lanza** dos comprobaciones (`ping`) a la vez, cada una en su propio proceso del sistema operativo.
2. **Espera** a que ambas terminen.
3. **Lee** el código de salida de cada una.
4. **Toma una decisión** según el resultado combinado y abre una aplicación del sistema (`TextEdit`) o un recurso externo (video en YouTube).

### Esquema de Ejecución

```text
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
```

---

## 🧠 Antes de empezar: planifico

> **¿Qué me pide el reto?**  
> Ejecutar dos órdenes `ping` de forma simultánea en el sistema operativo, recoger sus códigos de terminación para saber si ambas tuvieron éxito o no, y dependiendo de eso abrir la aplicación correspondiente o una dirección URL externa sin bloquear la ejecución en serie antes del lanzamiento.

> **¿Qué parte del Reto 1 voy a reutilizar?**  
> La instanciación y ejecución de un proceso individual con `ProcessBuilder`, la invocación de `.start()` y la captura de excepciones obligatorias (`IOException`).

> **¿Qué es nuevo respecto al Reto 1?**  
> Gestionar dos objetos `Process` distintos a la vez y entender dónde colocar los `.waitFor()` para no romper la ejecución paralela y convertirla por error en secuencial.

### Mi plan en 5 pasos
1. Instanciar los dos `ProcessBuilder` para los comandos `ping` en macOS.
2. Ejecutar `.start()` consecutivamente en ambos para que queden corriendo en segundo plano al mismo tiempo.
3. Llamar a `.waitFor()` en cada uno para obtener los códigos de salida.
4. Evaluar mediante `if (codigoSalidap1 == 0 && codigoSalidap2 == 0)` si abrir `TextEdit` o el video de YouTube en el navegador web.
5. Capturar explícitamente `IOException` e `InterruptedException`.

### Predicciones

| Escenario | Resultado ping A | Resultado ping B | Recurso que se abre |
| :--- | :---: | :---: | :--- |
| **Los dos pings a 127.0.0.1** | `0` | `0` | `TextEdit` |
| **Un ping válido y otro inexistente** | `0` | `!= 0` | Video de YouTube |
| **Los dos pings inexistentes** | `!= 0` | `!= 0` | Video de YouTube |

* **Tiempo estimado:** Al lanzarse en paralelo, el programa tardará aproximadamente lo que tarde el ping más lento (ej. **3 segundos**). Si fuera secuencial, tardaría el doble (ej. **6 segundos**).

---

## 🎯 Objetivo del reto

Dar el salto de gestionar un proceso tras otro a coordinar varios procesos simultáneos, aplicando:
* Creación de procesos con `ProcessBuilder` y `.start()`.
* Ejecución concurrente antes de realizar bloqueos.
* Sincronización con `.waitFor()` y lectura del código de salida.
* Lógica condicional (`if` con `&&` / `||`).
* Gestión estricta de errores con `try/catch` (`IOException`, `InterruptedException`).

---

## 🛠️ Componentes y conceptos utilizados

| Componente | Para qué se usa | Con mis palabras |
| :--- | :--- | :--- |
| **`ProcessBuilder`** | Prepara la orden para el sistema operativo. | Es la plantilla donde configuras el comando antes de arrancar. |
| **`start()`** | Lanza el proceso sin esperar. | Ordena al SO que cree el subproceso; Java sigue a la siguiente línea. |
| **`Process`** | Controla cada proceso en marcha. | El conector para monitorear o esperar ese proceso concreto en el SO. |
| **`waitFor()`** | Bloquea el programa hasta que termina. | Pausa el hilo de Java hasta que el programa externo entrega su resultado. |
| **Exit Code** | Indica cómo terminó (`0` = éxito). | Número de respuesta: 0 significa sin errores; otro número es un fallo. |
| **`&&` (AND)** | Ambas condiciones verdaderas. | Exige que A y B se cumplan; si uno falla, toda la condición es falsa. |
| **`\|\|` (OR)** | Al menos una condición verdadera. | Con que se cumpla cualquiera de las dos, da el visto bueno. |
| **`try/catch`** | Captura errores imprevistos. | Red de seguridad para manejar fallos de ejecución sin romper la app. |
| **`InterruptedException`** | Gestiona interrupciones en esperas. | Salta si otro hilo cancela la pausa mientras se estaba en `waitFor()`. |

---

## 🔀 Secuencial vs paralelo

**Orden de llamadas en mi código:**
```java
// Lanzamiento en paralelo (sin waitFor entre medias)
Process p1 = new ProcessBuilder("ping", "-c", "1", "127.0.0.1").start();
Process p2 = new ProcessBuilder("ping", "-c", "1", "error.invalid").start();

// Bloqueo y recolección de resultados conjuntos
int codigoSalidap1 = p1.waitFor();
int codigoSalidap2 = p2.waitFor();
```

---

## 🔢 Tabla de verdad de mi decisión

| `p1` (A) | `p2` (B) | ¿A OK? | ¿B OK? | Condición (`p1 == 0 && p2 == 0`) | Recurso abierto |
| :---: | :---: | :---: | :---: | :---: | :--- |
| `0` | `0` | Sí | Sí | `true` | **`TextEdit`** |
| `0` | `!= 0` | Sí | No | `false` | **Video de YouTube** |
| `!= 0` | `0` | No | Sí | `false` | **Video de YouTube** |
| `!= 0` | `!= 0` | No | No | `false` | **Video de YouTube** |

> **Nota sobre operadores:** Si cambiara `&&` por `||`, las filas 2 y 3 pasarían a ser `true`, y se abriría `TextEdit` con que al menos un ping funcionara.

---

## 🚀 Cómo ejecutar el proyecto

1. Abre el proyecto en **IntelliJ IDEA**.
2. Verifica que estás en **macOS**.
3. Ejecuta la clase principal `PipelineAuditoria.java`.

---

## 🔍 Diario de decisiones

| Qué intentaba | Qué pasó realmente | Qué hice / qué aprendí |
| :--- | :--- | :--- |
| Abrir la app con su nombre directo. | Lanzaba `IOException` por no encontrar el binario. | Aprendí a usar el comando nativo `open -a <App>` en Mac. |
| Abrir un enlace de YouTube al fallar el ping. | Necesitaba el navegador por defecto. | Usé `open <URL>`, que en macOS detecta automáticamente el navegador predeterminado. |

---

## 🧠 Análisis técnico

### 1. Secuencial vs paralelo
El paralelismo se logra llamando a `.start()` consecutivamente en `p1` y `p2`. Este método no bloquea el hilo principal; envía la orden al Kernel del SO y continúa. Si pusiera `p1.waitFor()` antes de lanzar `p2`, Java se detendría forzando una ejecución secuencial.

### 2. El código de salida (exit code)
`.waitFor()` devuelve un `int`. El SO define `0` como éxito (ausencia de errores). Cualquier valor distinto a `0` representa que el comando se ejecutó pero falló en su propósito interno.

### 3. Lógica condicional
Se utiliza `&&` porque se requiere estricta conectividad en ambos nodos para validar la auditoría. Si falla cualquiera, el programa asume un fallo general y entra al `else` para abrir el video.

### 4. Gestión de excepciones
`IOException` ocurre cuando el SO es incapaz de encontrar o ejecutar el binario (ej. un comando mal escrito). Esto es muy distinto a un ping fallido, donde el comando sí existe y arranca, pero devuelve un *exit code* distinto de cero.

---

## 🤝 Declaración de autoría y aprendizaje

- [x] Confirmo que he diseñado y programado este código aplicando mi propio razonamiento.
- [x] Entiendo el salto técnico entre ejecución secuencial y paralela.