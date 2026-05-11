package com.sports.api.dto;

import java.time.LocalDate;

public record RegisterRequestDTO (
    String username,
    String email,
    String password,
    String firstName,
    String lastName,
    LocalDate birthDate
){
}
