package org.example;

public class Episodio {
    private String titulo;
    private int  duracion;


    //Contructores

    public Episodio (String titulo, int duracion){
        this.titulo = titulo;
        this.duracion = duracion;

    }

    //Metodos
    public void procesar(){
        System.out.println("Iniciando procesamineto de : " + this.titulo + "...");
        try {
            Thread.sleep(1250);

        }catch (InterruptedException e){
            System.out.println("Error al procesar el episodio");
        }
        System.out.println("Completado: " + this.titulo);
    }

}
