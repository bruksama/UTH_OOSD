package com.spts.service;

import com.spts.dto.CourseOfferingDTO;
import com.spts.dto.EnrollmentDTO;
import com.spts.entity.Course;
import com.spts.entity.CourseOffering;
import com.spts.entity.Enrollment;
import com.spts.entity.Semester;
import com.spts.repository.CourseOfferingRepository;
import com.spts.repository.CourseRepository;
import com.spts.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for CourseOffering entity.
 * Provides CRUD operations and enrollment management.
 * 
 * CourseOffering represents the Occurrence in Abstraction-Occurrence Pattern.
 * Each CourseOffering is a specific instance of a Course in a particular semester.
 * 
 * Reference: OOSD Chapter 6 - Abstraction-Occurrence Pattern
 * 
 * @author SPTS Team
 */
@Service
@Transactional
public class CourseOfferingService {

    private final CourseOfferingRepository courseOfferingRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseOfferingService(CourseOfferingRepository courseOfferingRepository,
                                  CourseRepository courseRepository,
                                  EnrollmentRepository enrollmentRepository) {
        this.courseOfferingRepository = courseOfferingRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // ==================== CRUD Operations ====================

    /**
     * Get all course offerings
     * 
     * @return List of all course offerings as DTOs
     */
    @Transactional(readOnly = true)
    public List<CourseOfferingDTO> getAllOfferings() {
        return courseOfferingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get course offering by ID
     * 
     * @param id CourseOffering database ID
     * @return CourseOfferingDTO
     * @throws RuntimeException if offering not found
     */
    @Transactional(readOnly = true)
    public CourseOfferingDTO getOfferingById(Long id) {
        CourseOffering offering = courseOfferingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course offering not found with id: " + id));
        return convertToDTO(offering);
    }

    /**
     * Create a new course offering
     * 
     * @param dto CourseOfferingDTO with offering data
     * @return Created CourseOfferingDTO with generated ID
     * @throws RuntimeException if course not found or duplicate offering exists
     */
    public CourseOfferingDTO createOffering(CourseOfferingDTO dto) {
        // Validate course exists
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + dto.getCourseId()));

        // Check for duplicate offering (same course, semester, year)
        if (courseOfferingRepository.findByCourseIdAndSemesterAndAcademicYear(
                dto.getCourseId(), dto.getSemester(), dto.getAcademicYear()).isPresent()) {
            throw new RuntimeException("Offering already exists for this course in " + 
                    dto.getSemester() + " " + dto.getAcademicYear());
        }

        CourseOffering offering = new CourseOffering();
        offering.setCourse(course);
        offering.setSemester(dto.getSemester());
        offering.setAcademicYear(dto.getAcademicYear());
        offering.setInstructor(dto.getInstructor());
        offering.setMaxEnrollment(dto.getMaxEnrollment());
        offering.setCurrentEnrollment(0);
        offering.setGradingScale(dto.getGradingScale() != null ? dto.getGradingScale() : "SCALE_10");

        CourseOffering savedOffering = courseOfferingRepository.save(offering);
        return convertToDTO(savedOffering);
    }

    /**
     * Update an existing course offering
     * 
     * @param id  CourseOffering database ID
     * @param dto CourseOfferingDTO with updated data
     * @return Updated CourseOfferingDTO
     * @throws RuntimeException if offering not found or duplicate exists
     */
    public CourseOfferingDTO updateOffering(Long id, CourseOfferingDTO dto) {
        CourseOffering offering = courseOfferingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course offering not found with id: " + id));

        // Check if changing to a combination that already exists
        if (!offering.getCourse().getId().equals(dto.getCourseId()) ||
            !offering.getSemester().equals(dto.getSemester()) ||
            !offering.getAcademicYear().equals(dto.getAcademicYear())) {
            
            if (courseOfferingRepository.findByCourseIdAndSemesterAndAcademicYear(
                    dto.getCourseId(), dto.getSemester(), dto.getAcademicYear()).isPresent()) {
                throw new RuntimeException("Offering already exists for this course in " + 
                        dto.getSemester() + " " + dto.getAcademicYear());
            }
        }

        // Update course if changed
        if (!offering.getCourse().getId().equals(dto.getCourseId())) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + dto.getCourseId()));
            offering.setCourse(course);
        }

        // Update fields
        offering.setSemester(dto.getSemester());
        offering.setAcademicYear(dto.getAcademicYear());
        offering.setInstructor(dto.getInstructor());
        offering.setMaxEnrollment(dto.getMaxEnrollment());
        if (dto.getGradingScale() != null) {
            offering.setGradingScale(dto.getGradingScale());
        }
        // Note: currentEnrollment is managed by the system

        CourseOffering savedOffering = courseOfferingRepository.save(offering);
        return convertToDTO(savedOffering);
    }

    /**
     * Delete a course offering
     * 
     * @param id CourseOffering database ID
     * @throws RuntimeException if offering not found or has enrollments
     */
    public void deleteOffering(Long id) {
        CourseOffering offering = courseOfferingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course offering not found with id: " + id));

        // Check if offering has enrollments
        List<Enrollment> enrollments = enrollmentRepository.findByCourseOfferingId(id);
        if (!enrollments.isEmpty()) {
            throw new RuntimeException("Cannot delete offering with existing enrollments. " +
                    "Remove enrollments first or archive instead.");
        }

        courseOfferingRepository.deleteById(id);
    }

    // ==================== Enrollment Management ====================

    /**
     * Get all enrollments for a course offering
     * 
     * @param offeringId CourseOffering database ID
     * @return List of EnrollmentDTOs
     */
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getOfferingEnrollments(Long offeringId) {
        if (!courseOfferingRepository.existsById(offeringId)) {
            throw new RuntimeException("Course offering not found with id: " + offeringId);
        }

        return enrollmentRepository.findByCourseOfferingId(offeringId).stream()
                .map(this::convertEnrollmentToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Check if offering has available seats
     * 
     * @param offeringId CourseOffering database ID
     * @return true if seats are available
     */
    @Transactional(readOnly = true)
    public boolean hasAvailableSeats(Long offeringId) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Course offering not found with id: " + offeringId));
        return offering.hasAvailableSeats();
    }

    /**
     * Get available seats count
     * 
     * @param offeringId CourseOffering database ID
     * @return Number of available seats, or null if unlimited
     */
    @Transactional(readOnly = true)
    public Integer getAvailableSeats(Long offeringId) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Course offering not found with id: " + offeringId));
        return offering.getAvailableSeats();
    }

    /**
     * Synchronize enrollment count with actual enrollments.
     * Called after enrollment changes to ensure consistency.
     * 
     * @param offeringId CourseOffering database ID
     */
    public void syncEnrollmentCount(Long offeringId) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Course offering not found with id: " + offeringId));

        int actualCount = enrollmentRepository.findByCourseOfferingId(offeringId).size();
        offering.setCurrentEnrollment(actualCount);
        courseOfferingRepository.save(offering);
    }

    /**
     * Increment enrollment count (called when student enrolls)
     * 
     * @param offeringId CourseOffering database ID
     * @throws RuntimeException if no seats available
     */
    public void incrementEnrollmentCount(Long offeringId) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Course offering not found with id: " + offeringId));

        if (!offering.hasAvailableSeats()) {
            throw new RuntimeException("No available seats in this offering");
        }

        offering.setCurrentEnrollment(offering.getCurrentEnrollment() + 1);
        courseOfferingRepository.save(offering);
    }

    /**
     * Decrement enrollment count (called when student withdraws)
     * 
     * @param offeringId CourseOffering database ID
     */
    public void decrementEnrollmentCount(Long offeringId) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Course offering not found with id: " + offeringId));

        if (offering.getCurrentEnrollment() > 0) {
            offering.setCurrentEnrollment(offering.getCurrentEnrollment() - 1);
            courseOfferingRepository.save(offering);
        }
    }

    // ==================== Search and Filter ====================

    /**
     * Get offerings by semester and academic year
     * 
     * @param semester Semester enum value
     * @param academicYear Academic year
     * @return List of CourseOfferingDTOs
     */
    @Transactional(readOnly = true)
    public List<CourseOfferingDTO> getOfferingsBySemesterAndYear(Semester semester, Integer academicYear) {
        return courseOfferingRepository.findBySemesterAndAcademicYear(semester, academicYear).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get offerings by academic year
     * 
     * @param academicYear Academic year
     * @return List of CourseOfferingDTOs
     */
    @Transactional(readOnly = true)
    public List<CourseOfferingDTO> getOfferingsByYear(Integer academicYear) {
        return courseOfferingRepository.findByAcademicYear(academicYear).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get offerings by instructor
     * 
     * @param instructor Instructor name
     * @return List of CourseOfferingDTOs
     */
    @Transactional(readOnly = true)
    public List<CourseOfferingDTO> getOfferingsByInstructor(String instructor) {
        return courseOfferingRepository.findByInstructor(instructor).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get offerings with available seats
     * 
     * @return List of CourseOfferingDTOs with open seats
     */
    @Transactional(readOnly = true)
    public List<CourseOfferingDTO> getOfferingsWithAvailableSeats() {
        return courseOfferingRepository.findOfferingsWithAvailableSeats().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get current semester offerings
     * 
     * @param semester Current semester
     * @param year Current academic year
     * @return List of CourseOfferingDTOs for current semester
     */
    @Transactional(readOnly = true)
    public List<CourseOfferingDTO> getCurrentOfferings(Semester semester, Integer year) {
        return courseOfferingRepository.findCurrentOfferings(semester, year).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all distinct instructors
     * 
     * @return List of instructor names
     */
    @Transactional(readOnly = true)
    public List<String> getAllInstructors() {
        return courseOfferingRepository.findAll().stream()
                .map(CourseOffering::getInstructor)
                .filter(instructor -> instructor != null && !instructor.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // ==================== DTO Conversion Helpers ====================

    /**
     * Convert CourseOffering entity to CourseOfferingDTO
     */
    private CourseOfferingDTO convertToDTO(CourseOffering offering) {
        CourseOfferingDTO dto = new CourseOfferingDTO();
        dto.setId(offering.getId());
        dto.setCourseId(offering.getCourse().getId());
        dto.setCourseCode(offering.getCourse().getCourseCode());
        dto.setCourseName(offering.getCourse().getCourseName());
        dto.setCredits(offering.getCourse().getCredits());
        dto.setSemester(offering.getSemester());
        dto.setAcademicYear(offering.getAcademicYear());
        dto.setInstructor(offering.getInstructor());
        dto.setMaxEnrollment(offering.getMaxEnrollment());
        dto.setCurrentEnrollment(offering.getCurrentEnrollment());
        dto.setGradingScale(offering.getGradingScale());
        return dto;
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
}
