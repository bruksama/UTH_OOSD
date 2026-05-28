package com.spts.service;

import com.google.firebase.auth.FirebaseToken;
import com.spts.dto.AuthUserDTO;
import com.spts.entity.Student;
import com.spts.entity.User;
import com.spts.entity.UserRole;
import com.spts.repository.StudentRepository;
import com.spts.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for authentication operations.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public AuthService(UserRepository userRepository, StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Get or create user from Firebase token.
     * Auto-links to student record if email matches.
     */
    @Transactional
    public AuthUserDTO getOrCreateUser(FirebaseToken firebaseToken) {
        String uid = firebaseToken.getUid();
        String email = firebaseToken.getEmail();
        String displayName = firebaseToken.getName();

        // Find existing user or create new one
        User user = userRepository.findByFirebaseUid(uid)
                .orElseGet(() -> createUser(uid, email, displayName));

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Build response
        Long studentId = null;
        if (user.getStudent() != null) {
            studentId = user.getStudent().getId();
        }

        return new AuthUserDTO(
                user.getFirebaseUid(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name().toLowerCase(),
                studentId
        );
    }

    /**
     * Create new user and auto-link to student if email matches.
     */
    private User createUser(String firebaseUid, String email, String displayName) {
        User user = new User();
        user.setFirebaseUid(firebaseUid);
        user.setEmail(email);
        user.setDisplayName(displayName);

        // Check if email matches an existing student
        Optional<Student> studentOpt = studentRepository.findByEmail(email);
        if (studentOpt.isPresent()) {
            user.setStudent(studentOpt.get());
            user.setRole(UserRole.STUDENT);
        } else {
            // Default to student role for new users
            user.setRole(UserRole.STUDENT);
        }

        return userRepository.save(user);
    }

    /**
     * Get user by Firebase UID.
     */
    public Optional<User> getUserByFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid);
    }

    /**
     * Update user role (admin only).
     */
    @Transactional
    public User updateUserRole(String firebaseUid, UserRole role) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return userRepository.save(user);
    }

    /**
     * Link user to student record.
     */
    @Transactional
    public User linkUserToStudent(String firebaseUid, Long studentId) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        user.setStudent(student);
        return userRepository.save(user);
    }

    /**
     * Create Firebase user account with default password.
     * Also creates User record in database and links to student.
     * 
     * @param email User email
     * @param displayName Display name
     * @param student Student entity to link
     * @param defaultPassword Default password for the account
     * @return Created User entity
     */
    @Transactional
    public User createStudentAccount(String email, String displayName, Student student, String defaultPassword) {
        try {
            // Try to create Firebase user
            com.google.firebase.auth.FirebaseAuth firebaseAuth = com.google.firebase.auth.FirebaseAuth.getInstance();
            
            com.google.firebase.auth.UserRecord.CreateRequest request = new com.google.firebase.auth.UserRecord.CreateRequest()
                    .setEmail(email)
                    .setPassword(defaultPassword)
                    .setDisplayName(displayName)
                    .setEmailVerified(false);
            
            com.google.firebase.auth.UserRecord userRecord = firebaseAuth.createUser(request);
            
            // Create User in database
            User user = new User();
            user.setFirebaseUid(userRecord.getUid());
            user.setEmail(email);
            user.setDisplayName(displayName);
            user.setRole(UserRole.STUDENT);
            user.setStudent(student);
            
            return userRepository.save(user);
        } catch (com.google.firebase.auth.FirebaseAuthException e) {
            throw new RuntimeException("Failed to create Firebase user: " + e.getMessage(), e);
        }
    }

    /**
     * Create Firebase user account (overload without student link).
     */
    @Transactional
    public User createStudentAccount(String email, String displayName, String defaultPassword) {
        return createStudentAccount(email, displayName, null, defaultPassword);
    }
}
