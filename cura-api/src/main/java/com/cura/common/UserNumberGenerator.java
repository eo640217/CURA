package com.cura.common;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.function.Predicate;

@Component
public class UserNumberGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MIN = 100_000;
    private static final int RANGE = 900_000; // 100000–999999
    private static final int MAX_ATTEMPTS = 5;

    /**
     * Generates a unique 6-digit number, retrying up to MAX_ATTEMPTS times.
     *
     * @param isTaken predicate that returns true if a candidate number is already in use
     * @throws IllegalStateException if all attempts collide (statistically negligible)
     */
    public String generate(Predicate<String> isTaken) {
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            String candidate = String.valueOf(MIN + RANDOM.nextInt(RANGE));
            if (!isTaken.test(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Failed to generate a unique number after " + MAX_ATTEMPTS + " attempts");
    }
}
