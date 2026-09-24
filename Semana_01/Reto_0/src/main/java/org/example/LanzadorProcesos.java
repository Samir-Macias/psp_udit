package org.example;

import java.io.IOException;
import java.net.SocketTimeoutException;

public class LanzadorProcesos {
    public static void main(String[] args){
        System.out.println("Solicitamos al SO la creacion de un proceso nativo...");
        ProcessBuilder pb = new ProcessBuilder("open", "-a", "Calculator");
        try {
            Process proceso = pb.start();
            System.out.println("Proceso en ejecucion. PID: " + proceso.pid());

            int salida = proceso.waitFor();

            System.out.println("eEL proceso externo finalizo con codigo: " + salida);
        }catch (IOException e){
            System.out.println("Error: el sistema operativo no encuentra el programa. ");
        }catch (InterruptedException e ){
            System.out.println("Error: el proceso fue interruempido bruscamente");
        }
    }
}
