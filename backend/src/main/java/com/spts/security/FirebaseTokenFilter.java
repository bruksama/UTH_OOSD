package com.spts.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.spts.config.FirebaseConfig;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filter to validate Firebase ID tokens from Authorization header.
 * Gracefully handles cases where Firebase is not configured.
 */
@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseTokenFilter.class);

    private final FirebaseAuth firebaseAuth;
    private final FirebaseConfig firebaseConfig;
    private final CustomUserDetailsService customUserDetailsService;

    @Autowired
    public FirebaseTokenFilter(
            @Autowired(required = false) FirebaseAuth firebaseAuth,
            FirebaseConfig firebaseConfig,
            CustomUserDetailsService customUserDetailsService) {
        this.firebaseAuth = firebaseAuth;
        this.firebaseConfig = firebaseConfig;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip token validation if Firebase is not initialized
        if (firebaseAuth == null || !firebaseConfig.isInitialized()) {
            // In dev mode without Firebase, allow all requests through
            // The security config will handle which endpoints are public
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String idToken = authHeader.substring(7);

            try {
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
                String uid = decodedToken.getUid();
                String email = decodedToken.getEmail();

                logger.debug("Firebase token verified for uid: {}, email: {}", uid, email);

                // Load user from database with actual role
                org.springframework.security.core.userdetails.UserDetails userDetails = customUserDetailsService.loadUserByFirebaseToken(decodedToken);

                logger.debug("User loaded with authorities: {}", userDetails.getAuthorities());

                // Create authentication token with Firebase UID as principal
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails.getUsername(),
                        null,
                        userDetails.getAuthorities()
                );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Store email in request for later use
                request.setAttribute("firebaseEmail", email);
                request.setAttribute("firebaseUid", uid);
                request.setAttribute("firebaseToken", decodedToken);

            } catch (FirebaseAuthException e) {
                logger.warn("Invalid Firebase token: {}", e.getMessage());
                // Don't set authentication - request will be rejected by security config
            } catch (Exception e) {
                logger.error("Error loading user from database: {}", e.getMessage(), e);
                // Don't set authentication - request will be rejected by security config
            }
        }

        filterChain.doFilter(request, response);
    }
}
