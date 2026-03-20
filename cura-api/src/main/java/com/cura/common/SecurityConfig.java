package com.cura.common;

import com.cura.auth.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(withDefaults()) // makes Spring Security apply your CorsConfigurationSource
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                // Allow preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public auth
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                // if you have other public auth endpoints, list them here:
                // .requestMatchers(HttpMethod.POST, "/api/v1/auth/refresh").permitAll()

                .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/v1/users/**").hasRole("ADMIN")



                // ADMIN-only: Facilities mutations
                .requestMatchers(HttpMethod.POST, "/api/v1/facilities/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/facilities/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/facilities/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/facilities/**").hasRole("ADMIN")

                // ADMIN-only: Units mutations
                .requestMatchers(HttpMethod.POST, "/api/v1/units/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/units/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/units/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/units/**").hasRole("ADMIN")

                // Residents: allow reads for any authenticated user
                .requestMatchers(HttpMethod.GET, "/api/v1/residents/**").authenticated()

// Residents: allow create/update/transfer for any authenticated user (or restrict if you want)
                .requestMatchers(HttpMethod.POST, "/api/v1/residents/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/residents/**").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/v1/residents/**").authenticated()

// Residents delete: admin only (optional)
                .requestMatchers(HttpMethod.DELETE, "/api/v1/residents/**").hasRole("ADMIN")


                // Everyone authenticated can read + manage residents (matches your UI)
                // If you later add resident delete and want ADMIN-only:
                // .requestMatchers(HttpMethod.DELETE, "/api/v1/residents/**").hasRole("ADMIN")

                .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
