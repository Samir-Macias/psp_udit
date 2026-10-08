package org.example;

import java.io.IOException;

public class PipelineAuditoria {

    public static void main(String[] args) {
        System.out.println("============================");
        System.out.println("🚀 RETO 02 PIPELINE AUDITORIA");
        System.out.println("============================");

        try {
            System.out.println("INICIANDO EJECUCION EN PARALELO");
            long startParalelo = System.currentTimeMillis();


            System.out.println("             -> Lanzando proceso 1 (ping a 127.0.0.1)");
            Process p1 = new ProcessBuilder("ping", "-c", "1", "127.0.0.1").start();

            System.out.println("             -> Lanzando proceso 2 (ping a error.invalid)");
            Process p2 = new ProcessBuilder("ping", "-c", "1", "error.invalid").start();

            System.out.println("             -> Bloqueando Java para recoger resultados con waitFor()");


            int codigoSalidap1 = p1.waitFor();
            int codigoSalidap2 = p2.waitFor();

            System.out.println("Código salida Proceso 1: " + codigoSalidap1);
            System.out.println("Código salida Proceso 2: " + codigoSalidap2);

            if (codigoSalidap1 == 0 && codigoSalidap2 == 0) {
                System.out.println("✔ Ambos pings correctos. Abriendo TextEdit...");
                abrirAplicacionMac("TextEdit");
            } else {
                System.out.println("⚠ Al menos un ping ha fallado. Abriendo Calculadora...");
                abrirUrlMac("https://www.youtube.com/watch?v=NtTmFtxVWsI");
            }

            long endlParalelo = System.currentTimeMillis();
            System.out.println("Tiempo total de ejecución: " + (endlParalelo - startParalelo) + " ms");

        } catch (IOException e) {

            System.err.println("Error I/O: No se pudo lanzar el proceso. Detalle: " + e.getMessage());
        } catch (InterruptedException e) {

            System.err.println("Error de Interrupción: La espera fue interrumpida de forma inesperada.");
            Thread.currentThread().interrupt();
        }
    }


    private static void abrirAplicacionMac(String nombreApp) throws IOException {
        new ProcessBuilder("open", "-a", nombreApp).start();
    }

    private static void abrirUrlMac(String url) throws IOException {
        new ProcessBuilder("open", url).start();
    }
}