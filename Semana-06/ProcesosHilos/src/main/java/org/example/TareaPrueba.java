package org.example;



public class TareaPrueba implements Runnable {

    // Nombre que identifica la tarea, ejm HILO-A

    private final String nombre;

    public TareaPrueba (String nombre) {
        this.nombre = nombre;
    }

    @Override
    public void run() {
        // Repetimos el bloque tres veces
        for (int i = 1 ; i <= 3; i++) {
            // Mostrar el nombre de la tarea,
            // el hilo que ejecuta esta instruccion y el paso
            // Con start(), podremos ver el HILO-A o HILOB
            // Con run() llamado desde main, veremos "main".

            System.out.println(
                    nombre + " [" +
                            Thread.currentThread().getName() +
                            "] - Paso: " + i
            );

            try {
                // Detiene temporalmente el hilo actual durante 100 milisegundos
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }
}
