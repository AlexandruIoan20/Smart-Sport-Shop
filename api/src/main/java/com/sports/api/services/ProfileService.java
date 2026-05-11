package com.sports.api.services;

import com.sports.api.dto.ProfileRequestDTO;
import com.sports.api.dto.ProfileResponseDTO;
import com.sports.api.repositories.UserRepository;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public ProfileResponseDTO getUserProfile(UUID userId) {
        return userRepository.getUserProfile(userId);
    }


    public void completeUserProfile(UUID userId, ProfileRequestDTO dto) {
        if (dto.budgetMin() != null && dto.budgetMax() != null && dto.budgetMax().compareTo(dto.budgetMin()) < 0) {
            throw new IllegalArgumentException("BUDGET_INVALID");
        }

        try {
            userRepository.completeProfile(userId, dto);
        } catch (Exception e) {
            String msg = e.getCause().getMessage();
            if (msg != null && msg.contains("BUDGET_INVALID")) {
                throw new IllegalArgumentException("BUDGET_INVALID");
            }
            throw new RuntimeException("PROFILE_UPDATE_ERROR: " + msg);
        }
    }
}