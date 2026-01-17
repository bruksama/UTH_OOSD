package com.spts.service;

import com.spts.dto.AlertDTO;
import com.spts.dto.EnrollmentDTO;
import com.spts.dto.StudentDTO;
import com.spts.entity.*;
import com.spts.exception.ResourceNotFoundException;
import com.spts.exception.DuplicateResourceException;
import com.spts.patterns.state.*;
import com.spts.repository.AlertRepository;
import com.spts.repository.EnrollmentRepository;
import com.spts.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for Student entity.
 * Provides CRUD operations, GPA calculation, and state management.
 * 
 * Integrates with:
 * - State Pattern: For student status transitions based on GPA
 * - Observer Pattern: Hooks for GPA change notifications (via Member 3)
 * 
 * @author SPTS Team
 */
@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AlertRepository alertRepository;

    public StudentService(StudentRepository studentRepository,
                          EnrollmentRepository enrollmentRepository,
                          AlertRepository alertRepository) {
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.alertRepository = alertRepository;
    }

    // ==================== CRUD Operations ====================

    /**
     * Get all students
     * 
     * @return List of all students as DTOs
     */
    @Transactional(readOnly = true)
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get student by ID
     * 
     * @param id Student database ID
     * @return StudentDTO
     * @throws ResourceNotFoundException if student not found
     */
    @Transactional(readOnly = true)
    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        return convertToDTO(student);
    }

    /**
     * Get student by student ID (business key)
     * 
     * @param studentId Student ID (e.g., "STU001")
     * @return StudentDTO
     * @throws ResourceNotFoundException if student not found
     */
    @Transactional(readOnly = true)
    public StudentDTO getStudentByStudentId(String studentId) {
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "studentId", studentId));
        return convertToDTO(student);
    }

    /**
     * Create a new student
     * 
     * @param dto StudentDTO with student data
     * @return Created StudentDTO with generated ID
     * @throws DuplicateResourceException if student ID or email already exists
     */
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
        return convertToDTO(savedStudent);
    }

    /**
     * Update an existing student
     * 
     * @param id  Student database ID
     * @param dto StudentDTO with updated data
     * @return Updated StudentDTO
     * @throws ResourceNotFoundException if student not found
     */
    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        // Check for duplicate email (if changed)
        if (!student.getEmail().equals(dto.getEmail()) 
                && studentRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Student", "email", dto.getEmail());
        }

        // Check for duplicate student ID (if changed)
        if (!student.getStudentId().equals(dto.getStudentId()) 
                && studentRepository.existsByStudentId(dto.getStudentId())) {
            throw new DuplicateResourceException("Student", "studentId", dto.getStudentId());
        }

        // Update fields
        student.setStudentId(dto.getStudentId());
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setEmail(dto.getEmail());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setEnrollmentDate(dto.getEnrollmentDate());

        // Note: GPA and status are managed by the system, not directly updated
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }

    /**
     * Delete a student
     * 
     * @param id Student database ID
     * @throws ResourceNotFoundException if student not found
     */
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student", "id", id);
        }
        studentRepository.deleteById(id);
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

        List<Enrollment> completedEnrollments = enrollmentRepository
                .findByStudentIdAndStatus(studentId, EnrollmentStatus.COMPLETED);

        if (completedEnrollments.isEmpty()) {
            return null;
        }

        double totalWeightedGpa = 0.0;
        int totalCredits = 0;

        for (Enrollment enrollment : completedEnrollments) {
            if (enrollment.getGpaValue() != null && enrollment.getCredits() != null) {
                totalWeightedGpa += enrollment.getGpaValue() * enrollment.getCredits();
                totalCredits += enrollment.getCredits();
            }
        }

        return totalCredits > 0 ? totalWeightedGpa / totalCredits : null;
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
        Integer credits = enrollmentRepository.countCompletedCredits(studentId);
        return credits != null ? credits : 0;
    }

    // ==================== State Pattern Integration ====================

    /**
     * Update student status based on GPA using State Pattern.
     * 
     * Status thresholds:
     * - NORMAL: GPA >= 2.0
     * - AT_RISK: 1.5 <= GPA < 2.0
     * - PROBATION: GPA < 1.5
     * - GRADUATED: Manually set when requirements completed
     * 
     * @param student Student entity to update
     * @param newGpa  New GPA value
     */
    private void updateStudentStatus(Student student, double newGpa) {
        // Skip if already graduated
        if (student.getStatus() == StudentStatus.GRADUATED) {
            return;
        }

        StudentState currentState = getStateForStatus(student.getStatus());
        StudentState newState = currentState.handleGpaChange(student, newGpa);

        // Update status based on new state
        StudentStatus newStatus = getStatusForState(newState);
        student.setStatus(newStatus);
    }

    /**
     * Get StudentState object for a given StudentStatus enum
     * 
     * @param status StudentStatus enum value
     * @return Corresponding StudentState implementation
     */
    public StudentState getStateForStatus(StudentStatus status) {
        return switch (status) {
            case NORMAL -> new NormalState();
            case AT_RISK -> new AtRiskState();
            case PROBATION -> new ProbationState();
            case GRADUATED -> new GraduatedState();
        };
    }

    /**
     * Get StudentStatus enum for a given StudentState
     * 
     * @param state StudentState implementation
     * @return Corresponding StudentStatus enum value
     */
    private StudentStatus getStatusForState(StudentState state) {
        if (state instanceof NormalState) return StudentStatus.NORMAL;
        if (state instanceof AtRiskState) return StudentStatus.AT_RISK;
        if (state instanceof ProbationState) return StudentStatus.PROBATION;
        if (state instanceof GraduatedState) return StudentStatus.GRADUATED;
        return StudentStatus.NORMAL;
    }

    /**
     * Manually mark a student as graduated.
     * 
     * @param studentId Student database ID
     * @throws RuntimeException if student not found or does not meet requirements
     */
    public void graduateStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        // Check graduation requirements (example: minimum credits and GPA)
        if (student.getTotalCredits() == null || student.getTotalCredits() < 120) {
            throw new IllegalStateException("Student does not meet minimum credit requirement (120 credits)");
        }
        if (student.getGpa() == null || student.getGpa() < 2.0) {
            throw new IllegalStateException("Student does not meet minimum GPA requirement (2.0)");
        }

        student.setStatus(StudentStatus.GRADUATED);
        studentRepository.save(student);
    }

    // ==================== Related Data Queries ====================

    /**
     * Get all enrollments for a student
     * 
     * @param studentId Student database ID
     * @return List of EnrollmentDTOs
     */
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getStudentEnrollments(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }

        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(this::convertEnrollmentToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all alerts for a student
     * 
     * @param studentId Student database ID
     * @return List of AlertDTOs
     */
    @Transactional(readOnly = true)
    public List<AlertDTO> getStudentAlerts(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }

        return alertRepository.findByStudentId(studentId).stream()
                .map(this::convertAlertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get students at risk (AT_RISK or PROBATION status)
     * 
     * @return List of at-risk StudentDTOs
     */
    @Transactional(readOnly = true)
    public List<StudentDTO> getStudentsAtRisk() {
        List<Student> atRisk = studentRepository.findByStatus(StudentStatus.AT_RISK);
        List<Student> probation = studentRepository.findByStatus(StudentStatus.PROBATION);

        atRisk.addAll(probation);

        return atRisk.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search students by name (first or last name)
     * 
     * @param name Name to search for
     * @return List of matching StudentDTOs
     */
    @Transactional(readOnly = true)
    public List<StudentDTO> searchByName(String name) {
        return studentRepository.searchByName(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get students with GPA below a threshold
     * 
     * @param threshold GPA threshold
     * @return List of StudentDTOs
     */
    @Transactional(readOnly = true)
    public List<StudentDTO> getStudentsWithGpaBelow(Double threshold) {
        return studentRepository.findStudentsWithGpaBelow(threshold).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ==================== DTO Conversion Helpers ====================

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
        return student;
    }

    /**
     * Convert Enrollment entity to EnrollmentDTO
     */
    private EnrollmentDTO convertEnrollmentToDTO(Enrollment enrollment) {
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setId(enrollment.getId());
        dto.setStudentId(enrollment.getStudent().getId());
        dto.setStudentName(enrollment.getStudent().getFullName());
        dto.setStudentCode(enrollment.getStudent().getStudentId());
        dto.setCourseOfferingId(enrollment.getCourseOffering().getId());
        dto.setCourseCode(enrollment.getCourseOffering().getCourse().getCourseCode());
        dto.setCourseName(enrollment.getCourseOffering().getCourse().getCourseName());
        dto.setCredits(enrollment.getCourseOffering().getCourse().getCredits());
        dto.setSemester(enrollment.getCourseOffering().getSemester().getDisplayName());
        dto.setAcademicYear(enrollment.getCourseOffering().getAcademicYear());
        dto.setFinalScore(enrollment.getFinalScore());
        dto.setLetterGrade(enrollment.getLetterGrade());
        dto.setGpaValue(enrollment.getGpaValue());
        dto.setStatus(enrollment.getStatus());
        dto.setEnrolledAt(enrollment.getEnrolledAt());
        dto.setCompletedAt(enrollment.getCompletedAt());
        return dto;
    }

    /**
     * Convert Alert entity to AlertDTO
     */
    private AlertDTO convertAlertToDTO(Alert alert) {
        AlertDTO dto = new AlertDTO();
        dto.setId(alert.getId());
        dto.setStudentId(alert.getStudent().getId());
        dto.setStudentName(alert.getStudent().getFullName());
        dto.setLevel(alert.getLevel());
        dto.setType(alert.getType());
        dto.setMessage(alert.getMessage());
        dto.setCreatedDate(alert.getCreatedAt() != null ? alert.getCreatedAt().toLocalDate() : null);
        dto.setCreatedAt(alert.getCreatedAt());
        dto.setIsRead(alert.getIsRead());
        dto.setReadAt(alert.getReadAt());
        dto.setIsResolved(alert.getIsResolved());
        dto.setResolvedAt(alert.getResolvedAt());
        dto.setResolvedBy(alert.getResolvedBy());
        return dto;
    }
}
