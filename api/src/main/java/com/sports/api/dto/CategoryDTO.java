package com.sports.api.dto;

import java.util.UUID;

public record CategoryDTO(
    UUID categoryId,
    String name,
    String description,
    UUID parentId
) {}