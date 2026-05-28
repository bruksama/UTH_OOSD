package com.spts.security;

import com.google.firebase.auth.FirebaseToken;
import com.spts.entity.Student;
import com.spts.entity.StudentStatus;
import com.spts.entity.User;
import com.spts.entity.UserRole;
import com.spts.repository.StudentRepository;
import com.spts.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Custom service to load user details from database based on Firebase token.
 * Handles JIT provisioning and role synchronization.
 */
@Service
public class CustomUserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public CustomUserDetailsService(UserRepository userRepository, StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public UserDetails loadUserByFirebaseToken(FirebaseToken token) {
        String uid = token.getUid();

        // Find or create user (JIT provisioning)
        User user = userRepository.findByFirebaseUid(uid)
            .orElseGet(() -> createUserFromToken(token));

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        user = userRepository.save(user);

        logger.info("User authenticated: uid={}, email={}, role={}", uid, user.getEmail(), user.getRole());

        // Build Spring Security UserDetails with actual role
        List<GrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        return new org.springframework.security.core.userdetails.User(
            uid,           // username = Firebase UID
            "",            // password (not used for Firebase auth)
            authorities    // actual role from database
        );
    }

    private User createUserFromToken(FirebaseToken token) {
        logger.info("Creating new user for email: {}", token.getEmail());

        // Check if a student already exists with this email
        Student student = studentRepository.findByEmail(token.getEmail())
            .orElse(null);

        // If no student exists, create one
        if (student == null) {
            student = createStudentFromToken(token);
            logger.info("Created and saved new student: id={}, studentId={}",
                student.getId(), student.getStudentId());
        } else {
            logger.info("Found existing student: id={}, studentId={}",
                student.getId(), student.getStudentId());
        }

        // Now create the user and link to the student
        User user = new User();
        user.setFirebaseUid(token.getUid());
        user.setEmail(token.getEmail());
        user.setDisplayName(token.getName());
        user.setCreatedAt(LocalDateTime.now());
        user.setStudent(student);
        user.setRole(UserRole.STUDENT);

        User savedUser = userRepository.save(user);
        logger.info("Created new user: id={}, uid={}, email={}, linkedStudentId={}",
            savedUser.getId(), token.getUid(), token.getEmail(),
            savedUser.getStudent() != null ? savedUser.getStudent().getId() : "NULL");

        return savedUser;
    }

    private Student createStudentFromToken(FirebaseToken token) {
        Student student = new Student();

        // Generate unique student ID
        String studentId = generateStudentId();
        student.setStudentId(studentId);

        // Parse first and last name from display name
        String displayName = token.getName();
        if (displayName != null && !displayName.trim().isEmpty()) {
            String[] nameParts = displayName.trim().split("\\s+", 2);
            student.setFirstName(nameParts[0]);
            student.setLastName(nameParts.length > 1 ? nameParts[1] : nameParts[0]);
        } else {
            // Fallback if no display name
            student.setFirstName("Student");
            student.setLastName(token.getEmail().split("@")[0]);
        }

        student.setEmail(token.getEmail());
        student.setEnrollmentDate(LocalDate.now());
        student.setStatus(StudentStatus.NORMAL);
        student.setGpa(0.0);
        student.setTotalCredits(0);

        logger.info("Created new student: studentId={}, email={}, name={} {}",
            studentId, student.getEmail(), student.getFirstName(), student.getLastName());

        return studentRepository.save(student);
    }

    private String generateStudentId() {
        // Generate student ID using timestamp format: STU-YYYYMMDD-XXXXX
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // Find the highest student ID created today
        String prefix = "STU-" + timestamp + "-";
        List<Student> todayStudents = studentRepository.findAll().stream()
            .filter(s -> s.getStudentId().startsWith(prefix))
            .toList();

        int nextSequence = todayStudents.size() + 1;
        return String.format("%s%05d", prefix, nextSequence);
    }
}
