package com.spts.controller;

import com.google.firebase.auth.FirebaseToken;
import com.spts.dto.AuthUserDTO;
import com.spts.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller for Firebase auth operations.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Firebase authentication endpoints")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Get current authenticated user's profile.
     * Creates user record if first login.
     */
    @GetMapping("/me")
    @Operation(
            summary = "Get current user",
            description = "Returns the authenticated user's profile with role and studentId",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<AuthUserDTO> getCurrentUser(HttpServletRequest request) {
        FirebaseToken firebaseToken = (FirebaseToken) request.getAttribute("firebaseToken");

        if (firebaseToken == null) {
            return ResponseEntity.status(401).build();
        }

        AuthUserDTO user = authService.getOrCreateUser(firebaseToken);
        return ResponseEntity.ok(user);
    }

    /**
     * Health check endpoint for auth service.
     */
    @GetMapping("/health")
    @Operation(summary = "Auth service health check")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Auth service is running");
    }
}
