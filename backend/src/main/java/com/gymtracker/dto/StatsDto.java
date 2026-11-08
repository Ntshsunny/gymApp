package com.gymtracker.dto;

import java.util.List;

public record StatsDto(
        int todayDone,
        int todayTotal,
        int todayPercent,
        int weekDone,
        int weekTotal,
        int weekPercent,
        int streakDays,
        int minutesPlannedWeek,
        List<MuscleStat> muscleGroups,
        List<DayStat> days) {

    /** Share of this week's routine items per muscle group. */
    public record MuscleStat(String muscleGroup, int count, int percent) {}

    /** Completion for one day of the current week. */
    public record DayStat(String day, int done, int total, int percent) {}
}
