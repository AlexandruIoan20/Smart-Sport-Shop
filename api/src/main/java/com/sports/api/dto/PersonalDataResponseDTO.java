package com.sports.api.dto;

public record PersonalDataResponseDTO(
    String firstName,
    String lastName,
    String email,
    String phone,
    String address,
    String birthDate
) {}
