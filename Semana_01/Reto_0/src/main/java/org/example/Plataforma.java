package org.example;

import org.example.Episodio;

import java.util.ArrayList;

public class Plataforma {
    private ArrayList<Episodio> catalogo;

    // 1. Constructor sin parámetros para poder hacer "new Plataforma()"
    public Plataforma() {
        this.catalogo = new ArrayList<>();
    }


    public void agregarEspisodio(Episodio e) {
        catalogo.add(e);
    }

    // 3. Método para recorrer y procesar todo el catálogo
    public void procesarCatalogo() {
        for (Episodio ep : catalogo) {
            ep.procesar();
        }
    }
}