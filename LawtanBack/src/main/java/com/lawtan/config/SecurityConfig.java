package com.lawtan.config;

import com.lawtan.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed.origins}")
    private String[] allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // API stateless authentifiée par en-tête Bearer (pas de cookie) : CSRF inutile.
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((request, response, ex) ->
                                writeJson(response, HttpServletResponse.SC_UNAUTHORIZED,
                                        "Authentification requise ou session expirée."))
                        .accessDeniedHandler((request, response, ex) ->
                                writeJson(response, HttpServletResponse.SC_FORBIDDEN,
                                        "Accès refusé : votre rôle ne permet pas cette opération.")))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/ping").permitAll()
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Marketplace : catalogue et passage de commande publics (clients sans compte)
                        .requestMatchers(HttpMethod.GET, "/api/marketplace/products", "/api/marketplace/categories").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/marketplace/orders").permitAll()
                        // Marketplace : suivi et traitement des commandes réservés à l'équipe
                        .requestMatchers(HttpMethod.PATCH, "/api/marketplace/orders/*/status").hasAnyRole("MANAGER", "COMMERCIAL")
                        .requestMatchers("/api/marketplace/orders/**").hasAnyRole("MANAGER", "COMMERCIAL", "COMPTA")

                        // Profil personnel : tout utilisateur connecté (doit précéder la règle /api/users/**)
                        .requestMatchers("/api/users/me/**").authenticated()
                        // Gestion des comptes : manager uniquement
                        .requestMatchers("/api/users/**").hasRole("MANAGER")

                        // Données financières (cadrage §4 : confidentialité stricte)
                        .requestMatchers("/api/finance/**", "/api/suppliers/**").hasAnyRole("MANAGER", "COMPTA")

                        // Stocks produits : consultation publique (boutique / catalogue), modifications réservées à l'équipe
                        .requestMatchers(HttpMethod.GET, "/api/stocks", "/api/stocks/**").permitAll()
                        // Ventes : clients, factures, paiements, satisfaction client, mutations stocks
                        .requestMatchers("/api/customers/**", "/api/invoices/**", "/api/payments/**",
                                "/api/commercial/**", "/api/feedback/**", "/api/stocks/**")
                        .hasAnyRole("MANAGER", "COMPTA", "COMMERCIAL", "TECH")

                        // Santé animale (cadrage §4 : confidentialité stricte)
                        .requestMatchers("/api/health/**").hasAnyRole("MANAGER", "VETO", "TECH", "BOUVIER")

                        .anyRequest().authenticated()
                )
                // CORRECTIF : le filtre JWT n'était pas inséré dans la chaîne Spring Security.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** Évite que Spring Boot enregistre aussi le filtre JWT comme filtre servlet (double exécution). */
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(JwtAuthenticationFilter filter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Idempotency-Key"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private static void writeJson(HttpServletResponse response, int status, String message) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"message\":\"" + message.replace("\"", "'") + "\"}");
    }
}