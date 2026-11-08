package com.gymtracker.controller;

import com.gymtracker.config.AuthInterceptor;
import com.gymtracker.dto.ExerciseRequest;
import com.gymtracker.dto.ExerciseView;
import com.gymtracker.service.ExerciseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService service;

    public ExerciseController(ExerciseService service) {
        this.service = service;
    }

    /** Built-in exercises plus the user's own, each with its sample video link. */
    @GetMapping
    public List<ExerciseView> list(@RequestAttribute(AuthInterceptor.USER_ID) Long userId) {
        return service.list(userId);
    }

    /** Add a personal exercise (name, muscle group / category, video link). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExerciseView create(@RequestAttribute(AuthInterceptor.USER_ID) Long userId,
                               @Valid @RequestBody ExerciseRequest req) {
        return service.create(userId, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestAttribute(AuthInterceptor.USER_ID) Long userId, @PathVariable Long id) {
        service.delete(userId, id);
    }
}
