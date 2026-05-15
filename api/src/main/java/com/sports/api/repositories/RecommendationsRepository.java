package com.sports.api.repositories;

import com.sports.api.dto.FullRecommendationDTO;
import com.sports.api.dto.RecommendedProductDTO;
import com.sports.api.dto.RecommendedSportDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class RecommendationsRepository {
    private final JdbcTemplate jdbcTemplate;

    public RecommendationsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
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
}