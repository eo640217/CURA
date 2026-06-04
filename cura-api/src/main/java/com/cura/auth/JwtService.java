package com.cura.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jws;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMinutes;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration-minutes}") long expirationMinutes
    ) {
        // Option A (simple): raw string bytes
        // IMPORTANT: secret must be >= 32 bytes for HS256 strength.
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        // Option B (recommended for prod): use base64 secret in config
        // byte[] decoded = Decoders.BASE64.decode(secret);
        // this.key = Keys.hmacShaKeyFor(decoded);

        this.expirationMinutes = expirationMinutes;
    }

    public String generateToken(UserPrincipal principal) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(expirationMinutes * 60);

        return Jwts.builder()
                .subject(principal.getUsername())
                .claim("role", "ROLE_" + principal.getRole())
                .claim("orgId", principal.getOrgId())
                .claim("orgCode", principal.getOrgCode())
                .claim("userNumber", principal.getUserNumber())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    public Jws<Claims> parseSignedClaims(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(key)     // 0.12.x signature verification
                .build()
                .parseSignedClaims(token);
    }

    public String extractUsername(String token) {
        return parseSignedClaims(token).getPayload().getSubject();
    }

    public String extractRole(String token) {
        Object role = parseSignedClaims(token).getPayload().get("role");
        return role == null ? null : role.toString();
    }
}
