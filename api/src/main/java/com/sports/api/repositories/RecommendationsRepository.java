package com.sports.api.repositories;

import com.sports.api.dto.FullRecommendationDTO;
import com.sports.api.dto.RecommendationSessionHistoryDTO;
import com.sports.api.dto.RecommendedProductDTO;
import com.sports.api.dto.RecommendedSportDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.JavaType;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

@Repository
public class RecommendationsRepository {
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public RecommendationsRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public UUID getLatestSessionByUser(UUID userId) {
        String sql = "SELECT get_latest_session_by_user(?::uuid)";

        return jdbcTemplate.queryForObject(sql, UUID.class, userId);
    }

    public FullRecommendationDTO getRecommendationsBySession(UUID sessionId) {
        String sql = "SELECT * FROM get_recommendations_by_session(?::uuid)";

        return jdbcTemplate.query(sql, rs -> {
            FullRecommendationDTO result        = null;
            List<RecommendedSportDTO> sports   = new ArrayList<>();
            List<RecommendedProductDTO> products = new ArrayList<>();

            Set<UUID> seenSports   = new HashSet<>();
            Set<UUID> seenProducts = new HashSet<>();

            while (rs.next()) {
                if (result == null) {
                    result = new FullRecommendationDTO(
                            (UUID) rs.getObject("session_id"),
                            rs.getString("user_level"),
                            rs.getString("created_at"),
                            sports,
                            products
                    );
                }

                UUID sportId = (UUID) rs.getObject("sport_id");
                if (sportId != null && !seenSports.contains(sportId)) {
                    seenSports.add(sportId);
                    sports.add(new RecommendedSportDTO(
                            sportId,
                            rs.getString("sport_name"),
                            rs.getString("sport_description"),
                            rs.getDouble("compatibility_score"),
                            rs.getInt("rank"),
                            rs.getBoolean("is_team_sport"),
                            rs.getBoolean("is_outdoor"),
                            rs.getInt("effort_level"),
                            rs.getString("sport_image_url")
                    ));
                }

                UUID productId = (UUID) rs.getObject("product_id");
                if (productId != null && !seenProducts.contains(productId)) {
                    seenProducts.add(productId);
                    products.add(new RecommendedProductDTO(
                            productId,
                            rs.getString("product_name"),
                            rs.getString("category_name"),
                            rs.getString("product_sport_name"),
                            rs.getDouble("price"),
                            rs.getString("brand"),
                            rs.getString("product_image_url"),
                            rs.getString("target_level"),
                            rs.getString("reason"),
                            rs.getInt("stock_quantity")
                    ));
                }
            }

            return result;
        }, sessionId);
    }

    public List<RecommendationSessionHistoryDTO> getRecommendationHistory(UUID userId) {
        String sql = "SELECT * FROM get_user_recommendation_history(?::uuid)";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            List<RecommendedSportDTO> sports =
                    parseJson(rs.getString("sports"), RecommendedSportDTO.class);

            List<RecommendedProductDTO> products =
                    parseJson(rs.getString("products"), RecommendedProductDTO.class);

            return new RecommendationSessionHistoryDTO(
                    UUID.fromString(rs.getString("session_id")),
                    rs.getTimestamp("created_at").toLocalDateTime(),
                    rs.getString("user_level_at_time"),
                    sports,
                    products
            );
        }, userId);
    }

    private <T> List<T> parseJson(String json, Class<T> elementClass) {
        if (json == null) return List.of();
        try {
            JavaType type = objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, elementClass);
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            return List.of();
        }
    }
}