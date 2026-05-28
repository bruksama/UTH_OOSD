package com.spts.config;

import com.spts.patterns.observer.GpaRecalculatorObserver;
import com.spts.patterns.observer.GradeSubject;
import com.spts.patterns.observer.RiskDetectorObserver;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Observer Pattern.
 * 
 * Responsibility: Register observers with GradeSubject at application startup.
 * This follows Single Responsibility Principle - GradeSubject only manages
 * the observer list, while this config handles the registration logic.
 * 
 * @author SPTS Team - Member 3 (Behavioral Engineer)
 */
@Configuration
public class ObserverConfig {

    private static final Logger logger = LoggerFactory.getLogger(ObserverConfig.class);
    
    private final GradeSubject gradeSubject;
    private final GpaRecalculatorObserver gpaRecalculatorObserver;
    private final RiskDetectorObserver riskDetectorObserver;
    
    public ObserverConfig(GradeSubject gradeSubject, 
                          GpaRecalculatorObserver gpaRecalculatorObserver,
                          RiskDetectorObserver riskDetectorObserver) {
        this.gradeSubject = gradeSubject;
        this.gpaRecalculatorObserver = gpaRecalculatorObserver;
        this.riskDetectorObserver = riskDetectorObserver;
    }
    
    /**
     * Register all observers at application startup.
     * Observers are registered in priority order.
     */
    @PostConstruct
    public void registerObservers() {
        // Register GPA Recalculator (priority 0 - runs first)
        gradeSubject.attach(gpaRecalculatorObserver);
        
        // Register Risk Detector (priority 10 - runs after GPA update)
        gradeSubject.attach(riskDetectorObserver);
        
        logger.info("Registered {} observers with GradeSubject", gradeSubject.getObserverCount());
    }
}
