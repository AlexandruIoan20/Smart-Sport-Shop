package com.sports.api.services;

import com.sports.api.dto.PersonalDataResponseDTO;
import com.sports.api.dto.ProfileRequestDTO;
import com.sports.api.dto.ProfileResponseDTO;
import com.sports.api.dto.RegisterRequestDTO;
import com.sports.api.dto.UpdatePersonalDataRequestDTO;
import com.sports.api.dto.UserLoginDataDTO;
import com.sports.api.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UUID register(RegisterRequestDTO request) {
        String hashedPassword = passwordEncoder.encode(request.password());
        return userRepository.callRegisterUserFunction(request, hashedPassword);
    }

    public UserLoginDataDTO getUserForLogin(String email) {
        return userRepository.getUserForLogin(email);
    }

    public UUID completeProfile(UUID userId, ProfileRequestDTO dto) {
        return userRepository.completeProfile(userId, dto);
    }

    public ProfileResponseDTO getUserProfile(UUID userId) {
        return userRepository.getUserProfile(userId);
    }

    public UUID generateRecommendations(UUID profileId) {
        return userRepository.generateRecommendations(profileId);
    }

    public Boolean updatePersonalData(UUID userId, UpdatePersonalDataRequestDTO dto) {
        if (dto.firstName() == null || dto.firstName().trim().isEmpty()) {
            throw new IllegalArgumentException("Prenumele este obligatoriu.");
        }
        if (dto.lastName() == null || dto.lastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Numele este obligatoriu.");
        }
        return userRepository.updatePersonalData(userId, dto);
    }

    public PersonalDataResponseDTO getPersonalData(UUID userId) {
        return userRepository.getPersonalData(userId);
    }
}