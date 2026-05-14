package com.example.malviaja2_backend.service;

import com.example.malviaja2_backend.model.Producto;
import com.example.malviaja2_backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Servicio de Productos. Gestiona el catálogo y el stock.
 * El control de stock es responsabilidad de PedidoService al procesar pedidos.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;

    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> buscarPorId(Long id) {
        return productoRepository.findById(id);
    }

    public Producto guardarProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    /**
     * Elimina un producto por ID.
     * Antes de llamar este método, verificar que el ID exista (ver ProductoController).
     */
    public void eliminar(Long id) {
        productoRepository.deleteById(id);
        log.info("Producto #{} eliminado de la BD.", id);
    }

    @org.springframework.transaction.annotation.Transactional
    public void inicializarVersion(Long id) {
        int actualizados = productoRepository.inicializarVersion(id);
        if (actualizados > 0) {
            log.info("Version inicializada a 0 para producto #{} (legacy data)", id);
        }
    }
}
