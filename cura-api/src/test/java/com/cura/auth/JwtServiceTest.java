package com.cura.auth;

import com.cura.organization.Organization;
import com.cura.user.User;
import com.cura.user.UserRole;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

class JwtServiceTest {

    private static final String SECRET = "test-secret-at-least-32-characters-long!!";
    private static final long EXPIRY_MINUTES = 60;

    private JwtService jwtService;
    private UserPrincipal principal;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, EXPIRY_MINUTES);

        Organization org = new Organization("Cura HQ");
        ReflectionTestUtils.setField(org, "id", 1L);
        ReflectionTestUtils.setField(org, "orgCode", "CURA");

        User user = new User();
        user.setUsername("admin");
        user.setRole(UserRole.ADMIN);
        user.setUserNumber("123456");
        user.setOrganization(org);
        ReflectionTestUtils.setField(user, "id", 1L);

        principal = new UserPrincipal(user);
    }

    @Test
    void generateToken_returnsNonBlankToken() {
        String token = jwtService.generateToken(principal);
        assertThat(token).isNotBlank();
    }

    @Test
    void extractUsername_returnsCorrectUsername() {
        String token = jwtService.generateToken(principal);
        assertThat(jwtService.extractUsername(token)).isEqualTo("admin");
    }

    @Test
    void extractRole_returnsCorrectRole() {
        String token = jwtService.generateToken(principal);
        assertThat(jwtService.extractRole(token)).isEqualTo("ROLE_ADMIN");
    }

    @Test
    void parseSignedClaims_throwsOnTamperedToken() {
        String token = jwtService.generateToken(principal);
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertThatThrownBy(() -> jwtService.parseSignedClaims(tampered))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void parseSignedClaims_throwsOnRandomString() {
        assertThatThrownBy(() -> jwtService.parseSignedClaims("not.a.token"))
                .isInstanceOf(JwtException.class);
    }
}