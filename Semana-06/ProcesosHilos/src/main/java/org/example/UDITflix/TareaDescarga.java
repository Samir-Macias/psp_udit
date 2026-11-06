package org.example.UDITflix;

/**
 * Tarea que simula la descarga de un módulo de UDITflix.
 *
 * Implementa Runnable: esta clase define QUÉ hace el hilo; el Thread define
 * CÓMO se ejecuta. La descarga se simula con Thread.sleep(latencia).
 */
public class TareaDescarga implements Runnable {

    private final String modulo;
    private final int latencia;

    public TareaDescarga(String modulo, int latencia) {
        this.modulo = modulo;
        this.latencia = latencia;
    }

    @Override
    public void run() {
        String hiloActual = Thread.currentThread().getName();
        int prioridad = Thread.currentThread().getPriority();

        System.out.printf("--> [%-13s | Prioridad=%-2d] Iniciando: %-19s (%d ms)%n",
            hiloActual, prioridad, modulo, latencia);

        try {
            // Simula el trabajo; mientras duerme, el hilo está en estado TIMED_WAITING
            Thread.sleep(latencia);
        } catch (InterruptedException e) {
            System.err.printf("!--> [%-13s | Prioridad=%-2d] %-19s CANCELADO.%n",
                hiloActual, prioridad, modulo);
            Thread.currentThread().interrupt(); // restaura el flag de interrupción
            return; // sin este return se imprimiría "COMPLETADO" aunque se cancelara
        }

        System.out.printf("<-- [%-13s | Prioridad=%-2d] ¡COMPLETADO! %s%n",
            hiloActual, prioridad, modulo);
    }

    public String getModulo() {
        return modulo;
    }

    public int getLatencia() {
        return latencia;
    }
}
