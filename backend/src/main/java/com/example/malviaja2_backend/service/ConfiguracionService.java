package com.example.malviaja2_backend.service;

import com.example.malviaja2_backend.model.ConfiguracionGlobal;
import com.example.malviaja2_backend.repository.ConfiguracionGlobalRepository;
import com.example.malviaja2_backend.repository.PedidoRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ConfiguracionService {

    private static final Logger logger = LoggerFactory.getLogger(ConfiguracionService.class);

    private final ConfiguracionGlobalRepository repository;
    private final PedidoRepository pedidoRepository;

    public ConfiguracionService(ConfiguracionGlobalRepository repository,
                                PedidoRepository pedidoRepository) {
        this.repository = repository;
        this.pedidoRepository = pedidoRepository;
    }

    @PostConstruct
    public void init() {
        try {
            if (!repository.existsById(1L)) {
                ConfiguracionGlobal conf = new ConfiguracionGlobal();
                repository.save(conf);
                logger.info("Configuración Global inicializada por defecto.");
            }
        } catch (Exception e) {
            // La tabla puede no existir todavía si Hibernate aún no la creó
            logger.warn("No se pudo inicializar ConfiguracionGlobal en startup (será reintentado en la primera petición): {}", e.getMessage());
        }
    }

    public ConfiguracionGlobal obtenerConfiguracion() {
        ConfiguracionGlobal conf = repository.findById(1L).orElseGet(() -> {
            ConfiguracionGlobal nueva = new ConfiguracionGlobal();
            return repository.save(nueva);
        });
        if (conf.getPromo2x1Enabled() == null) {
            conf.setPromo2x1Enabled(true);
        }
        if (conf.getPromo2x1MaxUsuarios() == null) {
            conf.setPromo2x1MaxUsuarios(20);
        }
        if (conf.getPromo2x1Titulo() == null) {
            conf.setPromo2x1Titulo("Lanzamiento 2x1");
        }
        if (conf.getPromo2x1Subtitulo() == null) {
            conf.setPromo2x1Subtitulo("Solo para las primeras 20 compras completadas de 20 usuarios unicos");
        }
        if (conf.getPromo2x1Terminos() == null) {
            conf.setPromo2x1Terminos("Promo 2x1 solo aplica en Brownie Fuerte de $15.000 COP (alta dosis/mayor miligramos).\nEl beneficio es 2 brownies por el precio de 1 (2x1) dentro de esa referencia.\nValido para 1 beneficio por cuenta.\nAplica solo en productos seleccionados de la promo.\nNo acumulable con otros cupones o promociones.\nSolo cuentan pedidos con estado ENTREGADO.\nSujeto a disponibilidad y verificacion de compra.\nEnvio no incluido salvo indicacion expresa.\nFinaliza automaticamente al completar 20 compras en 20 usuarios unicos.");
        }
        if (conf.getPromoStartTime() == null) conf.setPromoStartTime("22:00");
        if (conf.getPromoEndTime() == null) conf.setPromoEndTime("02:00");
        if (conf.getPromoTipo() == null) conf.setPromoTipo("2X1");
        if (conf.getPromoTarget() == null) conf.setPromoTarget("NUEVOS");
        if (conf.getPromoValue() == null) conf.setPromoValue(14990.0);
        if (conf.getPromoProducts() == null) conf.setPromoProducts("Brownie Fuerte");
        if (conf.getPromoMode() == null) conf.setPromoMode("PROGRAMADA");
        if (conf.getPromoDuration() == null) conf.setPromoDuration(4);
        // Null-checks para campos de envío
        if (conf.getDeliveryMinFree() == null) conf.setDeliveryMinFree(150000.0);
        if (conf.getDeliveryPricePerKm() == null) conf.setDeliveryPricePerKm(1500.0);
        if (conf.getDeliveryMaxRadius() == null) conf.setDeliveryMaxRadius(50.0);
        if (conf.getCompraMinima() == null) conf.setCompraMinima(15000.0);
        actualizarEstadoPromo(conf);
        return conf;
    }

    public ConfiguracionGlobal guardarConfiguracion(ConfiguracionGlobal conf) {
        conf.setId(1L); // Garantizar singleton
        return repository.save(conf);
    }

    private void actualizarEstadoPromo(ConfiguracionGlobal conf) {
        if (conf.getPromo2x1Enabled() == null || !conf.getPromo2x1Enabled()) {
            return;
        }
        int maxUsuarios = conf.getPromo2x1MaxUsuarios() != null ? conf.getPromo2x1MaxUsuarios() : 20;
        long usuariosUnicos = pedidoRepository.countUsuariosConPedidosEntregados();
        if (usuariosUnicos >= maxUsuarios) {
            conf.setPromo2x1Enabled(false);
            repository.save(conf);
            logger.info("Promo 2x1 desactivada automaticamente. Usuarios unicos con pedidos entregados: {}", usuariosUnicos);
        }
    }
}
