package com.spts.service;

import com.spts.dto.CourseDTO;
import com.spts.dto.CourseOfferingDTO;
import com.spts.entity.Course;
import com.spts.entity.CourseOffering;
import com.spts.entity.GradingType;
import com.spts.repository.CourseOfferingRepository;
import com.spts.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for Course entity.
 * Provides CRUD operations and course-related queries.
 * 
 * Course represents the Abstraction in Abstraction-Occurrence Pattern.
 * Each Course can have multiple CourseOfferings (Occurrences) across semesters.
 * 
 * Reference: OOSD Chapter 6 - Abstraction-Occurrence Pattern
 * 
 * @author SPTS Team
 */
@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseOfferingRepository courseOfferingRepository;

    public CourseService(CourseRepository courseRepository,
                         CourseOfferingRepository courseOfferingRepository) {
        this.courseRepository = courseRepository;
        this.courseOfferingRepository = courseOfferingRepository;
    }

    // ==================== CRUD Operations ====================

    /**
     * Get all courses
     * 
     * @return List of all courses as DTOs
     */
    @Transactional(readOnly = true)
    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get course by ID
     * 
     * @param id Course database ID
     * @return CourseDTO
     * @throws RuntimeException if course not found
     */
    @Transactional(readOnly = true)
    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        return convertToDTO(course);
    }

    /**
     * Get course by course code (business key)
     * 
     * @param courseCode Course code (e.g., "CS101")
     * @return CourseDTO
     * @throws RuntimeException if course not found
     */
    @Transactional(readOnly = true)
    public CourseDTO getCourseByCourseCode(String courseCode) {
        Course course = courseRepository.findByCourseCode(courseCode)
                .orElseThrow(() -> new RuntimeException("Course not found with code: " + courseCode));
        return convertToDTO(course);
    }

    /**
     * Create a new course
     * 
     * @param dto CourseDTO with course data
     * @return Created CourseDTO with generated ID
     * @throws RuntimeException if course code already exists
     */
    public CourseDTO createCourse(CourseDTO dto) {
        // Check for duplicate course code
        if (courseRepository.existsByCourseCode(dto.getCourseCode())) {
            throw new RuntimeException("Course code already exists: " + dto.getCourseCode());
        }

        Course course = convertToEntity(dto);
        
        // Set default grading type if not specified
        if (course.getGradingType() == null) {
            course.setGradingType(GradingType.SCALE_10);
        }

        Course savedCourse = courseRepository.save(course);
        return convertToDTO(savedCourse);
    }

    /**
     * Update an existing course
     * 
     * @param id  Course database ID
     * @param dto CourseDTO with updated data
     * @return Updated CourseDTO
     * @throws RuntimeException if course not found or duplicate code
     */
    public CourseDTO updateCourse(Long id, CourseDTO dto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        // Check for duplicate course code (if changed)
        if (!course.getCourseCode().equals(dto.getCourseCode()) 
                && courseRepository.existsByCourseCode(dto.getCourseCode())) {
            throw new RuntimeException("Course code already exists: " + dto.getCourseCode());
        }

        // Update fields
        course.setCourseCode(dto.getCourseCode());
        course.setCourseName(dto.getCourseName());
        course.setDescription(dto.getDescription());
        course.setCredits(dto.getCredits());
        course.setDepartment(dto.getDepartment());
        
        if (dto.getGradingType() != null) {
            course.setGradingType(dto.getGradingType());
        }

        Course savedCourse = courseRepository.save(course);
        return convertToDTO(savedCourse);
    }

    /**
     * Delete a course
     * 
     * Note: This will fail if course has offerings due to FK constraint.
     * Consider using soft delete or checking for offerings first.
     * 
     * @param id Course database ID
     * @throws RuntimeException if course not found or has offerings
     */
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        // Check if course has offerings
        List<CourseOffering> offerings = courseOfferingRepository.findByCourseId(id);
        if (!offerings.isEmpty()) {
            throw new RuntimeException("Cannot delete course with existing offerings. " +
                    "Delete offerings first or use archive instead.");
        }

        courseRepository.deleteById(id);
    }

    // ==================== Course Offerings (Abstraction-Occurrence) ====================

    /**
     * Get all offerings for a course.
     * This demonstrates the Abstraction-Occurrence pattern:
     * - Course (Abstraction): General course definition
     * - CourseOffering (Occurrence): Specific instance per semester
     * 
     * @param courseId Course database ID
     * @return List of CourseOfferingDTOs
     */
    @Transactional(readOnly = true)
    public List<CourseOfferingDTO> getCourseOfferings(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found with id: " + courseId);
        }

        return courseOfferingRepository.findByCourseId(courseId).stream()
                .map(this::convertOfferingToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Count total offerings for a course
     * 
     * @param courseId Course database ID
     * @return Number of offerings
     */
    @Transactional(readOnly = true)
    public int countCourseOfferings(Long courseId) {
        return courseOfferingRepository.findByCourseId(courseId).size();
    }

    // ==================== Search and Filter ====================

    /**
     * Search courses by name (case-insensitive partial match)
     * 
     * @param name Name to search for
     * @return List of matching CourseDTOs
     */
    @Transactional(readOnly = true)
    public List<CourseDTO> searchByName(String name) {
        return courseRepository.searchByName(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get courses by department
     * 
     * @param department Department name
     * @return List of CourseDTOs in the department
     */
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesByDepartment(String department) {
        return courseRepository.findByDepartment(department).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get courses by grading type.
     * Useful for filtering courses that use specific grading strategies.
     * 
     * @param gradingType GradingType enum value (SCALE_10, SCALE_4, PASS_FAIL)
     * @return List of CourseDTOs with the specified grading type
     */
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesByGradingType(GradingType gradingType) {
        return courseRepository.findByGradingType(gradingType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get courses by credit range
     * 
     * @param minCredits Minimum credits (inclusive)
     * @param maxCredits Maximum credits (inclusive)
     * @return List of CourseDTOs within the credit range
     */
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesByCreditRange(Integer minCredits, Integer maxCredits) {
        return courseRepository.findByCreditRange(minCredits, maxCredits).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all distinct departments
     * 
     * @return List of department names
     */
    @Transactional(readOnly = true)
    public List<String> getAllDepartments() {
        return courseRepository.findAll().stream()
                .map(Course::getDepartment)
                .filter(dept -> dept != null && !dept.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // ==================== DTO Conversion Helpers ====================

    /**
     * Convert Course entity to CourseDTO
     */
    private CourseDTO convertToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setCourseCode(course.getCourseCode());
        dto.setCourseName(course.getCourseName());
        dto.setDescription(course.getDescription());
        dto.setCredits(course.getCredits());
        dto.setDepartment(course.getDepartment());
        dto.setGradingType(course.getGradingType());
        return dto;
    }

    /**
     * Convert CourseDTO to Course entity
     */
    private Course convertToEntity(CourseDTO dto) {
        Course course = new Course();
        course.setCourseCode(dto.getCourseCode());
        course.setCourseName(dto.getCourseName());
        course.setDescription(dto.getDescription());
        course.setCredits(dto.getCredits());
        course.setDepartment(dto.getDepartment());
        course.setGradingType(dto.getGradingType());
        return course;
    }

    /**
     * Convert CourseOffering entity to CourseOfferingDTO
     */
    private CourseOfferingDTO convertOfferingToDTO(CourseOffering offering) {
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
        return dto;
    }
}
