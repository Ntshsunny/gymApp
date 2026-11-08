package com.gymtracker.repository;

import com.gymtracker.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    /** Built-in exercises plus the ones this user created. */
    @Query("select e from Exercise e where e.ownerId is null or e.ownerId = :userId order by e.muscleGroup, e.name")
    List<Exercise> findVisible(@Param("userId") Long userId);
}
