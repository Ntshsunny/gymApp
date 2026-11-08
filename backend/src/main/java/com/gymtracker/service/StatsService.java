package com.gymtracker.service;

import com.gymtracker.dto.HistoryDay;
import com.gymtracker.dto.StatsDto;
import com.gymtracker.dto.StatsDto.DayStat;
import com.gymtracker.dto.StatsDto.MuscleStat;
import com.gymtracker.model.Routine;
import com.gymtracker.model.WorkoutLog;
import com.gymtracker.repository.RoutineRepository;
import com.gymtracker.repository.WorkoutLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {

    private final RoutineRepository routines;
    private final WorkoutLogRepository logs;

    public StatsService(RoutineRepository routines, WorkoutLogRepository logs) {
        this.routines = routines;
        this.logs = logs;
    }

    @Transactional(readOnly = true)
    public StatsDto stats(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate start = RoutineService.weekStart(today);
        LocalDate end = start.plusDays(6);

        List<Routine> all = routines.findByUserId(userId);
        Map<DayOfWeek, List<Routine>> byDay = groupByDay(all);

        // Logs for the current week + the lookback window used for the streak.
        Map<LocalDate, Set<Long>> doneByDate = doneByDate(userId, today.minusDays(60), end);

        // Per-day completion for the current week.
        List<DayStat> days = new ArrayList<>();
        int weekDone = 0, weekTotal = 0;
        for (int i = 0; i < 7; i++) {
            LocalDate d = start.plusDays(i);
            List<Routine> planned = byDay.getOrDefault(d.getDayOfWeek(), List.of());
            int done = countDone(planned, doneByDate.get(d));
            days.add(new DayStat(d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    done, planned.size(), percent(done, planned.size())));
            weekDone += done;
            weekTotal += planned.size();
        }

        List<Routine> todayPlanned = byDay.getOrDefault(today.getDayOfWeek(), List.of());
        int todayDone = countDone(todayPlanned, doneByDate.get(today));

        // Muscle group share of the week's plan.
        Map<String, Long> muscle = all.stream().collect(
                Collectors.groupingBy(r -> r.getExercise().getMuscleGroup(), TreeMap::new, Collectors.counting()));
        List<MuscleStat> muscleStats = muscle.entrySet().stream()
                .map(e -> new MuscleStat(e.getKey(), e.getValue().intValue(), percent(e.getValue().intValue(), all.size())))
                .sorted(Comparator.comparingInt(MuscleStat::count).reversed())
                .toList();

        int minutes = all.stream().mapToInt(Routine::getDurationMin).sum();

        return new StatsDto(todayDone, todayPlanned.size(), percent(todayDone, todayPlanned.size()),
                weekDone, weekTotal, percent(weekDone, weekTotal),
                streak(today, byDay, doneByDate), minutes, muscleStats, days);
    }

    /** Completion per day for the last {@code days} days, newest first. */
    @Transactional(readOnly = true)
    public List<HistoryDay> history(Long userId, int days) {
        int n = Math.min(Math.max(days, 1), 90);
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(n - 1L);

        Map<DayOfWeek, List<Routine>> byDay = groupByDay(routines.findByUserId(userId));
        Map<LocalDate, Set<Long>> doneByDate = doneByDate(userId, from, today);

        List<HistoryDay> result = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            LocalDate d = today.minusDays(i);
            List<Routine> planned = byDay.getOrDefault(d.getDayOfWeek(), List.of());
            int done = countDone(planned, doneByDate.get(d));
            result.add(new HistoryDay(d, d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    done, planned.size(), percent(done, planned.size())));
        }
        return result;
    }

    private Map<DayOfWeek, List<Routine>> groupByDay(List<Routine> all) {
        return all.stream().collect(Collectors.groupingBy(Routine::getDayOfWeek));
    }

    private Map<LocalDate, Set<Long>> doneByDate(Long userId, LocalDate from, LocalDate to) {
        Map<LocalDate, Set<Long>> map = new HashMap<>();
        for (WorkoutLog l : logs.findByUserIdAndLogDateBetween(userId, from, to)) {
            map.computeIfAbsent(l.getLogDate(), d -> new HashSet<>()).add(l.getRoutineId());
        }
        return map;
    }

    /** Consecutive scheduled workout days fully completed. Rest days are skipped; today doesn't break it. */
    private int streak(LocalDate today, Map<DayOfWeek, List<Routine>> byDay, Map<LocalDate, Set<Long>> doneByDate) {
        int streak = 0;
        for (int i = 0; i <= 60; i++) {
            LocalDate d = today.minusDays(i);
            List<Routine> planned = byDay.getOrDefault(d.getDayOfWeek(), List.of());
            if (planned.isEmpty()) continue;
            boolean complete = countDone(planned, doneByDate.get(d)) == planned.size();
            if (complete) streak++;
            else if (i != 0) break;
        }
        return streak;
    }

    private int countDone(List<Routine> planned, Set<Long> doneIds) {
        if (doneIds == null) return 0;
        return (int) planned.stream().filter(r -> doneIds.contains(r.getId())).count();
    }

    private int percent(int part, int total) {
        return total == 0 ? 0 : Math.round(part * 100f / total);
    }
}
