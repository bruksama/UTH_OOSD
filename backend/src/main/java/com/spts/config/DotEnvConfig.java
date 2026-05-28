package com.spts.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Environment post-processor to load .env file before Spring Boot reads application.properties.
 * 
 * This allows Spring Boot to read values from .env file located in project root.
 * The .env file is gitignored for security.
 * 
 * @author SPTS Team
 */
public class DotEnvConfig implements EnvironmentPostProcessor {

    private static final Logger logger = LoggerFactory.getLogger(DotEnvConfig.class);

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        try {
            // Load .env file from project root
            // Try multiple locations: current dir, parent dir (for IDE), or project root
            Dotenv dotenv = null;
            
            // Try parent directory first (when running from backend/ folder in IDE)
            try {
                dotenv = Dotenv.configure()
                        .directory("../")
                        .ignoreIfMissing()
                        .load();
                if (dotenv.get("POSTGRES_DB") != null) {
                    logger.debug("Found .env file in parent directory");
                } else {
                    dotenv = null; // Try next location
                }
            } catch (Exception e) {
                // Try next location
            }
            
            // Try current directory (when running from project root or JAR)
            if (dotenv == null) {
                dotenv = Dotenv.configure()
                        .directory(".")
                        .ignoreIfMissing()
                        .load();
                if (dotenv.get("POSTGRES_DB") != null) {
                    logger.debug("Found .env file in current directory");
                }
            }
            
            if (dotenv == null || dotenv.get("POSTGRES_DB") == null) {
                logger.warn(".env file not found. Make sure .env exists in project root.");
                return;
            }

            Map<String, Object> envMap = new HashMap<>();
            
            // Add all .env values to Spring environment
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                
                // Only add if not already set (don't override existing env vars)
                if (environment.getProperty(key) == null) {
                    envMap.put(key, value);
                    logger.debug("Loaded from .env: {} = {}", key, maskPassword(key, value));
                } else {
                    logger.debug("Skipping .env value for {} (already set)", key);
                }
            });

            if (!envMap.isEmpty()) {
                environment.getPropertySources().addFirst(
                    new MapPropertySource("dotenv", envMap)
                );
                logger.info("Successfully loaded {} properties from .env file", envMap.size());
            }
        } catch (Exception e) {
            logger.warn("Failed to load .env file: {}. Using default values or environment variables.", e.getMessage());
        }
    }

    /**
     * Mask password values in logs for security
     */
    private String maskPassword(String key, String value) {
        if (key.toLowerCase().contains("password") || key.toLowerCase().contains("secret")) {
            return "***";
        }
        return value;
    }
}
