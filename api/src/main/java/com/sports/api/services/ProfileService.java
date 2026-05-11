package com.sports.api.services;

import com.sports.api.dto.ProfileRequestDTO;
import com.sports.api.repositories.UserRepository;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void completeUserProfile(UUID userId, ProfileRequestDTO dto) {
        if (dto.budgetMax().compareTo(dto.budgetMin()) < 0) {
            throw new RuntimeException("BUDGET_INVALID: Maximul este mai mic decât minimul");
        }

        try {
            userRepository.completeProfile(userId, dto);
        } catch (Exception e) {
            throw new RuntimeException("PROFILE_UPDATE_ERROR: " + e.getMessage());
        }
    }
}