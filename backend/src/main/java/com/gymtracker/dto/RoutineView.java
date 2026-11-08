package com.gymtracker.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;

/** A routine item as shown in the app, including whether it's done for the relevant date. */
public record RoutineView(
        Long id,
        DayOfWeek dayOfWeek,
        LocalDate date,
        Long exerciseId,
        String exerciseName,
        String muscleGroup,
        String videoUrl,
        int sets,
        int reps,
        double weightKg,
        int durationMin,
        boolean completed) {
}
