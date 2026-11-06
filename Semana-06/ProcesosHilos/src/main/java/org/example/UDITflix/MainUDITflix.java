package org.example.UDITflix;

import java.util.ArrayList;
import java.util.Random;

/**
 * UDITflix · Reto 3: descarga concurrente de módulos con hilos.
 *
 * Lanza cuatro hilos (catálogo, sesión, portadas y analíticas), cada uno con
 * una latencia aleatoria, y compara el tiempo total real con la suma de
 * latencias para evidenciar el beneficio de la concurrencia.
 *
 * Pasos:
 * 1) Crear las tareas (Runnable).
 * 2) Envolver cada tarea en un Thread con nombre propio.
 * 3) Asignar prioridades y lanzar con start() (nunca run(), que no crea hilo).
 * 4) Esperar con join() para no calcular resultados antes de que terminen.
 */
public class MainUDITflix {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("==================================================");
        System.out.println("   UDITflix BACKEND · MOTOR DE TRANSCODIFICACIÓN  ");
        System.out.println("==================================================");

        Random azar = new Random();
        // Latencia simulada aleatoria (1000-4000 ms): el orden de llegada cambia en cada ejecución.
        int latenciaCatalogo = 1000 + azar.nextInt(3001);
        int latenciaSesion = 1000 + azar.nextInt(3001);
        int latenciaPortadas = 1000 + azar.nextInt(3001);
        int latenciaAnaliticas = 1000 + azar.nextInt(3001);

        long inicio = System.currentTimeMillis();

        // 1) Tareas: definen qué hace cada hilo
        ArrayList<TareaDescarga> tareas = new ArrayList<>();
        TareaDescarga tcatalogo;
        TareaDescarga tsesion;
        TareaDescarga tportadas;
        TareaDescarga tanaliticas;
        tareas.add(tcatalogo = new TareaDescarga("catalogo-metadatos", latenciaCatalogo));
        tareas.add(tsesion = new TareaDescarga("sesion-y-perfil", latenciaSesion));
        tareas.add(tportadas = new TareaDescarga("portadas-assets", latenciaPortadas));
        tareas.add(tanaliticas = new TareaDescarga("analiticas", latenciaAnaliticas));

        // 2) Hilos con nombre propio (facilita seguir la traza)
        Thread hcatalogo = new Thread(tcatalogo, "DL-catalogo");
        Thread hsesion = new Thread(tsesion, "DL-sesion");
        Thread hportadas = new Thread(tportadas, "DL-portadas");
        Thread hanaliticas = new Thread(tanaliticas, "DL-analiticas");

        // 3) Prioridades: son solo una sugerencia al planificador, no garantizan el orden
        hcatalogo.setPriority(Thread.MAX_PRIORITY);
        hsesion.setPriority(Thread.MAX_PRIORITY);
        hportadas.setPriority(Thread.NORM_PRIORITY);
        hanaliticas.setPriority(Thread.MIN_PRIORITY);

        ArrayList<Thread> hilos = new ArrayList<>();
        hilos.add(hcatalogo);
        hilos.add(hsesion);
        hilos.add(hportadas);
        hilos.add(hanaliticas);

        // 4) Lanzamiento concurrente
        System.out.println("[MAIN] Lanzando workers...\n");
        for (Thread h : hilos) {
            h.start();
        }

        // 5) Espera: main se bloquea hasta que cada hilo termina
        for (Thread h : hilos) {
            h.join();
        }

        // Métricas: tiempo real transcurrido, latencia máxima y suma secuencial
        long total = System.currentTimeMillis() - inicio;
        int masLento = 0;
        int suma = 0;

        for (TareaDescarga t : tareas) {
            int lat = t.getLatencia();
            suma += lat;
            if (lat > masLento) {
                masLento = lat;
            }
        }

        System.out.println("\n==================================================");
        System.out.println("\n[MAIN] Todos los módulos listos -> LOGIN HABILITADO");
        System.out.println("Tiempo total real:          " + total + " ms");
        System.out.println("Duración del más lento:     " + masLento + " ms");
        System.out.println("Suma de todas:              " + suma + " ms");
        System.out.println("==================================================");
    }
}
