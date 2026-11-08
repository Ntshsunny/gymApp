package com.gymtracker.config;

import com.gymtracker.model.Exercise;
import com.gymtracker.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Loads the built-in exercise library on first run (shared by all users).
 * Each new user gets a sample weekly plan from StarterPlanService on sign-up.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final ExerciseRepository exercises;
    private final boolean enabled;

    public DataSeeder(ExerciseRepository exercises, @Value("${app.seed-data}") boolean enabled) {
        this.exercises = exercises;
        this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled || exercises.count() > 0) return;

        add("Barbell Bench Press", "Chest", "https://www.youtube.com/results?search_query=barbell+bench+press+form", "Lie flat, lower the bar to mid-chest, press up.");
        add("Incline Dumbbell Press", "Chest", "https://www.youtube.com/results?search_query=incline+dumbbell+press+form", "30-45 degree bench, press dumbbells over upper chest.");
        add("Push-Ups", "Chest", "https://www.youtube.com/results?search_query=push+up+proper+form", "Body in a straight line, chest to floor.");
        add("Pull-Ups", "Back", "https://www.youtube.com/results?search_query=pull+up+proper+form", "Overhand grip, pull chin above the bar.");
        add("Barbell Row", "Back", "https://www.youtube.com/results?search_query=barbell+row+form", "Hinge at hips, pull bar to lower ribs.");
        add("Lat Pulldown", "Back", "https://www.youtube.com/results?search_query=lat+pulldown+form", "Pull the bar to upper chest, squeeze shoulder blades.");
        add("Barbell Squat", "Legs", "https://www.youtube.com/results?search_query=barbell+squat+form", "Brace core, sit back and down, drive through heels.");
        add("Romanian Deadlift", "Legs", "https://www.youtube.com/results?search_query=romanian+deadlift+form", "Soft knees, hinge hips back, keep bar close.");
        add("Walking Lunges", "Legs", "https://www.youtube.com/results?search_query=walking+lunges+form", "Long stride, knee tracks over toes.");
        add("Overhead Press", "Shoulders", "https://www.youtube.com/results?search_query=overhead+press+form", "Press the bar overhead, ribs down, glutes tight.");
        add("Lateral Raises", "Shoulders", "https://www.youtube.com/results?search_query=lateral+raise+form", "Raise dumbbells to shoulder height with soft elbows.");
        add("Barbell Curl", "Arms", "https://www.youtube.com/results?search_query=barbell+curl+form", "Elbows pinned, curl without swinging.");
        add("Tricep Pushdown", "Arms", "https://www.youtube.com/results?search_query=tricep+pushdown+form", "Elbows at sides, extend fully.");
        add("Plank", "Core", "https://www.youtube.com/results?search_query=plank+proper+form", "Forearms down, hold a straight line.");
        add("Hanging Leg Raise", "Core", "https://www.youtube.com/results?search_query=hanging+leg+raise+form", "Control the raise, no swinging.");
        add("Treadmill Run", "Cardio", "https://www.youtube.com/results?search_query=treadmill+running+form", "Steady pace, relaxed shoulders.");
    }

    private void add(String name, String group, String url, String desc) {
        exercises.save(new Exercise(name, group, url, desc)); // ownerId stays null = built-in
    }
}
