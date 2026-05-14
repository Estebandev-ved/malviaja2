package com.example.malviaja2_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
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
    private String estado = "PENDIENTE"; // PENDIENTE, PAGADO, REVISION_MANUAL, PREPARANDO, EN_CAMINO, ENTREGADO, CANCELADO

    @Column(unique = true)
    private String referencia;

    @Column(name = "referencia_pago")
    private String referenciaPago;

    @Column(columnDefinition = "TEXT")
    private String comprobanteUrl;

    @Column(name = "entidad_pago")
    private String entidadPago;

    @Column(name = "fecha_pago")
    private LocalDate fechaPago;

    @Column(name = "confianza_extraccion")
    private Double confianzaExtraccion;

    @Column(name = "ocr_json", columnDefinition = "TEXT")
    private String ocrJson;

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

    public Double getTotal() {
        return total;
    }

    public void setCarritoJson(String carritoJson) {
        this.carritoJson = carritoJson;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public void setReferenciaPago(String referenciaPago) {
        this.referenciaPago = referenciaPago;
    }

    public void setEntidadPago(String entidadPago) {
        this.entidadPago = entidadPago;
    }

    public void setFechaPago(LocalDate fechaPago) {
        this.fechaPago = fechaPago;
    }

    public void setConfianzaExtraccion(Double confianzaExtraccion) {
        this.confianzaExtraccion = confianzaExtraccion;
    }

    public void setOcrJson(String ocrJson) {
        this.ocrJson = ocrJson;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getNombreReceptor() {
        return nombreReceptor;
    }
}
