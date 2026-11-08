package com.gymtracker.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/** Login session. Only a SHA-256 hash of the token is stored, never the token itself. */
@Entity
@Table(name = "AUTH_TOKEN", uniqueConstraints = @UniqueConstraint(columnNames = "TOKEN_HASH"))
public class AuthToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "TOKEN_HASH", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;

    public AuthToken() {}

    public AuthToken(String tokenHash, Long userId, LocalDateTime expiresAt) {
        this.tokenHash = tokenHash;
        this.userId = userId;
        this.expiresAt = expiresAt;
    }

    public Long getUserId() { return userId; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
}
