package com.spts.config;

import com.spts.security.FirebaseTokenFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Spring Security configuration for Firebase authentication.
 * When firebase.enabled=false (or Firebase not configured), all API requests are permitted
 * to allow local development and testing without Firebase credentials.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final FirebaseTokenFilter firebaseTokenFilter;

    @Value("${firebase.enabled:true}")
    private boolean firebaseEnabled;

    @Value("${firebase.service-account-path:}")
    private String serviceAccountPath;

    public SecurityConfig(FirebaseTokenFilter firebaseTokenFilter) {
        this.firebaseTokenFilter = firebaseTokenFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        boolean firebaseAvailable = firebaseEnabled
                && serviceAccountPath != null
                && !serviceAccountPath.trim().isEmpty()
                && new java.io.File(serviceAccountPath).exists();

        if (firebaseAvailable) {
            // Firebase mode: protect /api/** endpoints with Firebase token
            http.authorizeHttpRequests(auth -> auth
                            .requestMatchers("/api/auth/register").permitAll()
                            .requestMatchers("/api/auth/logout").permitAll()
                            .requestMatchers("/api/auth/health").permitAll()
                            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                            .requestMatchers("/h2-console/**").permitAll()
                            .requestMatchers("/api/**").authenticated()
                            .anyRequest().permitAll()
                    )
                    .exceptionHandling(exc -> exc
                            .authenticationEntryPoint((request, response, authException) ->
                                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                    )
                    .addFilterBefore(firebaseTokenFilter, UsernamePasswordAuthenticationFilter.class);
        } else {
            // Dev mode: permit all requests (Firebase not configured)
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        }

        return http.build();
    }
}
