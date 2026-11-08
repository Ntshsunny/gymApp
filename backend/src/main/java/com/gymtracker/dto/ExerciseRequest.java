package com.gymtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ExerciseRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 50) String muscleGroup,
        // Only http(s) links are accepted so the app never renders javascript: URLs.
        @Size(max = 500) @Pattern(regexp = "^https?://\\S+$") String videoUrl,
        @Size(max = 500) String description) {
}
