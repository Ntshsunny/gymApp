package com.gymtracker.service;

import com.gymtracker.model.Exercise;
import com.gymtracker.model.Routine;
import com.gymtracker.repository.ExerciseRepository;
import com.gymtracker.repository.RoutineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Gives every new user a sample weekly split they can edit. */
@Service
public class StarterPlanService {

    private record Item(DayOfWeek day, String exercise, int sets, int reps, double kg, int minutes) {}

    // Mon Chest, Tue Back, Wed Legs, Thu Shoulders+Arms, Fri Core, Sat Cardio, Sun rest.
    private static final List<Item> PLAN = List.of(
            new Item(DayOfWeek.MONDAY, "Barbell Bench Press", 4, 8, 60, 15),
            new Item(DayOfWeek.MONDAY, "Incline Dumbbell Press", 3, 10, 22, 12),
            new Item(DayOfWeek.MONDAY, "Push-Ups", 3, 15, 0, 8),
            new Item(DayOfWeek.TUESDAY, "Pull-Ups", 4, 8, 0, 12),
            new Item(DayOfWeek.TUESDAY, "Barbell Row", 4, 8, 50, 14),
            new Item(DayOfWeek.TUESDAY, "Lat Pulldown", 3, 12, 45, 10),
            new Item(DayOfWeek.WEDNESDAY, "Barbell Squat", 4, 8, 80, 18),
            new Item(DayOfWeek.WEDNESDAY, "Romanian Deadlift", 3, 10, 60, 14),
            new Item(DayOfWeek.WEDNESDAY, "Walking Lunges", 3, 12, 16, 10),
            new Item(DayOfWeek.THURSDAY, "Overhead Press", 4, 8, 40, 14),
            new Item(DayOfWeek.THURSDAY, "Lateral Raises", 3, 15, 8, 8),
            new Item(DayOfWeek.THURSDAY, "Barbell Curl", 3, 10, 25, 9),
            new Item(DayOfWeek.THURSDAY, "Tricep Pushdown", 3, 12, 30, 9),
            new Item(DayOfWeek.FRIDAY, "Plank", 3, 1, 0, 6),
            new Item(DayOfWeek.FRIDAY, "Hanging Leg Raise", 3, 12, 0, 8),
            new Item(DayOfWeek.SATURDAY, "Treadmill Run", 1, 1, 0, 30));

    private final ExerciseRepository exercises;
    private final RoutineRepository routines;

    public StarterPlanService(ExerciseRepository exercises, RoutineRepository routines) {
        this.exercises = exercises;
        this.routines = routines;
    }

    @Transactional
    public void createFor(Long userId) {
        Map<String, Exercise> builtIn = exercises.findAll().stream()
                .filter(e -> e.getOwnerId() == null)
                .collect(Collectors.toMap(Exercise::getName, Function.identity(), (a, b) -> a));

        for (Item i : PLAN) {
            Exercise ex = builtIn.get(i.exercise());
            if (ex == null) continue;
            Routine r = new Routine();
            r.setUserId(userId);
            r.setDayOfWeek(i.day());
            r.setExercise(ex);
            r.setSets(i.sets());
            r.setReps(i.reps());
            r.setWeightKg(i.kg());
            r.setDurationMin(i.minutes());
            routines.save(r);
        }
    }
}
