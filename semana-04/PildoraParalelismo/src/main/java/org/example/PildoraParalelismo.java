package org.example;

import java.io.IOException;

public class PildoraParalelismo {
    public static void main(String[] args) {
        System.out.println("=========================================");
        System.out.println("🚀PILDORA TECNICA: SECUENCIAL VS PARALELO");
        System.out.println("=========================================");


        try {
            System.out.println(" INICIANDO EJECUCION SECUENCIAL....");
            long inicioSecuencial = System.currentTimeMillis();

            System.out.println("              -> Lanzando proceso 1 ( y esperando que muera)");
            Process p1 = new ProcessBuilder("ping", "-c", "2", "127.0.0.1").start();
            p1.waitFor();

            System.out.println("              -> Lanzando proceso 2 ( y esperando que muera)");
            Process p2 = new ProcessBuilder("ping", "-c", "2", "8.8.8.8").start();
            p2.waitFor();

            long finSecuencial = System.currentTimeMillis();
            System.out.println("⏱️             -> TIEMPO TOTAL SECUENCIAL" + (finSecuencial - inicioSecuencial) + "ms\n");


            System.out.println("=========================================");
            System.out.println("INICIANDO EJECUACION PARALELA");


            long inicioParalelo = System.currentTimeMillis();

            System.out.println("             -> Lanzando proceso 3 ( !No esperamos¡)");
            Process p3 = new ProcessBuilder("ping", "-c", "2", "127.0.0.1").start();
            System.out.println("             -> Lanzando proceso 4 ( !No esperamos¡)");
            Process p4 = new ProcessBuilder("ping", "-c", "2", "8.8.8.8").start();


            System.out.println("             -> Bloqueando java para recoger resultados");
            p3.waitFor();
            p4.waitFor();

            long finlParalelo = System.currentTimeMillis();
            System.out.println("⏱️ tiempo total paralelo: " + (finlParalelo - inicioParalelo) + "ms\n" );

        } catch (IOException e) {
            System.out.println("Error: No se pudo lanzar el proceso");
        } catch (InterruptedException e) {
            System.out.println("Error: la espera fue interrunpida de forma inesperada");
        }
    }
}

