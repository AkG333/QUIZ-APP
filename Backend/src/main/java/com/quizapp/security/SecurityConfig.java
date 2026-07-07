package com.quizapp.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // Enable CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Disable CSRF because we are using JWT
                .csrf(csrf -> csrf.disable())

                // Stateless Session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Authorization Rules
                .authorizeHttpRequests(auth -> auth

                        // Public Endpoints
                        .requestMatchers("/api/auth/**")
                        .permitAll()

                        // ===============================
                        // ADMIN APIs
                        // ===============================

                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/quizzes/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/quizzes/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/quizzes/**")
                        .hasRole("ADMIN")

                        // ===============================
                        // USER & ADMIN APIs (Authenticated)
                        // ===============================

                        .requestMatchers(HttpMethod.GET, "/api/quizzes/**")
                        .hasAnyRole("USER", "ADMIN")

                        .requestMatchers("/api/attempts/**")
                        .hasAnyRole("USER", "ADMIN")

                        .requestMatchers("/api/leaderboard/**")
                        .hasAnyRole("USER", "ADMIN")

                        // ===============================
                        // Everything Else
                        // ===============================

                        .anyRequest()
                        .authenticated()
                )

                // JWT Filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}