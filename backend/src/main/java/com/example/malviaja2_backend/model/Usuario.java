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
    private Integer puntos = 0;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "primer_compra_realizada")
    private Boolean primerCompraRealizada = false;

    @Column(name = "promo_2x1_usada")
    private Boolean promo2x1Usada = false;

    @Column(name = "ultima_compra")
    private LocalDateTime ultimaCompra;

    @Column(name = "recovery_email_sent")
    private Boolean recoveryEmailSent = false;

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

    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setDireccionPorDefecto(String direccionPorDefecto) {
        this.direccionPorDefecto = direccionPorDefecto;
    }

    public void setTelefonoPorDefecto(String telefonoPorDefecto) {
        this.telefonoPorDefecto = telefonoPorDefecto;
    }

    public Integer getPuntos() {
        return puntos;
    }

    public void setPuntos(Integer puntos) {
        this.puntos = puntos;
    }

    public Boolean getPromo2x1Usada() {
        return promo2x1Usada != null ? promo2x1Usada : false;
    }

    public void setPromo2x1Usada(Boolean promo2x1Usada) {
        this.promo2x1Usada = promo2x1Usada;
    }

    public Boolean getRecoveryEmailSent() {
        return recoveryEmailSent != null ? recoveryEmailSent : false;
    }

    public void setRecoveryEmailSent(Boolean recoveryEmailSent) {
        this.recoveryEmailSent = recoveryEmailSent;
    }
}
