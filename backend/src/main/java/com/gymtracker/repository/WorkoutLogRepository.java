package com.gymtracker.repository;

import com.gymtracker.model.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    Optional<WorkoutLog> findByRoutineIdAndLogDate(Long routineId, LocalDate logDate);
    List<WorkoutLog> findByUserIdAndLogDateBetween(Long userId, LocalDate from, LocalDate to);
    void deleteByRoutineId(Long routineId);
}
