package com.gymtracker.model;

import jakarta.persistence.*;

import java.time.LocalDate;

/** Records that a routine item was completed by a user on a specific date. */
@Entity
@Table(name = "WORKOUT_LOG",
       uniqueConstraints = @UniqueConstraint(columnNames = {"ROUTINE_ID", "LOG_DATE"}))
public class WorkoutLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "ROUTINE_ID", nullable = false)
    private Long routineId;

    @Column(name = "LOG_DATE", nullable = false)
    private LocalDate logDate;

    public WorkoutLog() {}

    public WorkoutLog(Long userId, Long routineId, LocalDate logDate) {
        this.userId = userId;
        this.routineId = routineId;
        this.logDate = logDate;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getRoutineId() { return routineId; }
    public LocalDate getLogDate() { return logDate; }
}
