package com.example.malviaja2_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "logros")
public class Logro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    private String icono;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private Integer requisito;

    @Column(nullable = false)
    private Integer puntosRecompensa = 0;
}
