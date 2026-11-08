package com.gymtracker.service;

import com.gymtracker.dto.AuthResponse;
import com.gymtracker.model.AppUser;
import com.gymtracker.model.AuthToken;
import com.gymtracker.repository.TokenRepository;
import com.gymtracker.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
@Transactional
public class AuthService {

    private static final Duration TOKEN_LIFETIME = Duration.ofDays(30);

    private final UserRepository users;
    private final TokenRepository tokens;
    private final StarterPlanService starterPlan;
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();

    public AuthService(UserRepository users, TokenRepository tokens, StarterPlanService starterPlan) {
        this.users = users;
        this.tokens = tokens;
        this.starterPlan = starterPlan;
    }

    public AuthResponse register(String username, String password) {
        String name = normalize(username);
        if (users.existsByUsername(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That username is already taken");
        }
        AppUser user = users.save(new AppUser(name, encoder.encode(password)));
        starterPlan.createFor(user.getId());
        return issueToken(user);
    }

    public AuthResponse login(String username, String password) {
        AppUser user = users.findByUsername(normalize(username))
                .filter(u -> encoder.matches(password, u.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        return issueToken(user);
    }

    public void logout(String token) {
        tokens.deleteByTokenHash(hash(token));
    }

    /** Resolves a bearer token to a user id, or empty if unknown/expired. */
    @Transactional(readOnly = true)
    public Optional<Long> userIdFor(String token) {
        return tokens.findByTokenHash(hash(token))
                .filter(t -> t.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(AuthToken::getUserId);
    }

    private AuthResponse issueToken(AppUser user) {
        tokens.deleteByExpiresAtBefore(LocalDateTime.now());
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        tokens.save(new AuthToken(hash(token), user.getId(), LocalDateTime.now().plus(TOKEN_LIFETIME)));
        return new AuthResponse(token, user.getUsername());
    }

    private static String normalize(String username) {
        return username.trim().toLowerCase();
    }

    private static String hash(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
