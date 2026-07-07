package com.quizapp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey =
            Keys.hmacShaKeyFor(
                    "mysecretkeymysecretkeymysecretkey123456".getBytes());

    public String generateToken(String email, String username, String role) {

        return Jwts.builder()
                .subject(email)
                .claim("username", username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()
                        + 1000 * 60 * 60 * 24))
                .signWith(secretKey)
                .compact();
    }

    public String extractEmail(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String token, String email) {

        return extractEmail(token).equals(email);
    }
}