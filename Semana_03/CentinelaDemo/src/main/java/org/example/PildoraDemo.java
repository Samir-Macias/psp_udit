package org.example;

import javax.swing.plaf.synth.SynthOptionPaneUI;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.Buffer;

public class PildoraDemo {
    public static void main(String[] args){
        System.out.println("===MONITOR UDITFLIX===");
        System.out.println("Comprobamos servicio...");

        try{
            ProcessBuilder pb = new ProcessBuilder(
              "ping", "-c", "1", "127.0.0.1"
            );

            pb.redirectErrorStream(true);

            Process proceso = pb.start();

            System.out.println("PID: " + proceso.pid());

            BufferedReader lector = new BufferedReader(
                    new InputStreamReader(proceso.getInputStream())
            );
            String linea;

            while ((linea = lector.readLine()) != null){
                System.out.println(linea);
            }
            int codigo = proceso.waitFor();
            if(codigo == 0){
                System.out.println("ESTADO: SERVICIO ACTIVO");
            }else {
                System.out.println("ESTADO: SERVICIO CON ERROR");
            }
        }catch (IOException e){
            System.out.println("No se pudo lanzar el proces");
        }catch (InterruptedException e){
            System.out.println("La ejecución ");
        }


    }
}
