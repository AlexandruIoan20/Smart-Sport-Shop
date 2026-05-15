package com.sports.api.services;

import com.sports.api.dto.FullRecommendationDTO;
import com.sports.api.dto.RecommendationSessionHistoryDTO;
import com.sports.api.repositories.RecommendationsRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RecommendationsService {
    private final RecommendationsRepository recommendationsRepository;

    public RecommendationsService(RecommendationsRepository recommendationsRepository) {
        this.recommendationsRepository = recommendationsRepository;
    }

    public FullRecommendationDTO getLatestRecommendations(UUID userId) {
        try {
            UUID sessionId = recommendationsRepository.getLatestSessionByUser(userId);
            return recommendationsRepository.getRecommendationsBySession(sessionId);
        } catch (DataAccessException e) {
            String msg = e.getMostSpecificCause().getMessage();

            if (msg != null && msg.contains("NO_RECOMMENDATIONS_FOUND"))
                throw new IllegalArgumentException("NO_RECOMMENDATIONS_FOUND");
            if (msg != null && msg.contains("SESSION_NOT_FOUND"))
                throw new IllegalArgumentException("SESSION_NOT_FOUND");

            throw new RuntimeException("RECOMMENDATIONS_ERROR: " + msg);
        }
    }

    public FullRecommendationDTO getRecommendationsBySession(UUID sessionId) {
        try {
            return recommendationsRepository.getRecommendationsBySession(sessionId);
        } catch (DataAccessException e) {
            String msg = e.getMostSpecificCause().getMessage();

            if (msg != null && msg.contains("SESSION_NOT_FOUND"))
                throw new IllegalArgumentException("SESSION_NOT_FOUND");

            throw new RuntimeException("RECOMMENDATIONS_ERROR: " + msg);
        }
    }

    public List<RecommendationSessionHistoryDTO> getRecommendationHistory(UUID userId) {
        return recommendationsRepository.getRecommendationHistory(userId);
    }
}