package com.gymtracker.config;

import com.gymtracker.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

/** Requires a valid "Authorization: Bearer <token>" header and exposes the user id to controllers. */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String USER_ID = "userId";

    private final AuthService auth;

    public AuthInterceptor(AuthService auth) {
        this.auth = auth;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) return true; // CORS preflight

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            Optional<Long> userId = auth.userIdFor(header.substring(7));
            if (userId.isPresent()) {
                req.setAttribute(USER_ID, userId.get());
                return true;
            }
        }
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        return false;
    }
}
