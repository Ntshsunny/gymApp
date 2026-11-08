package com.gymtracker.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;

public record RoutineRequest(
        @NotNull DayOfWeek dayOfWeek,
        @NotNull Long exerciseId,
        @Min(1) @Max(20) int sets,
        @Min(1) @Max(100) int reps,
        @Min(0) double weightKg,
        @Min(0) int durationMin) {
}
