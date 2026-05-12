package com.example.malviaja2_backend.model;

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
    private String telegramToken = "";
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

    public Double getCompraMinima() {
        return compraMinima;
    }
}
