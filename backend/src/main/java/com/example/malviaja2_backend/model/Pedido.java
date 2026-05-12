package com.example.malviaja2_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
@Data
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    private String nombreReceptor;
    private String telefono;
    
    @Column(columnDefinition = "TEXT")
    private String direccionEnvio;

    @Column(nullable = false)
    private Double total;

    @Column(columnDefinition = "TEXT")
    private String carritoJson;

    @Column(nullable = false)
    private String estado = "PENDIENTE"; // PENDIENTE, PREPARANDO, EN_CAMINO, ENTREGADO, CANCELADO

    @Column(name = "fecha_pedido")
    private LocalDateTime fechaPedido;

    @PrePersist
    protected void onCreate() {
        fechaPedido = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public void setNombreReceptor(String nombreReceptor) {
        this.nombreReceptor = nombreReceptor;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public void setDireccionEnvio(String direccionEnvio) {
        this.direccionEnvio = direccionEnvio;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public void setCarritoJson(String carritoJson) {
        this.carritoJson = carritoJson;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
