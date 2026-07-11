package com.spts.controller;

import com.spts.security.FirebaseTokenInfo;
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
        FirebaseTokenInfo firebaseToken = (FirebaseTokenInfo) request.getAttribute("firebaseToken");

        if (firebaseToken == null) {
            return ResponseEntity.status(401).build();
        }

        AuthUserDTO user = authService.getOrCreateUser(firebaseToken);
        return ResponseEntity.ok(user);
    }

    /**
     * Logout the current authenticated user by revoking the current token.
     */
    @PostMapping("/logout")
    @Operation(
            summary = "Logout current user",
            description = "Revokes the current token so subsequent requests return 401",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        FirebaseTokenInfo firebaseToken = (FirebaseTokenInfo) request.getAttribute("firebaseToken");

        // If token is present, revoke it
        if (firebaseToken != null) {
            authService.revokeCurrentToken(firebaseToken);
        }
        
        // Return 204 No Content whether token was revoked or not
        return ResponseEntity.noContent().build();
    }

    /**
     * Health check endpoint for auth service.
     */
    @GetMapping("/health")
    @Operation(
            summary = "Auth service health check",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Auth service is running");
    }
}
