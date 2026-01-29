package com.spts.service;

import com.spts.dto.StudentDTO;
import com.spts.entity.Student;
import com.spts.entity.StudentStatus;
import com.spts.entity.Enrollment;
import com.spts.entity.EnrollmentStatus;
import com.spts.exception.ResourceNotFoundException;
import com.spts.exception.DuplicateResourceException;
import com.spts.repository.StudentRepository;
import com.spts.repository.EnrollmentRepository;
import com.spts.repository.AlertRepository;
import com.spts.repository.UserRepository;
import com.spts.patterns.state.StudentStateManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private static final String DEFAULT_PASSWORD = "123456";

    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final StudentStateManager stateManager;
    private final AuthService authService;

    public StudentService(StudentRepository studentRepository,
                          EnrollmentRepository enrollmentRepository,
                          AlertRepository alertRepository,
                          UserRepository userRepository,
                          StudentStateManager stateManager,
                          AuthService authService) {
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
        this.stateManager = stateManager;
        this.authService = authService;
    }

    // ==================== CRUD Operations ====================

    @Transactional(readOnly = true)
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        return convertToDTO(student);
    }

    @Transactional(readOnly = true)
    public StudentDTO getStudentByStudentId(String studentId) {
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "studentId", studentId));
        return convertToDTO(student);
    }

    @Transactional
    public StudentDTO createStudent(StudentDTO dto) {
        // Check for duplicates
        if (studentRepository.existsByStudentId(dto.getStudentId())) {
            throw new DuplicateResourceException("Student", "studentId", dto.getStudentId());
        }
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Student", "email", dto.getEmail());
        }

        Student student = convertToEntity(dto);
        student.setStatus(StudentStatus.NORMAL);
        student.setGpa(null); // New student has no GPA yet
        student.setTotalCredits(0);

        Student savedStudent = studentRepository.save(student);

        // Create Firebase user account with default password
        try {
            String displayName = savedStudent.getFirstName() + " " + savedStudent.getLastName();
            authService.createStudentAccount(
                savedStudent.getEmail(),
                displayName,
                savedStudent,
                DEFAULT_PASSWORD
            );
        } catch (Exception e) {
            // Log error but don't fail student creation
            System.err.println("Warning: Failed to create Firebase account for student " + 
                savedStudent.getEmail() + ": " + e.getMessage());
        }

        return convertToDTO(savedStudent);
    }

    @Transactional
    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        // Update fields
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setEmail(dto.getEmail());
        student.setDateOfBirth(dto.getDateOfBirth());
        // gpa, totalCredits and status are not updated via this CRUD method
        // they are updated via business logic (recalculateGpa, graduate)

        return convertToDTO(studentRepository.save(student));
    }

    @Transactional
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student", "id", id);
        }
        studentRepository.deleteById(id);
    }

    // ==================== Business Logic ====================

    @Transactional(readOnly = true)
    public List<StudentDTO> getStudentsAtRisk() {
        return studentRepository.findByStatusIn(List.of(StudentStatus.AT_RISK, StudentStatus.PROBATION))
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> searchByName(String name) {
        return studentRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(name, name)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> getStudentsWithGpaBelow(Double threshold) {
        return studentRepository.findByGpaLessThan(threshold)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void graduateStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        // Business logic for graduation (e.g., total credits >= 120, gpa >= 2.0)
        if (student.getTotalCredits() != null && student.getTotalCredits() >= 120 && 
            student.getGpa() != null && student.getGpa() >= 2.0) {
            student.setStatus(StudentStatus.GRADUATED);
            studentRepository.save(student);
        } else {
            throw new IllegalStateException("Student does not meet graduation requirements");
        }
    }

    // ==================== GPA Calculation ====================

    /**
     * Calculate cumulative GPA for a student from completed enrollments.
     * Uses weighted average: Sum(gpaValue * credits) / totalCredits
     * 
     * @param studentId Student database ID
     * @return Calculated GPA or null if no completed enrollments
     */
    @Transactional(readOnly = true)
    public Double calculateGpa(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        // Get all enrollments for this student
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        
        // Filter those that have a final score and GPA value
        List<Enrollment> gradedEnrollments = enrollments.stream()
                .filter(e -> e.getFinalScore() != null && e.getGpaValue() != null)
                .collect(Collectors.toList());

        if (gradedEnrollments.isEmpty()) {
            return null;
        }

        double totalWeightedGpa = 0.0;
        int totalCreditsCount = 0;

        for (Enrollment enrollment : gradedEnrollments) {
            if (enrollment.getCredits() != null) {
                totalWeightedGpa += enrollment.getGpaValue() * enrollment.getCredits();
                totalCreditsCount += enrollment.getCredits();
            }
        }

        return totalCreditsCount > 0 ? totalWeightedGpa / totalCreditsCount : null;
    }

    /**
     * Recalculate and persist GPA for a student.
     * Also updates total credits and triggers status update.
     * 
     * @param studentId Student database ID
     */
    public void recalculateAndUpdateGpa(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        Double newGpa = calculateGpa(studentId);
        Integer totalCredits = calculateTotalCredits(studentId);

        // Update student record
        student.setGpa(newGpa);
        student.setTotalCredits(totalCredits);

        // Update status based on new GPA (State Pattern integration)
        if (newGpa != null) {
            updateStudentStatus(student, newGpa);
        }

        studentRepository.save(student);
    }

    /**
     * Calculate total earned credits for a student.
     * Only counts completed enrollments with passing grade (GPA >= 1.0)
     * 
     * @param studentId Student database ID
     * @return Total credits earned
     */
    @Transactional(readOnly = true)
    public Integer calculateTotalCredits(Long studentId) {
        // Find all graded enrollments for this student with a passing grade
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        
        return enrollments.stream()
                .filter(e -> e.getFinalScore() != null && e.getGpaValue() != null && e.getGpaValue() >= 1.0)
                .mapToInt(e -> e.getCredits() != null ? e.getCredits() : 0)
                .sum();
    }

    // ==================== Helpers ====================

    /**
     * Update student status using the State Design Pattern logic.
     * Delegates decision to the StudentStateManager.
     */
    private void updateStudentStatus(Student student, Double currentGpa) {
        StudentStatus newStatus = stateManager.handleStateTransition(student, currentGpa);
        student.setStatus(newStatus);
    }

    /**
     * Convert StudentDTO to Student entity
     */
    private Student convertToEntity(StudentDTO dto) {
        Student student = new Student();
        student.setStudentId(dto.getStudentId());
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setEmail(dto.getEmail());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setEnrollmentDate(dto.getEnrollmentDate());
        // status, gpa, and credits are handled by services/logic
        return student;
    }

    /**
     * Convert Student entity to StudentDTO
     */
    private StudentDTO convertToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setStudentId(student.getStudentId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setEmail(student.getEmail());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setEnrollmentDate(student.getEnrollmentDate());
        dto.setGpa(student.getGpa());
        dto.setTotalCredits(student.getTotalCredits());
        dto.setStatus(student.getStatus());
        return dto;
    }
}
