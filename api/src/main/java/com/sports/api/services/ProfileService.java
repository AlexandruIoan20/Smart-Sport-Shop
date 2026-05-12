package com.sports.api.services;

import com.sports.api.dto.ProfileRequestDTO;
import com.sports.api.dto.ProfileResponseDTO;
import com.sports.api.repositories.UserRepository;
import org.springframework.dao.DataAccessException;
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

    public UUID completeUserProfile(UUID userId, ProfileRequestDTO dto) {
        if (dto.budgetMin() != null && dto.budgetMax() != null
                && dto.budgetMax() < dto.budgetMin()) {
            throw new IllegalArgumentException("BUDGET_INVALID");
        }

        try {
            UUID profileId = userRepository.completeProfile(userId, dto);
            userRepository.generateRecommendations(profileId);

        } catch (DataAccessException e) {
            String msg = getString(e);

            throw new RuntimeException("PROFILE_UPDATE_ERROR: " + msg);
        }
        return userId;
    }

    private static String getString(DataAccessException e) {
        String msg = e.getMostSpecificCause().getMessage();

        if (msg != null && msg.contains("BUDGET_INVALID")) {
            throw new IllegalArgumentException("BUDGET_INVALID");
        }
        if (msg != null && msg.contains("PROFILE_NOT_FOUND")) {
            throw new IllegalArgumentException("PROFILE_NOT_FOUND");
        }
        if (msg != null && msg.contains("PROFILE_INCOMPLETE")) {
            throw new IllegalArgumentException("PROFILE_INCOMPLETE");
        }
        return msg;
    }
}