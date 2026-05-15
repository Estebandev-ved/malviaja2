package com.example.malviaja2_backend.model;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PedidoRequest {

    @NotBlank(message = "El userId es obligatorio")
    private String userId;

    @Email(message = "El email no tiene formato válido")
    private String email;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 200, message = "El nombre no puede superar 200 caracteres")
    private String nombre;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 500, message = "La dirección no puede superar 500 caracteres")
    private String direccion;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^[+\\d\\s\\-()]{6,20}$", message = "Teléfono inválido")
    private String telefono;

    @NotNull(message = "El total es obligatorio")
    @Positive(message = "El total debe ser un valor positivo")
    @DecimalMax(value = "9999999.99", message = "El total excede el máximo permitido")
    private Double total;

    @NotBlank(message = "El carrito no puede estar vacío")
    @Size(max = 10000, message = "El carrito supera el tamaño máximo permitido")
    private String carrito;

    private String referencia;

    @NotNull(message = "El costo de envío es obligatorio")
    @PositiveOrZero(message = "El costo de envío no puede ser negativo")
    private Double costoEnvio;

    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDireccion() {
        return direccion;
    }

    public String getTelefono() {
        return telefono;
    }

    public Double getTotal() {
        return total;
    }

    public String getCarrito() {
        return carrito;
    }

    public Double getCostoEnvio() {
        return costoEnvio;
    }
}
