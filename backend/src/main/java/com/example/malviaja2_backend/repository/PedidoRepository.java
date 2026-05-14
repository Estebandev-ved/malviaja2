package com.example.malviaja2_backend.repository;

import com.example.malviaja2_backend.model.Pedido;
import com.example.malviaja2_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioOrderByFechaPedidoDesc(Usuario usuario);

    Optional<Pedido> findByReferenciaPago(String referenciaPago);

    Optional<Pedido> findByReferencia(String referencia);

    @Query("select count(distinct p.usuario.id) from Pedido p where p.estado = 'ENTREGADO'")
    long countUsuariosConPedidosEntregados();
}
