package com.example.malviaja2_backend.repository;

import com.example.malviaja2_backend.model.Logro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogroRepository extends JpaRepository<Logro, Long> {
    List<Logro> findByTipo(String tipo);
}
