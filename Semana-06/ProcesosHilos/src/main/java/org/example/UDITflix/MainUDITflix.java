package org.example.UDITflix;

import java.util.ArrayList;
import java.util.Random;

/**
 * BASE DEL JUEVES (versión que se da al alumnado): 4 hilos creados "a mano".
 *
 * Pasos que se explican en la píldora:
 * 1) Crear las tareas (Runnable).
 * 2) Envolver cada tarea en un Thread con nombre propio.
 * 3) Lanzar con start() (NUNCA run()).
 * 4) Esperar con join() (para que main no dé el resultado antes de tiempo).
 *
 * Después de la píldora, el alumnado resuelve los mini-retos A, B y C sobre
 * esta base.
 */
public class MainUDITflix {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("==================================================");
        System.out.println("   UDITflix BACKEND · MOTOR DE TRANSCODIFICACIÓN  ");
        System.out.println("==================================================");

        Random azar = new Random();
        // Duración aleatoria entre 1000 y 4000 ms: así el orden de llegada cambia cada
        // vez.
        int latenciaCatalogo = 1000 + azar.nextInt(3001);
        int latenciaSesion = 1000 + azar.nextInt(3001);
        int latenciaPortadas = 1000 + azar.nextInt(3001);
        int latenciaAnaliticas = 1000 + azar.nextInt(3001);

        long inicio = System.currentTimeMillis();

        // 1) Tareas
        ArrayList<TareaDescarga> tareas = new ArrayList<>();
        TareaDescarga tcatalogo;
        TareaDescarga tsesion;
        TareaDescarga tportadas;
        TareaDescarga tanaliticas;
        tareas.add(tcatalogo = new TareaDescarga("catalogo-metadatos", latenciaCatalogo));
        tareas.add(tsesion = new TareaDescarga("sesion-y-perfil", latenciaSesion));
        tareas.add(tportadas = new TareaDescarga("portadas-assets", latenciaPortadas));
        tareas.add(tanaliticas = new TareaDescarga("analiticas", latenciaAnaliticas));

        // 2) Hilos con nombre
        Thread hcatalogo = new Thread(tcatalogo, "DL-catalogo");
        Thread hsesion = new Thread(tsesion, "DL-sesion");
        Thread hportadas = new Thread(tportadas, "DL-portadas");
        Thread hanaliticas = new Thread(tanaliticas, "DL-analiticas");

        // 3) Agregar prioridad a cada modulo

        hcatalogo.setPriority(Thread.MAX_PRIORITY);
        hsesion.setPriority(Thread.MAX_PRIORITY);
        hportadas.setPriority(Thread.NORM_PRIORITY);
        hanaliticas.setPriority(Thread.MIN_PRIORITY);

        ArrayList<Thread> hilos = new ArrayList<>();
        hilos.add(hcatalogo);
        hilos.add(hsesion);
        hilos.add(hportadas);
        hilos.add(hanaliticas);

        // 3) Lanzamiento concurrente
        System.out.println("[MAIN] Lanzando workers...\n");
        for (Thread h : hilos) {
            h.start();
        }

        // 4) Espera: main se bloquea hasta que cada hilo termina
        for (Thread h : hilos) {
            h.join();
        }

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
