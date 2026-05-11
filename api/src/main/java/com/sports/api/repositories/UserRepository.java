package com.sports.api.repositories;

import com.sports.api.dto.RegisterRequestDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class UserRepository {
    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public UUID callRegisterUserFunction(RegisterRequestDTO request, String hashedPassword) {
        String statement = "SELECT register_user(?::varchar, ?::varchar, ?::varchar, ?::varchar, ?::varchar, ?::date)";

        return jdbcTemplate.queryForObject(
                statement,
                UUID.class,
                request.username(),
                request.email(),
                hashedPassword,
                request.firstName(),
                request.lastName(),
                request.birthDate()
        );
    }
}
