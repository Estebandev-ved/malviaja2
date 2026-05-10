package com.example.malviaja2_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Malviaja2BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(Malviaja2BackendApplication.class, args);
	}

}
