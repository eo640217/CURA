package com.cura.common;

import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.*;

class UserNumberGeneratorTest {

    private final UserNumberGenerator generator = new UserNumberGenerator();

    @Test
    void generate_returnsSixDigitNumber() {
        String number = generator.generate(n -> false);
        assertThat(number).hasSize(6);
        assertThat(Integer.parseInt(number)).isBetween(100_000, 999_999);
    }

    @Test
    void generate_retriesOnCollision() {
        AtomicInteger callCount = new AtomicInteger(0);
        // reject first 3 candidates, accept 4th
        String number = generator.generate(n -> callCount.incrementAndGet() <= 3);
        assertThat(number).hasSize(6);
        assertThat(callCount.get()).isEqualTo(4);
    }

    @Test
    void generate_throwsWhenAllAttemptsCollide() {
        assertThatThrownBy(() -> generator.generate(n -> true))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Failed to generate");
    }

    @Test
    void generate_producesUniqueNumbers() {
        Set<String> seen = new java.util.HashSet<>();
        for (int i = 0; i < 100; i++) {
            String n = generator.generate(seen::contains);
            seen.add(n);
        }
        assertThat(seen).hasSize(100);
    }
}
