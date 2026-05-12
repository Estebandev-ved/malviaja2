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

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "primer_compra_realizada")
    private Boolean primerCompraRealizada = false;

    @Column(name = "ultima_compra")
    private LocalDateTime ultimaCompra;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public String getEmail() {
        return email;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public void setPrimerCompraRealizada(Boolean primerCompraRealizada) {
        this.primerCompraRealizada = primerCompraRealizada;
    }

    public void setUltimaCompra(LocalDateTime ultimaCompra) {
        this.ultimaCompra = ultimaCompra;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
