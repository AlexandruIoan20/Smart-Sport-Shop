package com.sports.api.dto;

import java.util.UUID;

public record CategoryResponseDTO (
    UUID categoryId,
    String name,
    UUID parentId,
    String description
) {
}
