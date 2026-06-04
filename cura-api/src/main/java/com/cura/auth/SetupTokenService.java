package com.cura.auth;

import com.cura.common.error.ApiException;
import com.cura.common.error.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
public class SetupTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long EXPIRY_HOURS = 48;

    private final SetupTokenRepository tokenRepo;

    public SetupTokenService(SetupTokenRepository tokenRepo) {
        this.tokenRepo = tokenRepo;
    }

    /**
     * Generates a secure one-time setup token for the given user.
     * Stores the SHA-256 hash in the database and returns the raw token.
     */
    @Transactional
    public String generate(Long userId) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        SetupToken token = new SetupToken();
        token.setUserId(userId);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(Instant.now().plusSeconds(EXPIRY_HOURS * 3600));
        token.setUsed(false);
        tokenRepo.save(token);

        return rawToken;
    }

    /**
     * Validates and consumes a raw token. Returns the associated user ID.
     * Throws ApiException for invalid, expired, or already-used tokens.
     */
    @Transactional
    public Long consume(String rawToken) {
        String h = hash(rawToken);
        SetupToken token = tokenRepo.findByTokenHash(h)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.VALIDATION_FAILED,
                        "Invalid setup link"));

        if (token.isUsed()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.VALIDATION_FAILED,
                    "Setup link has already been used");
        }
        if (Instant.now().isAfter(token.getExpiresAt())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.VALIDATION_FAILED,
                    "Setup link has expired (valid for 48 hours)");
        }

        token.setUsed(true);
        tokenRepo.save(token);
        return token.getUserId();
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : hashBytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
