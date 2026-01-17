package com.spts.exception;

/**
 * Exception thrown when a business rule is violated.
 * 
 * @author SPTS Team
 */
public class BusinessRuleException extends RuntimeException {
    
    public BusinessRuleException(String message) {
        super(message);
    }
}
