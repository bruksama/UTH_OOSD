package com.spts;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application entry point for Student Performance Tracking System (SPTS).
 * 
 * This system provides:
 * - GPA calculation and tracking
 * - Learning curve analysis
 * - Early warning alerts for at-risk students
 * 
 * @author SPTS Team
 * @version 1.0.0
 */
@SpringBootApplication
public class SptsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SptsApplication.class, args);
    }

}
