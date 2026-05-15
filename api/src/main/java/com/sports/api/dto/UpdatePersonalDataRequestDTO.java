package com.sports.api.dto;

public record UpdatePersonalDataRequestDTO(
    String firstName,
    String lastName,
    String phone,
    String address
) {}