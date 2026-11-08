package com.gymtracker.repository;

import com.gymtracker.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface RoutineRepository extends JpaRepository<Routine, Long> {
    List<Routine> findByUserId(Long userId);
    List<Routine> findByUserIdAndDayOfWeekOrderByIdAsc(Long userId, DayOfWeek dayOfWeek);
    Optional<Routine> findByIdAndUserId(Long id, Long userId);
    boolean existsByExerciseId(Long exerciseId);
}
