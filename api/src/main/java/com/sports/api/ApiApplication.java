package com.sports.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class ApiApplication {
	private final JdbcTemplate jdbcTemplate;

	public ApiApplication(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public static void main(String[] args) {
		SpringApplication.run(ApiApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void testDatabaseConnection() {
		System.out.println("─────────────────────────────────────────");
		try {
			jdbcTemplate.queryForObject("SELECT 1", Integer.class);
			System.out.println("✅ Conexiune la baza de date: OK");
		} catch (Exception e) {
			System.out.println("❌ Conexiune la baza de date: FAILED");
			System.out.println("   Motiv: " + e.getMessage());
		}

		System.out.println("─────────────────────────────────────────");
	}
}