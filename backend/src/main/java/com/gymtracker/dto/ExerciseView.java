package com.gymtracker.dto;

import com.gymtracker.model.Exercise;

/** custom = true when the exercise was created by the current user (can be deleted). */
public record ExerciseView(Long id, String name, String muscleGroup, String videoUrl,
                           String description, boolean custom) {

    public static ExerciseView of(Exercise e, Long userId) {
        return new ExerciseView(e.getId(), e.getName(), e.getMuscleGroup(), e.getVideoUrl(),
                e.getDescription(), userId.equals(e.getOwnerId()));
    }
}
