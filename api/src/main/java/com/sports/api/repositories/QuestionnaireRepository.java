package com.sports.api.repositories;

import com.sports.api.dto.RecommendedSportDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class QuestionnaireRepository {

    private final JdbcTemplate jdbcTemplate;

    public QuestionnaireRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public UUID submitQuestionnaire(UUID userId, String jsonAnswers) {
        String sql = "SELECT submit_questionnaire_fn(?::uuid, ?::jsonb)";
        return jdbcTemplate.queryForObject(sql, UUID.class, userId, jsonAnswers);
    }

    public List<RecommendedSportDTO> getRecommendationsBySession(UUID sessionId) {
        String sql = """
            SELECT rs.rank,
                   rs.compatibility_score,
                   s.id   AS sport_id,
                   s.name AS sport_name
            FROM recommendation_sports rs
            JOIN sports s ON s.id = rs.sport_id
            WHERE rs.session_id = ?::uuid
            ORDER BY rs.rank ASC
            """;

        return jdbcTemplate.query(sql, (row, i) -> new RecommendedSportDTO(
                (UUID) row.getObject("sport_id"),
                row.getString("sport_name"),
                row.getDouble("compatibility_score"),
                row.getInt("rank")
        ), sessionId);
    }

    public String getComputedLevel(UUID sessionId) {
        String sql = """
            SELECT q.computed_level
            FROM recommendation_sessions rs
            JOIN questionnaires q ON q.id = rs.questionnaire_id
            WHERE rs.id = ?::uuid
            """;

        return jdbcTemplate.queryForObject(sql, String.class, sessionId);
    }
}