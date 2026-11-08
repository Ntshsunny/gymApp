package com.gymtracker.service;

import com.gymtracker.dto.RoutineRequest;
import com.gymtracker.dto.RoutineView;
import com.gymtracker.model.Routine;
import com.gymtracker.model.WorkoutLog;
import com.gymtracker.repository.ExerciseRepository;
import com.gymtracker.repository.RoutineRepository;
import com.gymtracker.repository.WorkoutLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoutineService {

    private final RoutineRepository routines;
    private final ExerciseRepository exercises;
    private final WorkoutLogRepository logs;

    public RoutineService(RoutineRepository routines, ExerciseRepository exercises, WorkoutLogRepository logs) {
        this.routines = routines;
        this.exercises = exercises;
        this.logs = logs;
    }

    public static LocalDate weekStart(LocalDate d) {
        return d.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    /** The user's routine for the weekday of {@code date}, with done/not-done state for that exact date. */
    @Transactional(readOnly = true)
    public List<RoutineView> day(Long userId, LocalDate date) {
        Set<Long> done = logs.findByUserIdAndLogDateBetween(userId, date, date).stream()
                .map(WorkoutLog::getRoutineId).collect(Collectors.toSet());
        return routines.findByUserIdAndDayOfWeekOrderByIdAsc(userId, date.getDayOfWeek()).stream()
                .map(r -> toView(r, date, done.contains(r.getId())))
                .toList();
    }

    /** All routines of the current week, grouped by weekday (Monday first). */
    @Transactional(readOnly = true)
    public Map<DayOfWeek, List<RoutineView>> week(Long userId) {
        LocalDate start = weekStart(LocalDate.now());
        Map<DayOfWeek, List<RoutineView>> result = new LinkedHashMap<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = start.plusDays(i);
            result.put(date.getDayOfWeek(), day(userId, date));
        }
        return result;
    }

    @Transactional
    public RoutineView create(Long userId, RoutineRequest req) {
        Routine r = new Routine();
        r.setUserId(userId);
        apply(userId, r, req);
        return toView(routines.save(r), null, false);
    }

    @Transactional
    public RoutineView update(Long userId, Long id, RoutineRequest req) {
        Routine r = owned(userId, id);
        apply(userId, r, req);
        return toView(routines.save(r), null, false);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        Routine r = owned(userId, id);
        logs.deleteByRoutineId(r.getId());
        routines.delete(r);
    }

    /** Marks the routine done/undone on {@code date} (today when null). Past dates are allowed. Returns the new state. */
    @Transactional
    public boolean toggle(Long userId, Long routineId, LocalDate date) {
        Routine r = owned(userId, routineId);
        LocalDate d = date == null ? LocalDate.now() : date;
        // One day of slack so a client in an earlier-ahead timezone can still log "today".
        if (d.isAfter(LocalDate.now().plusDays(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can't log a future workout");
        }
        if (d.getDayOfWeek() != r.getDayOfWeek()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This exercise isn't scheduled on that day");
        }
        var existing = logs.findByRoutineIdAndLogDate(r.getId(), d);
        if (existing.isPresent()) {
            logs.delete(existing.get());
            return false;
        }
        logs.save(new WorkoutLog(userId, r.getId(), d));
        return true;
    }

    private Routine owned(Long userId, Long id) {
        return routines.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Routine not found"));
    }

    private void apply(Long userId, Routine r, RoutineRequest req) {
        r.setDayOfWeek(req.dayOfWeek());
        r.setExercise(exercises.findById(req.exerciseId())
                .filter(e -> e.getOwnerId() == null || e.getOwnerId().equals(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found")));
        r.setSets(req.sets());
        r.setReps(req.reps());
        r.setWeightKg(req.weightKg());
        r.setDurationMin(req.durationMin());
    }

    private RoutineView toView(Routine r, LocalDate date, boolean completed) {
        var e = r.getExercise();
        return new RoutineView(r.getId(), r.getDayOfWeek(), date, e.getId(), e.getName(),
                e.getMuscleGroup(), e.getVideoUrl(), r.getSets(), r.getReps(),
                r.getWeightKg(), r.getDurationMin(), completed);
    }
}
