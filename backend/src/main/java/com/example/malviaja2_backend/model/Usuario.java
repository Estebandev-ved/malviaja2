package com.example.malviaja2_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String firebaseUid;

    @Column(nullable = false)
    private String email;

    private String nombre;
    
    private String telefonoPorDefecto;
    private String direccionPorDefecto;

    private String rol = "USER";

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean activo = true;

    @Column(name = "primer_compra_realizada", nullable = false, columnDefinition = "boolean default false")
    private Boolean primerCompraRealizada = false;

    @Column(name = "ultima_compra")
    private LocalDateTime ultimaCompra;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
