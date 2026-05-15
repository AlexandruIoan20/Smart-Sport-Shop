package com.sports.api.services;

import com.sports.api.dto.SportResponseDTO;
import com.sports.api.repositories.SportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SportService {
    private final SportRepository sportRepository;

    public SportService(SportRepository sportRepository) {
        this.sportRepository = sportRepository;
    }

    public List<SportResponseDTO> getAllSports() {
        return sportRepository.getAllSports();
    }

    public SportResponseDTO getSportById(UUID sportId) {
        return sportRepository.getSportById(sportId);
    }
}