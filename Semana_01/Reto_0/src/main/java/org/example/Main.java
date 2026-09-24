package org.example;


import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {

        System.out.println("--- INICIANDO UDITVERSUM");
        ArrayList<Episodio> catalogo = new ArrayList<>();
        catalogo.add(new Episodio("Diseño 3d - Intro", 45));
        catalogo.add(new Episodio("Animacion", 60));
        catalogo.add(new Episodio("Texturas", 50));

        long inicio = System.currentTimeMillis();

        for (Episodio ep: catalogo){
            ep.procesar();
        }

        long fin = System.currentTimeMillis();

        long totalSegundos = (fin - inicio) / 1000;
        System.out.print("Tiempo total: " + totalSegundos + " Segundos de bloqueo. ");

    }
}