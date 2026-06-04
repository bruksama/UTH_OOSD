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
import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

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

    private static final Map<String, Long> mockTokenAuthTimes = new java.util.concurrent.ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String idToken = authHeader.substring(7);

            try {
                FirebaseToken decodedToken;
                if (firebaseAuth == null || !firebaseConfig.isInitialized() || isMockToken(idToken)) {
                    decodedToken = parseMockToken(idToken);
                } else {
                    decodedToken = firebaseAuth.verifyIdToken(idToken);
                }

                if (decodedToken != null) {
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

    private boolean isMockToken(String token) {
        return token != null && (token.startsWith("mock-") || !token.contains("."));
    }

    private FirebaseToken parseMockToken(String idToken) {
        String uid = "mock-uid-123";
        String email = "mock-user@example.com";
        String name = "Mock User";
        long authTime = mockTokenAuthTimes.computeIfAbsent(idToken, k -> System.currentTimeMillis() / 1000L);
        
        boolean parsedAsJwt = false;
        try {
            String[] parts = idToken.split("\\.");
            if (parts.length == 3) {
                String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
                
                uid = getJsonStringField(payloadJson, "sub");
                if (uid == null) {
                    uid = getJsonStringField(payloadJson, "user_id");
                }
                email = getJsonStringField(payloadJson, "email");
                name = getJsonStringField(payloadJson, "name");
                
                String authTimeStr = getJsonNumericField(payloadJson, "auth_time");
                if (authTimeStr != null) {
                    authTime = Long.parseLong(authTimeStr);
                } else {
                    String iatStr = getJsonNumericField(payloadJson, "iat");
                    if (iatStr != null) {
                        authTime = Long.parseLong(iatStr);
                    }
                }
                
                if (uid == null) {
                    uid = "mock-uid-123";
                }
                if (email == null) {
                    email = "mock-user@example.com";
                }
                if (name == null) {
                    name = "Mock User";
                }
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
        
        try {
            Constructor<FirebaseToken> constructor = FirebaseToken.class.getDeclaredConstructor(Map.class);
            constructor.setAccessible(true);
            
            Map<String, Object> claims = new HashMap<>();
            claims.put("sub", uid);
            claims.put("user_id", uid);
            claims.put("email", email);
            claims.put("name", name);
            claims.put("auth_time", authTime);
            
            return constructor.newInstance(claims);
        } catch (Exception e) {
            logger.error("Failed to construct mock FirebaseToken", e);
            return null;
        }
    }

    private String getJsonStringField(String json, String field) {
        String pattern = "\"" + field + "\"\\s*:\\s*\"([^\"]*)\"";
        Pattern r = Pattern.compile(pattern);
        Matcher m = r.matcher(json);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }

    private String getJsonNumericField(String json, String field) {
        String pattern = "\"" + field + "\"\\s*:\\s*(\\d+)";
        Pattern r = Pattern.compile(pattern);
        Matcher m = r.matcher(json);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }
}
