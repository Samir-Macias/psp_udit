package org.example;

public class Main {
    public static void main(String[] args) {
        long inicio = System.currentTimeMillis();

        System.out.println("--- INICIANDO UDITVERSUM ---");

        Plataforma plataforma = new Plataforma();
        plataforma.agregarEspisodio(new Episodio("Diseño 3d - Intro", 45));
        plataforma.agregarEspisodio(new Episodio("Animacion", 60));
        plataforma.agregarEspisodio(new Episodio("Texturas", 50));
        plataforma.agregarEspisodio(new Episodio("Iluminación y Sombras", 55));
        plataforma.agregarEspisodio(new Episodio("Modelado de Personajes", 75));
        plataforma.agregarEspisodio(new Episodio("Renders y Motores de Ciclos", 40));
        plataforma.agregarEspisodio(new Episodio("Rigging y Esqueletos", 65));
        plataforma.agregarEspisodio(new Episodio("Efectos Visuales (VFX)", 50));


        plataforma.procesarCatalogo();

        long fin = System.currentTimeMillis();
        long totalSegundos = (fin - inicio) / 1000;

        System.out.println("Tiempo total: " + totalSegundos + " Segundos de bloqueo.");
    }
}