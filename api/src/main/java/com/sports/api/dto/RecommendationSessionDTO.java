package com.sports.api.dto;

import java.util.UUID;

public record RecommendationSessionDTO(
    UUID sessionId,
    String userLevel,
    String createdAt
) {}