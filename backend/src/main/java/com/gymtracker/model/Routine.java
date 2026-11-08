package com.gymtracker.model;

import jakarta.persistence.*;

import java.time.DayOfWeek;

/** One exercise scheduled on a given weekday, with its target sets/reps/weight. */
@Entity
@Table(name = "WORKOUT_ROUTINE")
public class Routine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "DAY_OF_WEEK", nullable = false, length = 10)
    private DayOfWeek dayOfWeek;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "EXERCISE_ID")
    private Exercise exercise;

    @Column(name = "SET_COUNT", nullable = false)
    private int sets;

    @Column(nullable = false)
    private int reps;

    @Column(name = "WEIGHT_KG")
    private double weightKg;

    @Column(name = "DURATION_MIN")
    private int durationMin;

    @Column(name = "USER_ID")
    private Long userId;

    public Routine() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise exercise) { this.exercise = exercise; }
    public int getSets() { return sets; }
    public void setSets(int sets) { this.sets = sets; }
    public int getReps() { return reps; }
    public void setReps(int reps) { this.reps = reps; }
    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }
    public int getDurationMin() { return durationMin; }
    public void setDurationMin(int durationMin) { this.durationMin = durationMin; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
