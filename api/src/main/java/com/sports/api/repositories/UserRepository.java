package com.sports.api.repositories;

import com.sports.api.dto.RegisterRequestDTO;
import com.sports.api.dto.UserLoginDataDTO;
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

    public UserLoginDataDTO getUserForLogin(String email) {
        String statement = "SELECT * FROM get_user_for_login(?::varchar)";

        return jdbcTemplate.query(statement, rs -> {
            if (rs.next()) {
                return new UserLoginDataDTO(
                        (UUID) rs.getObject("id"),
                        rs.getString("password_hash")
                );
            }
            return null;
        }, email);
    }
}
