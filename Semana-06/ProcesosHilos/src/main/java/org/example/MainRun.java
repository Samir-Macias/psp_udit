package org.example;

public class MainRun {

    public static void main(String[] args) {

        // Creamos un objeto Thread que ejecutara la tarea Hilo-A
        Thread t1 = new Thread(
                new TareaPrueba("Hilo-A"),
                "HILO-A"
        );

        Thread t2 = new Thread(
                new TareaPrueba("Hilo-B"),
                "HILO-B"
        );

        // Iniciamos el primer hilo
        t1.run();
        // Iniciamos el segundo hilo
        // Los dos hilos pueden progresar concurrentemente
        t2.run();

        System.out.println(
                "Fin del método main (" +
                        Thread.currentThread().getName() + ")."
        );
    }


}
