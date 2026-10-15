package org.example;

import java.io.IOException;

public class PipelineAuditoria {

    public static void main(String[] args) {
        long inicio = System.currentTimeMillis();

        System.out.println("============================");
        System.out.println("🚀 RETO 02 PIPELINE AUDITORIA");
        System.out.println("============================");

        try {
            System.out.println("INICIANDO EJECUCION EN PARALELO");

            System.out.println("             -> Lanzando proceso 1 (ping a 127.0.0.1)");
            Process p1 = new ProcessBuilder("ping", "-c", "1", "-W", "3000", "127.0.0.1").start();

            System.out.println("             -> Lanzando proceso 2 (ping a 192.0.2.1)");
            Process p2 = new ProcessBuilder("ping", "-c", "1", "-W", "3000", "192.0.2.1").start();

            System.out.println("             -> Bloqueando Java para recoger resultados con waitFor()");

            int codigoSalidap1 = p1.waitFor();
            int codigoSalidap2 = p2.waitFor();

            System.out.println("Código inicial 127.0.0.1: " + codigoSalidap1);
            System.out.println("Código inicial 192.0.2.1: " + codigoSalidap2);

            codigoSalidap1 = reintentarSiFalla("127.0.0.1", codigoSalidap1);
            codigoSalidap2 = reintentarSiFalla("192.0.2.1", codigoSalidap2);

            System.out.println("Código final 127.0.0.1: " + codigoSalidap1);
            System.out.println("Código final 192.0.2.1: " + codigoSalidap2);

            if (codigoSalidap1 == 0 && codigoSalidap2 == 0) {
                System.out.println("✔ Ambos pings correctos. Abriendo TextEdit...");
                abrirAplicacionMac("TextEdit");
            } else {
                System.out.println("⚠ Al menos un ping sigue fallando. Abriendo Calculadora...");
                abrirAplicacionMac("Calculator");
            }
        } catch (IOException e) {
            System.err.println("Error I/O: No se pudo lanzar el proceso. Detalle: " + e.getMessage());
        } catch (InterruptedException e) {
            System.err.println("Error de Interrupción: La espera fue interrumpida de forma inesperada.");
            Thread.currentThread().interrupt();
        } finally {
            System.out.println("Tiempo total: " + (System.currentTimeMillis() - inicio) + " ms");
        }
    }

    private static int reintentarSiFalla(String ip, int codigoSalida) throws IOException, InterruptedException {
        int reintento = 0;
        while (codigoSalida != 0 && reintento < 3) {
            reintento++;
            System.out.println("Reintento " + reintento + "/3 para " + ip);
            Thread.sleep(1000);
            codigoSalida = new ProcessBuilder("ping", "-c", "1", "-W", "3000", ip)
                    .start()
                    .waitFor();
        }
        return codigoSalida;
    }

    private static void abrirAplicacionMac(String nombreApp) throws IOException {
        new ProcessBuilder("open", "-a", nombreApp).start();
    }
}