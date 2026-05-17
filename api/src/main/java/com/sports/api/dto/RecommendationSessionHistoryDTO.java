package com.sports.api.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record RecommendationSessionHistoryDTO(
    UUID sessionId,
    LocalDateTime createdAt,
    String userLevelAtTime,
    List<RecommendedSportDTO>   sports,
    List<RecommendedProductDTO> products
) {}