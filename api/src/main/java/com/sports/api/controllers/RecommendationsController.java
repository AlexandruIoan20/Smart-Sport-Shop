package com.sports.api.controllers;

import com.sports.api.dto.FullRecommendationDTO;
import com.sports.api.dto.RecommendationSessionHistoryDTO;
import com.sports.api.services.RecommendationsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationsController {
    private final RecommendationsService recommendationsService;

    public RecommendationsController(RecommendationsService recommendationsService) {
        this.recommendationsService = recommendationsService;
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestRecommendations(
            @RequestHeader("X-User-Id") UUID userId) {
        try {
            FullRecommendationDTO result = recommendationsService.getLatestRecommendations(userId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getRecommendationsBySession(
            @PathVariable UUID sessionId) {
        try {
            FullRecommendationDTO result = recommendationsService.getRecommendationsBySession(sessionId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<RecommendationSessionHistoryDTO>> getRecommendationHistory(
            @PathVariable UUID userId) {

        List<RecommendationSessionHistoryDTO> history = recommendationsService.getRecommendationHistory(userId);
        if (history.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(history);
    }
}