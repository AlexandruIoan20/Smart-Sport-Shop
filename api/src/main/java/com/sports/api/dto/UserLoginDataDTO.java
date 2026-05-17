package com.sports.api.dto;

import java.util.UUID;

public record UserLoginDataDTO (UUID id, String passwordHash) {}
