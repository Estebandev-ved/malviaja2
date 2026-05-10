package com.example.malviaja2_backend.repository;

import com.example.malviaja2_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByFirebaseUid(String firebaseUid);
    Optional<Usuario> findByEmailIgnoreCase(String email);
    long countByActivoTrue();
    List<Usuario> findByActivoTrueAndUltimaCompraBefore(LocalDateTime limitDate);
}
