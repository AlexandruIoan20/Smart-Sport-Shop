package com.sports.api.services;

import com.sports.api.dto.LoginRequestDTO;
import com.sports.api.dto.LoginResponseDTO;
import com.sports.api.dto.RegisterRequestDTO;
import com.sports.api.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = new BCryptPasswordEncoder();
    }

    // --- REGISTER ---
    public UUID register(RegisterRequestDTO request) {
        String hashedPassword = bCryptPasswordEncoder.encode(request.password());

        try {
            return userRepository.callRegisterUserFunction(request, hashedPassword);
        } catch (Exception e) {
            String message = e.getMessage();
            if (message != null) {
                if (message.contains("EMAIL_ALREADY_EXISTS")) throw new RuntimeException("EMAIL_DUPLICAT");
                if (message.contains("USERNAME_ALREADY_EXISTS")) throw new RuntimeException("USERNAME_DUPLICAT");
            }
            throw new RuntimeException("DATABASE_ERROR");
        }
    }

    public LoginResponseDTO login(LoginRequestDTO request) {
        var userData = userRepository.getUserForLogin(request.email());

        if (userData == null) {
            throw new RuntimeException("USER_NOT_FOUND");
        }

        boolean isPasswordMatch = bCryptPasswordEncoder.matches(request.password(), userData.passwordHash());

        if (!isPasswordMatch) {
            throw new RuntimeException("INVALID_PASSWORD");
        }

        return new LoginResponseDTO(userData.id());
    }
}