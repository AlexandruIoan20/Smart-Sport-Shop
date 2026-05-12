package com.sports.api.repositories;

import com.sports.api.dto.ProfileRequestDTO;
import com.sports.api.dto.ProfileResponseDTO;
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
        String sql = "SELECT register_user(?::varchar, ?::varchar, ?::varchar, ?::varchar, ?::varchar, ?::date)";

        return jdbcTemplate.queryForObject(
                sql,
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
        String sql = "SELECT * FROM get_user_for_login(?::varchar)";

        return jdbcTemplate.query(sql, rs -> {
            if (rs.next()) {
                return new UserLoginDataDTO(
                        (UUID) rs.getObject("id"),
                        rs.getString("password_hash")
                );
            }
            return null;
        }, email);
    }

    public UUID completeProfile(UUID userId, ProfileRequestDTO dto) {
        String sql = """
            SELECT complete_user_profile(
                ?::uuid,
                ?::varchar,
                ?::goal_type,
                ?::environment_type,
                ?::daily_schedule_type,
                ?::integer,
                ?::activity_level_type,
                ?::effort_tolerance_type,
                ?::boolean,
                ?::text,
                ?::numeric,
                ?::numeric
            )
            """;

        return jdbcTemplate.queryForObject(
                sql,
                UUID.class,
                userId,
                dto.occupation(),
                dto.goal(),
                dto.preferredEnvironment(),
                dto.dailySchedule(),
                dto.freeHoursWeek(),
                dto.activityLevel(),
                dto.effortTolerance(),
                dto.prefersTeam(),
                dto.medicalNotes(),
                dto.budgetMin(),
                dto.budgetMax()
        );
    }

    public ProfileResponseDTO getUserProfile(UUID userId) {
        String statement = "SELECT * FROM get_user_profile(?::uuid)";

        return jdbcTemplate.query(statement, rs -> {
            if (rs.next()) {
                return new ProfileResponseDTO(
                        rs.getString("occupation"),
                        rs.getString("goal"),
                        rs.getString("preferred_environment"),
                        rs.getString("daily_schedule"),
                        rs.getObject("free_hours_week", Integer.class),
                        rs.getString("activity_level"),
                        rs.getString("effort_tolerance"),
                        rs.getBoolean("prefers_team"),
                        rs.getString("medical_notes"),
                        rs.getDouble("budget_min"),
                        rs.getDouble("budget_max")
                );
            }
            return null;
        }, userId);
    }

    public UUID generateRecommendations(UUID profileId) {
        String statement = "SELECT generate_recommendations(?::uuid)";

        return jdbcTemplate.queryForObject(statement, UUID.class, profileId);
    }
}