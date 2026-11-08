package com.gymtracker.controller;

import com.gymtracker.config.AuthInterceptor;
import com.gymtracker.dto.RoutineRequest;
import com.gymtracker.dto.RoutineView;
import com.gymtracker.service.RoutineService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    private final RoutineService service;

    public RoutineController(RoutineService service) {
        this.service = service;
    }

    /** Workout list for any date (defaults to today), e.g. /api/routines/day?date=2026-11-05 */
    @GetMapping("/day")
    public List<RoutineView> day(@RequestAttribute(AuthInterceptor.USER_ID) Long userId,
                                 @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.day(userId, date == null ? LocalDate.now() : date);
    }

    /** Whole week grouped by weekday. */
    @GetMapping("/week")
    public Map<DayOfWeek, List<RoutineView>> week(@RequestAttribute(AuthInterceptor.USER_ID) Long userId) {
        return service.week(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoutineView create(@RequestAttribute(AuthInterceptor.USER_ID) Long userId,
                              @Valid @RequestBody RoutineRequest req) {
        return service.create(userId, req);
    }

    @PutMapping("/{id}")
    public RoutineView update(@RequestAttribute(AuthInterceptor.USER_ID) Long userId,
                              @PathVariable Long id, @Valid @RequestBody RoutineRequest req) {
        return service.update(userId, id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestAttribute(AuthInterceptor.USER_ID) Long userId, @PathVariable Long id) {
        service.delete(userId, id);
    }

    /** Toggle "done" for a date (defaults to today; past dates allowed). */
    @PostMapping("/{id}/toggle")
    public Map<String, Boolean> toggle(@RequestAttribute(AuthInterceptor.USER_ID) Long userId,
                                       @PathVariable Long id,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return Map.of("completed", service.toggle(userId, id, date));
    }
}
