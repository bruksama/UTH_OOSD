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
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.util.Collections;
import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

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

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.security.allow-mock-token:false}")
    private boolean allowMockToken;

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

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String idToken = authHeader.substring(7);

            try {
                Object decodedToken = null;
                if (allowMockToken) {
                    // Dev/Test: luôn dùng parseMockToken khi flag bật
                    // → Token thật hết hạn, token rỗng, token mock đều OK
                    decodedToken = parseMockToken(idToken);
                } else if (firebaseAuth != null && firebaseConfig.isInitialized()) {
                    // Prod: xác thực bằng Firebase thật
                    decodedToken = firebaseAuth.verifyIdToken(idToken);
                } else {
                    logger.error("Firebase is not initialized and mock tokens are disabled.");
                }

                if (decodedToken != null) {
                    String uid;
                    String email;
                    FirebaseTokenInfo tokenInfo = null;
                    
                    if (decodedToken instanceof FirebaseTokenInfo mockInfo) {
                        uid = mockInfo.getUid();
                        email = mockInfo.getEmail();
                        tokenInfo = mockInfo;
                        // Load user from database
                        org.springframework.security.core.userdetails.UserDetails userDetails = customUserDetailsService.loadUserByFirebaseToken(mockInfo);
                        logger.debug("Mock Firebase token verified for uid: {}, email: {}", uid, email);
                        logger.debug("User loaded with authorities: {}", userDetails.getAuthorities());
                        
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails.getUsername(), null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    } else if (decodedToken instanceof FirebaseToken realToken) {
                        uid = realToken.getUid();
                        email = realToken.getEmail();
                        // CustomUserDetailsService still needs FirebaseToken method for real tokens,
                        // but since we updated it to take FirebaseTokenInfo, we need to adapt here:
                        Object authTimeObj = realToken.getClaims().get("auth_time");
                        long authTime = (authTimeObj instanceof Number number) ? number.longValue() : 0L;
                        FirebaseTokenInfo infoAdapter = new FirebaseTokenInfo(
                            uid, email, realToken.getName(),
                            authTime
                        );
                        tokenInfo = infoAdapter;
                        org.springframework.security.core.userdetails.UserDetails userDetails = customUserDetailsService.loadUserByFirebaseToken(infoAdapter);
                        logger.debug("Real Firebase token verified for uid: {}, email: {}", uid, email);
                        logger.debug("User loaded with authorities: {}", userDetails.getAuthorities());
                        
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails.getUsername(), null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    } else {
                        uid = null;
                        email = null;
                    }

                    if (uid != null && tokenInfo != null) {
                        // Store email in request for later use
                        request.setAttribute("firebaseEmail", email);
                        request.setAttribute("firebaseUid", uid);
                        request.setAttribute("firebaseToken", tokenInfo);
                    }
                }

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


    private FirebaseTokenInfo parseMockToken(String idToken) {
        String uid = "mock-uid-123";
        String email = "mock-user@example.com";
        String name = "Mock User";
        long authTime = System.currentTimeMillis() / 1000L;
        
        boolean parsedAsJwt = false;
        try {
            String[] parts = idToken.split("\\.");
            if (parts.length == 3) {
                String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
                JsonNode payloadNode = objectMapper.readTree(payloadJson);
                
                uid = getJsonField(payloadNode, "sub");
                if (uid == null) uid = getJsonField(payloadNode, "user_id");
                
                email = getJsonField(payloadNode, "email");
                name = getJsonField(payloadNode, "name");
                
                String authTimeStr = getJsonField(payloadNode, "auth_time");
                if (authTimeStr != null) {
                    try {
                        authTime = Long.parseLong(authTimeStr);
                    } catch (NumberFormatException e) {
                        logger.warn("Failed to parse auth_time '{}', using current time", authTimeStr);
                    }
                } else {
                    String iatStr = getJsonField(payloadNode, "iat");
                    if (iatStr != null) {
                        try {
                            authTime = Long.parseLong(iatStr);
                        } catch (NumberFormatException e) {
                            logger.warn("Failed to parse iat '{}', using current time", iatStr);
                        }
                    }
                }
                
                if (uid == null) uid = "mock-uid-123";
                if (email == null) email = "mock-user@example.com";
                if (name == null) name = "Mock User";
                
                parsedAsJwt = true;
            }
        } catch (Exception e) {
            logger.warn("Failed to parse mock JWT token (falling back to simple string parsing): {}", e.getMessage());
        }
        
        if (!parsedAsJwt) {
            if (idToken.contains("@")) {
                email = idToken;
                uid = "uid-" + Math.abs(idToken.hashCode());
                name = idToken.split("@")[0];
            }
        }
        
        return new FirebaseTokenInfo(uid, email, name, authTime);
    }

    private String getJsonField(JsonNode node, String field) {
        if (node == null) return null;
        JsonNode fieldNode = node.get(field);
        return fieldNode != null && !fieldNode.isNull() ? fieldNode.asText() : null;
    }
}
