package org.example;

import java.io.IOException;

public class CodigoSalida {
    public static void main(String[] args){
        System.out.println("COMPROBACION DE SERVIDOR");
        try{
            ProcessBuilder pb = new ProcessBuilder("ping","-n","1", "8.8.8.8");

            Process proceso = pb.start();

            System.out.println("PID: " + proceso.pid());

            int codigoSalida = proceso.waitFor();

            System.out.println("codigo salida" + codigoSalida);

            if (codigoSalida ==0){
                System.out.println("Activo");
            } else {
                System.out.println("Caido");
            }
        } catch (IOException e){
            System.out.println("Error al lanzar proceso");
        }
        catch (InterruptedException e){
            System.out.println("A LA ESPERA");
        }
        System.out.println("FIN DE LA COMPROBACION");
    }
}
