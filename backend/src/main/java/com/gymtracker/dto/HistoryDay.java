package com.gymtracker.dto;

import java.time.LocalDate;

/** One day in the workout history: how many scheduled exercises were completed. */
public record HistoryDay(LocalDate date, String day, int done, int total, int percent) {
}
