package com.sports.api.controllers;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TestController {

    private final JdbcTemplate jdbcTemplate;

    // Injectăm JdbcTemplate prin constructor
    public TestController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/test-db")
    public List<String> testDbConnection() {
        // Interogăm tabelul creat de tine în scriptul 00_test.sql
        String sql = "SELECT mesaj FROM test_conexiune";

        // Returnăm o listă cu toate mesajele găsite în tabel
        return jdbcTemplate.queryForList(sql, String.class);
    }
}