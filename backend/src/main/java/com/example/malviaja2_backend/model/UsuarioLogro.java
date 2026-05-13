package com.example.malviaja2_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "usuario_logros")
public class UsuarioLogro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String usuarioUid;

    @Column(nullable = false)
    private Long logroId;

    @Column(nullable = false)
    private LocalDateTime fechaObtenido;

    @PrePersist
    protected void onCreate() {
        fechaObtenido = LocalDateTime.now();
    }
}
