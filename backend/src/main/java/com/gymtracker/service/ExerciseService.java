package com.gymtracker.service;

import com.gymtracker.dto.ExerciseRequest;
import com.gymtracker.dto.ExerciseView;
import com.gymtracker.model.Exercise;
import com.gymtracker.repository.ExerciseRepository;
import com.gymtracker.repository.RoutineRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ExerciseService {

    private final ExerciseRepository exercises;
    private final RoutineRepository routines;

    public ExerciseService(ExerciseRepository exercises, RoutineRepository routines) {
        this.exercises = exercises;
        this.routines = routines;
    }

    @Transactional(readOnly = true)
    public List<ExerciseView> list(Long userId) {
        return exercises.findVisible(userId).stream().map(e -> ExerciseView.of(e, userId)).toList();
    }

    @Transactional
    public ExerciseView create(Long userId, ExerciseRequest req) {
        Exercise e = new Exercise(req.name().trim(), req.muscleGroup().trim(), req.videoUrl(),
                req.description() == null || req.description().isBlank() ? null : req.description().trim());
        e.setOwnerId(userId);
        return ExerciseView.of(exercises.save(e), userId);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        Exercise e = exercises.findById(id)
                .filter(x -> userId.equals(x.getOwnerId()))   // built-ins and other users' exercises are off limits
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));
        if (routines.existsByExerciseId(e.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Remove it from your plan first");
        }
        exercises.delete(e);
    }
}
