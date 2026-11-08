package com.gymtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AuthRequest(
        @NotBlank @Size(min = 3, max = 30) @Pattern(regexp = "^[A-Za-z0-9_.-]+$") String username,
        @NotBlank @Size(min = 6, max = 72) String password) {
}
