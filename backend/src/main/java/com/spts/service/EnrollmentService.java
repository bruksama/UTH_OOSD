package com.spts.service;

import com.spts.dto.EnrollmentDTO;
import com.spts.dto.GradeEntryDTO;
import com.spts.entity.*;
import com.spts.exception.ResourceNotFoundException;
import com.spts.exception.DuplicateResourceException;
import com.spts.patterns.observer.GradeSubject;
import com.spts.patterns.strategy.GradingStrategyFactory;
import com.spts.patterns.strategy.IGradingStrategy;
import com.spts.repository.CourseOfferingRepository;
import com.spts.repository.EnrollmentRepository;
import com.spts.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for Enrollment entity.
 * Provides CRUD operations, grade submission, and GPA calculation.
 * 
 * Enrollment represents the junction between Student and CourseOffering,
 * storing the final grade and enrollment status.
 * 
 * Integrates with:
 * - StudentService: Triggers GPA recalculation after grade changes
 * - CourseOfferingService: Updates enrollment counts
 * - Observer Pattern: Hook for grade change notifications (Member 3)
 * 
 * @author SPTS Team
 */
@Service
@Transactional
public class EnrollmentService {

    private static final Logger logger = LoggerFactory.getLogger(EnrollmentService.class);

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final StudentService studentService;
    private final GradingStrategyFactory gradingStrategyFactory;
    private final GradeSubject gradeSubject;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                              StudentRepository studentRepository,
                              CourseOfferingRepository courseOfferingRepository,
                              StudentService studentService,
                              GradingStrategyFactory gradingStrategyFactory,
                              GradeSubject gradeSubject) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.courseOfferingRepository = courseOfferingRepository;
        this.studentService = studentService;
        this.gradingStrategyFactory = gradingStrategyFactory;
        this.gradeSubject = gradeSubject;
    }

    // ==================== Observer Pattern Helper ====================

    /**
     * Notify all registered observers about an enrollment completion.
     * This triggers GPA recalculation and risk detection for the student.
     * 
     * @param enrollment The enrollment that was completed
     */
    private void notifyEnrollmentObservers(Enrollment enrollment) {
        if (enrollment == null) {
            return;
        }
        
        Student student = enrollment.getStudent();
        logger.debug("Notifying observers about enrollment completion for student: {}", 
                student.getStudentId());
        
        // Notify with null gradeEntry since this is enrollment-level notification
        gradeSubject.notifyObservers(student, enrollment, null);
    }

    // ==================== CRUD Operations ====================

    /**
     * Get all enrollments
     * 
     * @return List of all enrollments as DTOs
     */
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get enrollment by ID
     * 
     * @param id Enrollment database ID
     * @return EnrollmentDTO
     * @throws RuntimeException if enrollment not found
     */
    @Transactional(readOnly = true)
    public EnrollmentDTO getEnrollmentById(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", id));
        return convertToDTO(enrollment);
    }

    /**
     * Create a new enrollment (enroll student in course offering)
     * 
     * @param dto EnrollmentDTO with student and offering IDs
     * @return Created EnrollmentDTO with generated ID
     * @throws RuntimeException if student/offering not found, already enrolled, or no seats
     */
    public EnrollmentDTO createEnrollment(EnrollmentDTO dto) {
        // Validate student exists
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", dto.getStudentId()));

        // Validate course offering exists
        CourseOffering offering = courseOfferingRepository.findById(dto.getCourseOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("CourseOffering", "id", dto.getCourseOfferingId()));

        // Check if already enrolled
        if (enrollmentRepository.existsByStudentIdAndCourseOfferingId(
                dto.getStudentId(), dto.getCourseOfferingId())) {
            throw new DuplicateResourceException("Enrollment", "student/offering", 
                    dto.getStudentId() + "/" + dto.getCourseOfferingId());
        }

        // Check seat availability
        if (!offering.hasAvailableSeats()) {
            throw new IllegalStateException("No available seats in this course offering");
        }

        // Create enrollment
        Enrollment enrollment = new Enrollment(student, offering);
        enrollment.setStatus(EnrollmentStatus.IN_PROGRESS);
        enrollment.setEnrolledAt(LocalDateTime.now());

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // Update offering enrollment count
        offering.setCurrentEnrollment(offering.getCurrentEnrollment() + 1);
        courseOfferingRepository.save(offering);

        return convertToDTO(savedEnrollment);
    }

    /**
     * Update an existing enrollment
     * Note: Cannot change student or offering after creation
     * 
     * @param id  Enrollment database ID
     * @param dto EnrollmentDTO with updated data
     * @return Updated EnrollmentDTO
     * @throws RuntimeException if enrollment not found
     */
    public EnrollmentDTO updateEnrollment(Long id, EnrollmentDTO dto) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", id));

        // Note: Student and CourseOffering cannot be changed after creation
        // Only status and grades can be updated

        if (dto.getFinalScore() != null) {
            enrollment.setFinalScore(dto.getFinalScore());
            // letterGrade and gpaValue are auto-calculated in setFinalScore
        }

        if (dto.getStatus() != null) {
            enrollment.setStatus(dto.getStatus());
            if (dto.getStatus() == EnrollmentStatus.COMPLETED || 
                dto.getStatus() == EnrollmentStatus.WITHDRAWN) {
                enrollment.setCompletedAt(LocalDateTime.now());
            }
        }

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // Trigger student GPA recalculation if grade changed
        if (dto.getFinalScore() != null && enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            studentService.recalculateAndUpdateGpa(enrollment.getStudent().getId());
        }

        return convertToDTO(savedEnrollment);
    }

    /**
     * Delete an enrollment
     * 
     * @param id Enrollment database ID
     * @throws RuntimeException if enrollment not found
     */
    public void deleteEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", id));

        Long studentId = enrollment.getStudent().getId();
        Long offeringId = enrollment.getCourseOffering().getId();

        enrollmentRepository.deleteById(id);

        // Update offering enrollment count
        CourseOffering offering = courseOfferingRepository.findById(offeringId).orElse(null);
        if (offering != null && offering.getCurrentEnrollment() > 0) {
            offering.setCurrentEnrollment(offering.getCurrentEnrollment() - 1);
            courseOfferingRepository.save(offering);
        }

        // Recalculate student GPA
        studentService.recalculateAndUpdateGpa(studentId);
    }

    // ==================== Grade Submission ====================

    /**
     * Complete enrollment with final grade.
     * Auto-calculates letter grade and GPA value.
     * Triggers student GPA recalculation.
     * 
     * @param enrollmentId Enrollment database ID
     * @param finalScore Final score (0-10 scale)
     * @return Updated EnrollmentDTO
     * @throws RuntimeException if enrollment not found or already completed
     */
    public EnrollmentDTO completeEnrollment(Long enrollmentId, Double finalScore) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));

        if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new IllegalStateException("Enrollment is already completed");
        }

        if (enrollment.getStatus() == EnrollmentStatus.WITHDRAWN) {
            throw new IllegalStateException("Cannot complete a withdrawn enrollment");
        }

        // Complete the enrollment (auto-calculates letterGrade and gpaValue)
        enrollment.complete(finalScore);
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // Trigger student GPA recalculation
        studentService.recalculateAndUpdateGpa(enrollment.getStudent().getId());

        // Notify observers about enrollment completion (Observer Pattern - Member 3)
        notifyEnrollmentObservers(enrollment);

        return convertToDTO(savedEnrollment);
    }

    /**
     * Submit or update grade for an enrollment.
     * Does not change status - use completeEnrollment for that.
     * 
     * @param enrollmentId Enrollment database ID
     * @param score Score (0-10 scale)
     * @return Updated EnrollmentDTO
     */
    public EnrollmentDTO submitGrade(Long enrollmentId, Double score) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));

        enrollment.setFinalScore(score);
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // If already completed, recalculate GPA
        if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            studentService.recalculateAndUpdateGpa(enrollment.getStudent().getId());
        }

        return convertToDTO(savedEnrollment);
    }

    /**
     * Withdraw student from enrollment.
     * 
     * @param enrollmentId Enrollment database ID
     * @return Updated EnrollmentDTO
     * @throws RuntimeException if enrollment not found or already completed
     */
    public EnrollmentDTO withdrawEnrollment(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));

        if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new IllegalStateException("Cannot withdraw from a completed enrollment");
        }

        if (enrollment.getStatus() == EnrollmentStatus.WITHDRAWN) {
            throw new IllegalStateException("Enrollment is already withdrawn");
        }

        enrollment.withdraw();
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // Update offering enrollment count
        CourseOffering offering = enrollment.getCourseOffering();
        if (offering.getCurrentEnrollment() > 0) {
            offering.setCurrentEnrollment(offering.getCurrentEnrollment() - 1);
            courseOfferingRepository.save(offering);
        }

        return convertToDTO(savedEnrollment);
    }

    // ==================== GPA Calculation Helpers ====================

    /**
     * Calculate final grade using the Strategy Pattern.
     * Gets the grading scale from CourseOffering and uses the appropriate strategy.
     * 
     * Integration points:
     * - Strategy Pattern: Uses GradingStrategyFactory to get appropriate strategy
     * 
     * @param enrollmentId Enrollment database ID
     * @param rawScore Raw score to convert (0-10 scale)
     * @return EnrollmentDTO with calculated grades
     * @throws RuntimeException if enrollment not found
     */
    public EnrollmentDTO calculateFinalGradeWithStrategy(Long enrollmentId, Double rawScore) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));

        // Get grading scale from course offering
        String gradingScale = enrollment.getCourseOffering().getGradingScale();
        if (gradingScale == null || gradingScale.isBlank()) {
            gradingScale = "SCALE_10"; // Default
        }

        // Get appropriate strategy from factory
        IGradingStrategy strategy = gradingStrategyFactory.getStrategy(gradingScale);

        // Calculate grades using strategy
        Double gpaValue = strategy.calculateGpa(rawScore);
        String letterGrade = strategy.calculateLetterGrade(rawScore);
        boolean isPassing = strategy.isPassing(rawScore);

        // Update enrollment
        enrollment.setFinalScore(rawScore);
        enrollment.setGpaValue(gpaValue);
        enrollment.setLetterGrade(letterGrade);

        // If passing, mark status appropriately (but don't auto-complete)
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        return convertToDTO(savedEnrollment);
    }

    /**
     * Complete enrollment with final grade using Strategy Pattern.
     * Auto-selects grading strategy based on CourseOffering's gradingScale.
     * 
     * @param enrollmentId Enrollment database ID
     * @param rawScore Raw score (0-10 scale)
     * @return Updated EnrollmentDTO
     * @throws RuntimeException if enrollment not found or already completed
     */
    public EnrollmentDTO completeEnrollmentWithStrategy(Long enrollmentId, Double rawScore) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));

        if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new IllegalStateException("Enrollment is already completed");
        }

        if (enrollment.getStatus() == EnrollmentStatus.WITHDRAWN) {
            throw new IllegalStateException("Cannot complete a withdrawn enrollment");
        }

        // Get grading scale and strategy
        String gradingScale = enrollment.getCourseOffering().getGradingScale();
        if (gradingScale == null || gradingScale.isBlank()) {
            gradingScale = "SCALE_10";
        }
        IGradingStrategy strategy = gradingStrategyFactory.getStrategy(gradingScale);

        // Calculate grades using strategy
        Double gpaValue = strategy.calculateGpa(rawScore);
        String letterGrade = strategy.calculateLetterGrade(rawScore);

        // Update enrollment with calculated values
        enrollment.setFinalScore(rawScore);
        enrollment.setGpaValue(gpaValue);
        enrollment.setLetterGrade(letterGrade);
        enrollment.setStatus(EnrollmentStatus.COMPLETED);
        enrollment.setCompletedAt(LocalDateTime.now());

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // Trigger student GPA recalculation
        studentService.recalculateAndUpdateGpa(enrollment.getStudent().getId());

        // Notify observers about enrollment completion (Observer Pattern - Member 3)
        notifyEnrollmentObservers(enrollment);

        return convertToDTO(savedEnrollment);
    }

    /**
     * Calculate GPA value from score (10-point to 4-point conversion).
     * Static utility method that mirrors Enrollment entity logic.
     * 
     * @param score Score on 10-point scale
     * @return GPA value on 4-point scale
     * @deprecated Use calculateFinalGradeWithStrategy for strategy-based calculation
     */
    public static Double calculateGpaFromScore(Double score) {
        if (score == null) return null;
        if (score >= 9.0) return 4.0;
        if (score >= 8.5) return 3.7;
        if (score >= 8.0) return 3.5;
        if (score >= 7.0) return 3.0;
        if (score >= 6.5) return 2.5;
        if (score >= 5.5) return 2.0;
        if (score >= 5.0) return 1.5;
        if (score >= 4.0) return 1.0;
        return 0.0;
    }

    /**
     * Calculate letter grade from score.
     * Static utility method that mirrors Enrollment entity logic.
     * 
     * @param score Score on 10-point scale
     * @return Letter grade (A, A-, B+, B, C+, C, D+, D, F)
     */
    public static String calculateLetterGrade(Double score) {
        if (score == null) return null;
        if (score >= 9.0) return "A";
        if (score >= 8.5) return "A-";
        if (score >= 8.0) return "B+";
        if (score >= 7.0) return "B";
        if (score >= 6.5) return "C+";
        if (score >= 5.5) return "C";
        if (score >= 5.0) return "D+";
        if (score >= 4.0) return "D";
        return "F";
    }

    // ==================== Search and Filter ====================

    /**
     * Get enrollments by student ID
     * 
     * @param studentId Student database ID
     * @return List of EnrollmentDTOs for the student
     */
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getEnrollmentsByStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get enrollments by course offering ID
     * 
     * @param offeringId CourseOffering database ID
     * @return List of EnrollmentDTOs for the offering
     */
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getEnrollmentsByOffering(Long offeringId) {
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new ResourceNotFoundException("CourseOffering", "id", offeringId);
        }
        return enrollmentRepository.findByCourseOfferingId(offeringId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get enrollments by status
     * 
     * @param status EnrollmentStatus enum value
     * @return List of EnrollmentDTOs with the specified status
     */
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getEnrollmentsByStatus(EnrollmentStatus status) {
        return enrollmentRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get in-progress enrollments for a student
     * 
     * @param studentId Student database ID
     * @return List of in-progress EnrollmentDTOs
     */
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getInProgressEnrollments(Long studentId) {
        return enrollmentRepository.findInProgressByStudent(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get completed enrollments for a student
     * 
     * @param studentId Student database ID
     * @return List of completed EnrollmentDTOs
     */
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getCompletedEnrollments(Long studentId) {
        return enrollmentRepository.findByStudentIdAndStatus(studentId, EnrollmentStatus.COMPLETED).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Check if student is enrolled in a specific offering
     * 
     * @param studentId Student database ID
     * @param offeringId CourseOffering database ID
     * @return true if enrolled
     */
    @Transactional(readOnly = true)
    public boolean isStudentEnrolled(Long studentId, Long offeringId) {
        return enrollmentRepository.existsByStudentIdAndCourseOfferingId(studentId, offeringId);
    }

    /**
     * Get enrollment by student and offering
     * 
     * @param studentId Student database ID
     * @param offeringId CourseOffering database ID
     * @return EnrollmentDTO or null if not found
     */
    @Transactional(readOnly = true)
    public EnrollmentDTO getEnrollmentByStudentAndOffering(Long studentId, Long offeringId) {
        return enrollmentRepository.findByStudentIdAndCourseOfferingId(studentId, offeringId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    // ==================== DTO Conversion Helpers ====================

    /**
     * Convert Enrollment entity to EnrollmentDTO
     */
    private EnrollmentDTO convertToDTO(Enrollment enrollment) {
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
        
        // Convert grade entries if present
        if (enrollment.getGradeEntries() != null && !enrollment.getGradeEntries().isEmpty()) {
            List<GradeEntryDTO> gradeEntryDTOs = enrollment.getGradeEntries().stream()
                    .filter(ge -> ge.getParent() == null) // Only top-level entries
                    .map(this::convertGradeEntryToDTO)
                    .collect(Collectors.toList());
            dto.setGradeEntries(gradeEntryDTOs);
        }
        
        return dto;
    }

    /**
     * Convert GradeEntry entity to GradeEntryDTO (with children)
     */
    private GradeEntryDTO convertGradeEntryToDTO(GradeEntry gradeEntry) {
        GradeEntryDTO dto = new GradeEntryDTO();
        dto.setId(gradeEntry.getId());
        dto.setEnrollmentId(gradeEntry.getEnrollment().getId());
        dto.setName(gradeEntry.getName());
        dto.setWeight(gradeEntry.getWeight());
        dto.setScore(gradeEntry.getScore());
        dto.setCalculatedScore(gradeEntry.getCalculatedScore());
        dto.setEntryType(gradeEntry.getEntryType());
        dto.setRecordedBy(gradeEntry.getRecordedBy());
        dto.setRecordedAt(gradeEntry.getRecordedAt());
        dto.setNotes(gradeEntry.getNotes());
        
        // Set course and student info from enrollment
        Enrollment enrollment = gradeEntry.getEnrollment();
        dto.setCourseCode(enrollment.getCourseOffering().getCourse().getCourseCode());
        dto.setCourseName(enrollment.getCourseOffering().getCourse().getCourseName());
        dto.setStudentName(enrollment.getStudent().getFullName());
        
        if (gradeEntry.getParent() != null) {
            dto.setParentId(gradeEntry.getParent().getId());
        }
        
        // Recursively convert children
        if (gradeEntry.getChildren() != null && !gradeEntry.getChildren().isEmpty()) {
            List<GradeEntryDTO> childDTOs = gradeEntry.getChildren().stream()
                    .map(this::convertGradeEntryToDTO)
                    .collect(Collectors.toList());
            dto.setChildren(childDTOs);
        }
        
        return dto;
    }
}
