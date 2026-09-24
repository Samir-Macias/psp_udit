package org.example;
import java.util.ArrayList;


public class Plataforma {
    private ArrayList<Episodio> catalogo;


    public Plataforma() {
        this.catalogo = new ArrayList<>();
    }

    //METODO AGREGAR
    public void agregarEspisodio(Episodio e) {
        catalogo.add(e);
    }

    //METODO PROCESAR
    public void procesarCatalogo() {
        for (Episodio ep : catalogo) {
            ep.procesar();
        }
    }
}