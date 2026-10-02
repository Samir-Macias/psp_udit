package org.example;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class MonitorUditflix {
    public static void main(String[] args) {
        System.out.println("======================================");
        System.out.println("          UDITFLIX - CATÁLOGO         ");
        System.out.println("======================================");

        String[][] catalogo = {
                {"Series", "10.255.255.1"},       // CAÍDO
                {"Películas", "127.0.0.1"},        // ACTIVO
                {"Documentales", "127.0.0.1"},     // ACTIVO
                {"Anime", "10.255.255.1"},         // CAÍDO
                {"Infantil", "127.0.0.1"}          // ACTIVO
        };

        try {
            for (int i = 0; i < catalogo.length; i++) {
                String nombre = catalogo[i][0];
                String ip = catalogo[i][1];

                System.out.println("[" + nombre + "]");

                ProcessBuilder pb = new ProcessBuilder(
                        "ping", "-c", "1", ip
                );

                pb.redirectErrorStream(true);

                Process proceso = pb.start();

                String linea;

                System.out.println("PID: " + proceso.pid());
                BufferedReader lector = new BufferedReader(
                        new InputStreamReader(proceso.getInputStream())
                );

                while ((linea = lector.readLine()) != null) {

                }
                lector.close();

                int codigo = proceso.waitFor();
                if (codigo == 0) {
                    System.out.println("ESTADO: ACTIVO\n");
                } else {
                    System.out.println("ESTADO: CAÍDO\n");
                }
            }
            System.out.println("======================================");
            System.out.println("       COMPROBACIÓN FINALIZADA        ");
            System.out.println("======================================");
        } catch (IOException e) {
            System.out.println("Error al ejecutar el proceso: " + e.getMessage());
        } catch (InterruptedException e) {
            System.out.println("El proceso fue interrumpido: " + e.getMessage());
        }
    }
}
