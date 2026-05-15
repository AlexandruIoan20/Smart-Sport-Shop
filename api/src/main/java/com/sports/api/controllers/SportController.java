package com.sports.api.controllers;

import com.sports.api.dto.SportResponseDTO;
import com.sports.api.services.SportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sports")
@CrossOrigin(origins = "*")
public class SportController {

    private final SportService sportService;

    public SportController(SportService sportService) {
        this.sportService = sportService;
    }

    @GetMapping
    public ResponseEntity<List<SportResponseDTO>> getAllSports() {
        List<SportResponseDTO> sports = sportService.getAllSports();
        return ResponseEntity.ok(sports);
    }

    @GetMapping("/{sportId}")
    public ResponseEntity<SportResponseDTO> getSportById(@PathVariable UUID sportId) {
        SportResponseDTO sport = sportService.getSportById(sportId);
        return ResponseEntity.ok(sport);
    }
}