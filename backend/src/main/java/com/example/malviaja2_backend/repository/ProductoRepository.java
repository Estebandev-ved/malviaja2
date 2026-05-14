package com.example.malviaja2_backend.repository;

import com.example.malviaja2_backend.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE Producto p SET p.version = 0 WHERE p.id = :id AND p.version IS NULL")
    int inicializarVersion(@org.springframework.data.repository.query.Param("id") Long id);
}
