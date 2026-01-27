package com.spts.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * Firebase configuration for authentication.
 * Set firebase.service-account-path in application.properties to enable Firebase auth.
 * If not set, the app will start in development mode without Firebase authentication.
 */
@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.service-account-path:}")
    private String serviceAccountPath;

    @Value("${firebase.enabled:true}")
    private boolean firebaseEnabled;

    private boolean initialized = false;

    @PostConstruct
    public void initialize() {
        // Skip initialization if Firebase is disabled
        if (!firebaseEnabled) {
            logger.warn("Firebase authentication is DISABLED. Set firebase.enabled=true to enable.");
            return;
        }

        // Skip if no service account path is provided
        if (serviceAccountPath == null || serviceAccountPath.trim().isEmpty()) {
            logger.warn("Firebase service account path not configured. Firebase authentication is DISABLED.");
            logger.warn("To enable Firebase auth, set 'firebase.service-account-path' in application.properties");
            logger.warn("Download service account JSON from: Firebase Console > Project Settings > Service Accounts");
            return;
        }

        try {
            if (FirebaseApp.getApps().isEmpty()) {
                FileInputStream serviceAccount = new FileInputStream(serviceAccountPath);
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                initialized = true;
                logger.info("Firebase initialized successfully with service account file");
            } else {
                initialized = true;
                logger.info("Firebase was already initialized");
            }
        } catch (IOException e) {
            logger.error("Failed to initialize Firebase: {}. App will continue without Firebase auth.", e.getMessage());
            logger.error("Make sure the service account file exists at: {}", serviceAccountPath);
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        if (initialized && !FirebaseApp.getApps().isEmpty()) {
            return FirebaseAuth.getInstance();
        }
        // Return null if Firebase is not initialized - components should handle this gracefully
        logger.warn("FirebaseAuth bean is null - Firebase authentication is not available");
        return null;
    }

    /**
     * Check if Firebase is properly initialized and available
     */
    public boolean isInitialized() {
        return initialized;
    }
}
