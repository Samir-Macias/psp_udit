package org.example;

import java.io.IOException;

public class LanzadorVideo {

        public static void main(String[] args){
            System.out.println("Solicitamos al SO la creacion de un proceso nativo...");
            ProcessBuilder pb = new ProcessBuilder("open",
                    "-a",
                    "Google Chrome",
                    "https://www.youtube.com/watch?v=IL4Dift5_ik");
            try {
                Process proceso = pb.start();
                System.out.println("¡Video Lanzado con exito!");

            }catch (IOException e){
                System.out.println("Error: el sistema operativo no encuentra el programa. ");
            }
        }
    }

