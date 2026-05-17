package com.example.malviaja2_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class Malviaja2BackendApplication {

	public static void main(String[] args) {
		// Forzar IPv4 para evitar errores de conexión en redes locales
		System.setProperty("java.net.preferIPv4Stack", "true");
		// Usar un archivo hosts local para saltarse el bloqueo DNS de Resend
		System.setProperty("jdk.net.hosts.file", "custom-hosts.txt");
		SpringApplication.run(Malviaja2BackendApplication.class, args);
	}

}
