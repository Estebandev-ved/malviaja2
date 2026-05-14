package com.example.malviaja2_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "configuracion_global")
@Data
public class ConfiguracionGlobal {
    
    @Id
    private Long id = 1L; // Siempre será 1, es un Singleton en BD

    // Exclusividad
    private Integer maxUsuarios = 50;
    private Integer diasInactividad = 15;
    private Double compraMinima = 15000.0;

    // Tienda
    private String storeName = "Malviaja2";
    private String storeSlogan = "Tu Viaje Premium";
    private String storeEmail = "contacto@malviaja2.com";
    private String storePhone = "+57 300 000 0000";
    private String currency = "COP";

    // Telegram
    private Boolean telegramEnabled = true;
    @JsonIgnore
    private String telegramToken = "";
    @JsonIgnore
    private String telegramChatId = "";

    // Envío
    private Double deliveryPricePerKm = 1500.0;
    private String deliveryBase = "Medellín (Alpujarra)";
    private Double deliveryMinFree = 150000.0;
    private Double deliveryMaxRadius = 50.0;

    // Seguridad
    private Boolean ageGateEnabled = true;
    private Integer ageGateMinAge = 18;
    private Boolean maintenanceMode = false;

    // Promo 2x1 lanzamiento
    private Boolean promo2x1Enabled = true;
    private Integer promo2x1MaxUsuarios = 20;
    private String promo2x1GroupLink = "";
    private String promo2x1Titulo = "Lanzamiento 2x1";
    @jakarta.persistence.Column(length = 500)
    private String promo2x1Subtitulo = "Solo para las primeras 20 compras completadas de 20 usuarios unicos";
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String promo2x1Terminos = "Promo 2x1 solo aplica en Brownie Fuerte de $15.000 COP. Valido 1 beneficio por cuenta. No acumulable. Aplica en pedidos con estado ENTREGADO.";

    // Nuevas opciones flexibles
    private String promoStartTime = "22:00";
    private String promoEndTime = "02:00";
    private String promoTipo = "2X1"; // 2X1, 3X2, FIXED, PERCENT
    private String promoTarget = "NUEVOS"; // NUEVOS, TODOS
    private Double promoValue = 14990.0; // 2X1=precio x2 unid, FIXED=monto desc, PERCENT=porcentaje
    private String promoProducts = "Brownie Fuerte"; // Comma separated names or "ALL"
    private String promoMode = "PROGRAMADA"; // MANUAL, PROGRAMADA
    private Integer promoDuration = 4; // Duración en horas


    public void setId(Long id) {
        this.id = id;
    }

    public Boolean getPromo2x1Enabled() {
        return promo2x1Enabled;
    }

    public void setPromo2x1Enabled(Boolean promo2x1Enabled) {
        this.promo2x1Enabled = promo2x1Enabled;
    }

    public Integer getPromo2x1MaxUsuarios() {
        return promo2x1MaxUsuarios;
    }

    public void setPromo2x1MaxUsuarios(Integer promo2x1MaxUsuarios) {
        this.promo2x1MaxUsuarios = promo2x1MaxUsuarios;
    }

    public String getPromo2x1GroupLink() {
        return promo2x1GroupLink;
    }

    public void setPromo2x1GroupLink(String promo2x1GroupLink) {
        this.promo2x1GroupLink = promo2x1GroupLink;
    }

    public String getPromo2x1Titulo() {
        return promo2x1Titulo;
    }

    public void setPromo2x1Titulo(String promo2x1Titulo) {
        this.promo2x1Titulo = promo2x1Titulo;
    }

    public String getPromo2x1Subtitulo() {
        return promo2x1Subtitulo;
    }

    public void setPromo2x1Subtitulo(String promo2x1Subtitulo) {
        this.promo2x1Subtitulo = promo2x1Subtitulo;
    }

    public String getPromo2x1Terminos() {
        return promo2x1Terminos;
    }

    public void setPromo2x1Terminos(String promo2x1Terminos) {
        this.promo2x1Terminos = promo2x1Terminos;
    }

    public Double getCompraMinima() {
        return compraMinima;
    }

    public String getPromoStartTime() { return promoStartTime; }
    public void setPromoStartTime(String promoStartTime) { this.promoStartTime = promoStartTime; }

    public String getPromoEndTime() { return promoEndTime; }
    public void setPromoEndTime(String promoEndTime) { this.promoEndTime = promoEndTime; }

    public String getPromoTipo() { return promoTipo; }
    public void setPromoTipo(String promoTipo) { this.promoTipo = promoTipo; }

    public String getPromoTarget() { return promoTarget; }
    public void setPromoTarget(String promoTarget) { this.promoTarget = promoTarget; }

    public Double getPromoValue() { return promoValue; }
    public void setPromoValue(Double promoValue) { this.promoValue = promoValue; }

    public String getPromoProducts() { return promoProducts; }
    public void setPromoProducts(String promoProducts) { this.promoProducts = promoProducts; }

    public String getPromoMode() { return promoMode; }
    public void setPromoMode(String promoMode) { this.promoMode = promoMode; }

    public Integer getPromoDuration() { return promoDuration; }
    public void setPromoDuration(Integer promoDuration) { this.promoDuration = promoDuration; }
}
