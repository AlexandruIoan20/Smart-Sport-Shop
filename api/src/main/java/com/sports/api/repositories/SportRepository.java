package com.sports.api.repositories;

import com.sports.api.dto.SportResponseDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class SportRepository {
    private final JdbcTemplate jdbcTemplate;

    public SportRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<SportResponseDTO> getAllSports() {
        String sql = "SELECT * FROM get_all_sports()";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new SportResponseDTO(
                        rs.getObject("sport_id", java.util.UUID.class),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getBoolean("is_team_sport"),
                        rs.getBoolean("is_outdoor"),
                        rs.getInt("effort_level"),
                        rs.getBigDecimal("min_budget"),
                        rs.getString("image_url"),
                        rs.getBoolean("is_active")
                )
        );
    }

    public SportResponseDTO getSportById(UUID sportId) {
        String sql = "SELECT * FROM get_sport_by_id(?::uuid)";

        return jdbcTemplate.query(sql, rs -> {
            if (rs.next()) {
                return new SportResponseDTO(
                        rs.getObject("sport_id", java.util.UUID.class),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getBoolean("is_team_sport"),
                        rs.getBoolean("is_outdoor"),
                        rs.getInt("effort_level"),
                        rs.getBigDecimal("min_budget"),
                        rs.getString("image_url"),
                        rs.getBoolean("is_active")
                );
            }
            return null;
        }, sportId);
    }
}