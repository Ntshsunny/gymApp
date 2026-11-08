package com.gymtracker.controller;

import com.gymtracker.config.AuthInterceptor;
import com.gymtracker.dto.HistoryDay;
import com.gymtracker.dto.StatsDto;
import com.gymtracker.service.StatsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class StatsController {

    private final StatsService stats;

    public StatsController(StatsService stats) {
        this.stats = stats;
    }

    @GetMapping("/stats")
    public StatsDto stats(@RequestAttribute(AuthInterceptor.USER_ID) Long userId) {
        return stats.stats(userId);
    }

    /** Day-by-day completion for the last N days (max 90), newest first. */
    @GetMapping("/history")
    public List<HistoryDay> history(@RequestAttribute(AuthInterceptor.USER_ID) Long userId,
                                    @RequestParam(defaultValue = "30") int days) {
        return stats.history(userId, days);
    }
}
