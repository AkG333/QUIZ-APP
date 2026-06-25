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

                // Disable CSRF because we are using JWT
                .csrf(csrf -> csrf.disable())

                // Stateless Session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Authorization Rules
                .authorizeHttpRequests(auth -> auth

                        // Public Endpoints
                        .requestMatchers("/auth/**")
                        .permitAll()

                        // ===============================
                        // ADMIN APIs
                        // ===============================

                        .requestMatchers(HttpMethod.POST, "/quiz/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/quiz/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/quiz/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/question/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/question/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/question/**")
                        .hasRole("ADMIN")

                        // ===============================
                        // USER APIs
                        // ===============================

                        .requestMatchers("/quiz/join/**")
                        .hasAnyRole("USER", "ADMIN")

                        .requestMatchers("/attempt/**")
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
}