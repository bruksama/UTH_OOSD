package com.spts.dto;

/**
 * DTO for authenticated user information.
 */
public class AuthUserDTO {

    private String uid;
    private String email;
    private String displayName;
    private String role;
    private Long studentId;

    public AuthUserDTO() {}

    public AuthUserDTO(String uid, String email, String displayName, String role, Long studentId) {
        this.uid = uid;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
        this.studentId = studentId;
    }

    // Getters and Setters
    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
}
