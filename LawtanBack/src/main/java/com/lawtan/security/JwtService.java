package com.lawtan.security;

import com.lawtan.entity.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey signingKey;
    private final long expirationMillis;

    // CORRECTIF : les clés lues ici (lawtan.jwt.*) sont celles définies dans application.properties.
    // Avant, le service lisait security.jwt.* qui n'existait pas -> échec au démarrage.
    public JwtService(
        @Value("${lawtan.jwt.secret}") String base64Secret,
        @Value("${lawtan.jwt.expiration:86400000}") long expirationMillis
    ) {
        byte[] keyBytes = Decoders.BASE64.decode(base64Secret);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("LAWTAN_JWT_SECRET doit décoder (Base64) vers au moins 32 octets.");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMillis = expirationMillis;
    }

    public String generateToken(AppUser user) {
        Date now = new Date();
        return Jwts.builder()
            .subject(user.getEmail())
            .claim("role", user.getRole())
            .claim("uid", user.getId())
            .issuedAt(now)
            .expiration(new Date(now.getTime() + expirationMillis))
            .signWith(signingKey)
            .compact();
    }

    public Claims parseClaims(String token) throws JwtException {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    }

    public long getExpirationSeconds() {
        return expirationMillis / 1000;
    }
}