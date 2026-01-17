package com.spts.service;

import com.spts.dto.GradeEntryDTO;
import com.spts.entity.*;
import com.spts.exception.ResourceNotFoundException;
import com.spts.repository.EnrollmentRepository;
import com.spts.repository.GradeEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for GradeEntry entity.
 * Provides CRUD operations and Composite Pattern support for hierarchical grades.
 * 
 * Implements Composite Pattern:
 * - Root entries (parent = null) represent main grade components (Midterm, Final, Lab)
 * - Child entries represent sub-components (Lab -> Quiz1, Quiz2, Assignment)
 * - Scores can be calculated recursively from children
 * 
 * Integrates with:
 * - EnrollmentService: Updates enrollment grade when final score calculated
 * - Observer Pattern: Notifies observers on grade changes (hook for Member 3)
 * 
 * Reference: OOSD Chapter 6 - Composite Pattern
 * 
 * @author SPTS Team
 */
@Service
@Transactional
public class GradeEntryService {

    private final GradeEntryRepository gradeEntryRepository;
    private final EnrollmentRepository enrollmentRepository;

    public GradeEntryService(GradeEntryRepository gradeEntryRepository,
                              EnrollmentRepository enrollmentRepository) {
        this.gradeEntryRepository = gradeEntryRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // ==================== CRUD Operations ====================

    /**
     * Get all grade entries
     * 
     * @return List of all grade entries as DTOs
     */
    @Transactional(readOnly = true)
    public List<GradeEntryDTO> getAllGradeEntries() {
        return gradeEntryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get grade entry by ID
     * 
     * @param id GradeEntry database ID
     * @return GradeEntryDTO
     * @throws RuntimeException if entry not found
     */
    @Transactional(readOnly = true)
    public GradeEntryDTO getGradeEntryById(Long id) {
        GradeEntry gradeEntry = gradeEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GradeEntry", "id", id));
        return convertToDTO(gradeEntry);
    }

    /**
     * Create a new grade entry
     * 
     * @param dto GradeEntryDTO with entry data
     * @return Created GradeEntryDTO with generated ID
     * @throws RuntimeException if enrollment not found
     */
    public GradeEntryDTO createGradeEntry(GradeEntryDTO dto) {
        // Validate enrollment exists
        Enrollment enrollment = enrollmentRepository.findById(dto.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", dto.getEnrollmentId()));

        GradeEntry gradeEntry = new GradeEntry();
        gradeEntry.setEnrollment(enrollment);
        gradeEntry.setName(dto.getName());
        gradeEntry.setWeight(dto.getWeight());
        gradeEntry.setScore(dto.getScore());
        gradeEntry.setEntryType(dto.getEntryType() != null ? dto.getEntryType() : GradeEntryType.COMPONENT);
        gradeEntry.setRecordedBy(dto.getRecordedBy());
        gradeEntry.setRecordedAt(LocalDateTime.now());
        gradeEntry.setNotes(dto.getNotes());

        // Set parent if specified (Composite Pattern)
        if (dto.getParentId() != null) {
            GradeEntry parent = gradeEntryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("GradeEntry", "id", dto.getParentId()));
            gradeEntry.setParent(parent);
        }

        GradeEntry savedEntry = gradeEntryRepository.save(gradeEntry);

        // TODO: Notify observers (Observer pattern hook for Member 3)
        // gradeSubject.notifyObservers(savedEntry);

        return convertToDTO(savedEntry);
    }

    /**
     * Update an existing grade entry
     * 
     * @param id  GradeEntry database ID
     * @param dto GradeEntryDTO with updated data
     * @return Updated GradeEntryDTO
     * @throws RuntimeException if entry not found
     */
    public GradeEntryDTO updateGradeEntry(Long id, GradeEntryDTO dto) {
        GradeEntry gradeEntry = gradeEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GradeEntry", "id", id));

        // Update fields
        gradeEntry.setName(dto.getName());
        gradeEntry.setWeight(dto.getWeight());
        gradeEntry.setScore(dto.getScore());
        gradeEntry.setRecordedBy(dto.getRecordedBy());
        gradeEntry.setRecordedAt(LocalDateTime.now());
        gradeEntry.setNotes(dto.getNotes());

        if (dto.getEntryType() != null) {
            gradeEntry.setEntryType(dto.getEntryType());
        }

        GradeEntry savedEntry = gradeEntryRepository.save(gradeEntry);

        // TODO: Notify observers on grade change (Observer pattern hook for Member 3)
        // gradeSubject.notifyObservers(savedEntry);

        return convertToDTO(savedEntry);
    }

    /**
     * Delete a grade entry
     * Note: Deleting a parent will cascade delete all children
     * 
     * @param id GradeEntry database ID
     * @throws RuntimeException if entry not found
     */
    public void deleteGradeEntry(Long id) {
        if (!gradeEntryRepository.existsById(id)) {
            throw new ResourceNotFoundException("GradeEntry", "id", id);
        }
        gradeEntryRepository.deleteById(id);
    }

    // ==================== Composite Pattern Operations ====================

    /**
     * Add a child grade entry to a parent (Composite Pattern).
     * 
     * Example: Adding Quiz1 as a child of Lab component
     * 
     * @param parentId Parent GradeEntry database ID
     * @param dto      GradeEntryDTO for the child entry
     * @return Created child GradeEntryDTO
     * @throws RuntimeException if parent not found
     */
    public GradeEntryDTO addChildGradeEntry(Long parentId, GradeEntryDTO dto) {
        GradeEntry parent = gradeEntryRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("GradeEntry", "id", parentId));

        GradeEntry child = new GradeEntry();
        child.setEnrollment(parent.getEnrollment());
        child.setParent(parent);
        child.setName(dto.getName());
        child.setWeight(dto.getWeight());
        child.setScore(dto.getScore());
        child.setEntryType(dto.getEntryType() != null ? dto.getEntryType() : GradeEntryType.COMPONENT);
        child.setRecordedBy(dto.getRecordedBy());
        child.setRecordedAt(LocalDateTime.now());
        child.setNotes(dto.getNotes());

        GradeEntry savedChild = gradeEntryRepository.save(child);

        return convertToDTO(savedChild);
    }

    /**
     * Get children of a grade entry (Composite Pattern)
     * 
     * @param parentId Parent GradeEntry database ID
     * @return List of child GradeEntryDTOs
     */
    @Transactional(readOnly = true)
    public List<GradeEntryDTO> getChildren(Long parentId) {
        if (!gradeEntryRepository.existsById(parentId)) {
            throw new ResourceNotFoundException("GradeEntry", "id", parentId);
        }
        return gradeEntryRepository.findByParentId(parentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get root grade entries for an enrollment (entries without parent)
     * 
     * @param enrollmentId Enrollment database ID
     * @return List of root GradeEntryDTOs
     */
    @Transactional(readOnly = true)
    public List<GradeEntryDTO> getRootEntriesByEnrollment(Long enrollmentId) {
        if (!enrollmentRepository.existsById(enrollmentId)) {
            throw new ResourceNotFoundException("Enrollment", "id", enrollmentId);
        }
        return gradeEntryRepository.findByEnrollmentIdAndParentIsNull(enrollmentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get hierarchical grade structure for an enrollment.
     * Returns root entries with nested children.
     * 
     * @param enrollmentId Enrollment database ID
     * @return List of root GradeEntryDTOs with children populated
     */
    @Transactional(readOnly = true)
    public List<GradeEntryDTO> getHierarchicalGrades(Long enrollmentId) {
        if (!enrollmentRepository.existsById(enrollmentId)) {
            throw new ResourceNotFoundException("Enrollment", "id", enrollmentId);
        }
        
        // Get root entries and convert with children recursively
        return gradeEntryRepository.findByEnrollmentIdAndParentIsNull(enrollmentId).stream()
                .map(this::convertToDTOWithChildren)
                .collect(Collectors.toList());
    }

    /**
     * Calculate composite score for a grade entry.
     * For leaf nodes, returns the direct score.
     * For composite nodes, recursively calculates weighted average from children.
     * 
     * @param gradeEntryId GradeEntry database ID
     * @return Calculated score (0-10 scale)
     */
    @Transactional(readOnly = true)
    public Double calculateCompositeScore(Long gradeEntryId) {
        GradeEntry gradeEntry = gradeEntryRepository.findById(gradeEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("GradeEntry", "id", gradeEntryId));
        return gradeEntry.getCalculatedScore();
    }

    /**
     * Calculate weighted score for a grade entry (score * weight).
     * For composite nodes, calculates from children first.
     * 
     * @param gradeEntryId GradeEntry database ID
     * @return Weighted score
     */
    @Transactional(readOnly = true)
    public Double calculateWeightedScore(Long gradeEntryId) {
        GradeEntry gradeEntry = gradeEntryRepository.findById(gradeEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("GradeEntry", "id", gradeEntryId));
        return gradeEntry.calculateWeightedScore();
    }

    /**
     * Calculate final grade for an enrollment from all root components.
     * 
     * @param enrollmentId Enrollment database ID
     * @return Calculated final grade (0-10 scale)
     */
    @Transactional(readOnly = true)
    public Double calculateFinalGrade(Long enrollmentId) {
        List<GradeEntry> rootEntries = gradeEntryRepository.findByEnrollmentIdAndParentIsNull(enrollmentId);
        
        if (rootEntries.isEmpty()) {
            return null;
        }

        double totalWeightedScore = 0.0;
        double totalWeight = 0.0;

        for (GradeEntry entry : rootEntries) {
            Double score = entry.getCalculatedScore();
            if (score != null && entry.getWeight() != null) {
                totalWeightedScore += score * entry.getWeight();
                totalWeight += entry.getWeight();
            }
        }

        return totalWeight > 0 ? totalWeightedScore / totalWeight : null;
    }

    /**
     * Validate that weights sum to 1.0 for root entries of an enrollment.
     * 
     * @param enrollmentId Enrollment database ID
     * @return true if weights are valid
     */
    @Transactional(readOnly = true)
    public boolean validateWeights(Long enrollmentId) {
        List<GradeEntry> rootEntries = gradeEntryRepository.findByEnrollmentIdAndParentIsNull(enrollmentId);
        
        double totalWeight = rootEntries.stream()
                .filter(e -> e.getWeight() != null)
                .mapToDouble(GradeEntry::getWeight)
                .sum();

        // Allow small tolerance for floating point
        return Math.abs(totalWeight - 1.0) < 0.001;
    }

    // ==================== Search and Filter ====================

    /**
     * Get all grade entries for an enrollment
     * 
     * @param enrollmentId Enrollment database ID
     * @return List of GradeEntryDTOs
     */
    @Transactional(readOnly = true)
    public List<GradeEntryDTO> getEntriesByEnrollment(Long enrollmentId) {
        if (!enrollmentRepository.existsById(enrollmentId)) {
            throw new ResourceNotFoundException("Enrollment", "id", enrollmentId);
        }
        return gradeEntryRepository.findByEnrollmentId(enrollmentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all grade entries for a student across all enrollments
     * 
     * @param studentId Student database ID
     * @return List of GradeEntryDTOs
     */
    @Transactional(readOnly = true)
    public List<GradeEntryDTO> getEntriesByStudent(Long studentId) {
        return gradeEntryRepository.findByStudentId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get grade entries by type
     * 
     * @param entryType GradeEntryType enum value
     * @return List of GradeEntryDTOs
     */
    @Transactional(readOnly = true)
    public List<GradeEntryDTO> getEntriesByType(GradeEntryType entryType) {
        return gradeEntryRepository.findByEntryType(entryType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get grade entries for a student in a specific course offering
     * 
     * @param studentId       Student database ID
     * @param courseOfferingId CourseOffering database ID
     * @return List of GradeEntryDTOs
     */
    @Transactional(readOnly = true)
    public List<GradeEntryDTO> getEntriesByStudentAndOffering(Long studentId, Long courseOfferingId) {
        return gradeEntryRepository.findByStudentAndCourseOffering(studentId, courseOfferingId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get leaf entries (entries without children) for an enrollment
     * 
     * @param enrollmentId Enrollment database ID
     * @return List of leaf GradeEntryDTOs
     */
    @Transactional(readOnly = true)
    public List<GradeEntryDTO> getLeafEntries(Long enrollmentId) {
        return gradeEntryRepository.findLeafEntries(enrollmentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update score for a grade entry
     * 
     * @param gradeEntryId GradeEntry database ID
     * @param score        New score (0-10 scale)
     * @param recordedBy   Username of person recording
     * @return Updated GradeEntryDTO
     */
    public GradeEntryDTO updateScore(Long gradeEntryId, Double score, String recordedBy) {
        GradeEntry gradeEntry = gradeEntryRepository.findById(gradeEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("GradeEntry", "id", gradeEntryId));

        gradeEntry.setScore(score);
        gradeEntry.setRecordedBy(recordedBy);
        gradeEntry.setRecordedAt(LocalDateTime.now());

        GradeEntry savedEntry = gradeEntryRepository.save(gradeEntry);

        // TODO: Notify observers on score change (Observer pattern hook for Member 3)
        // gradeSubject.notifyObservers(savedEntry);

        return convertToDTO(savedEntry);
    }

    /**
     * Count grade entries for an enrollment
     * 
     * @param enrollmentId Enrollment database ID
     * @return Number of grade entries
     */
    @Transactional(readOnly = true)
    public Long countEntriesByEnrollment(Long enrollmentId) {
        return gradeEntryRepository.countByEnrollmentId(enrollmentId);
    }

    // ==================== DTO Conversion Helpers ====================

    /**
     * Convert GradeEntry entity to GradeEntryDTO (without children)
     */
    private GradeEntryDTO convertToDTO(GradeEntry gradeEntry) {
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

        // Set parent ID if exists
        if (gradeEntry.getParent() != null) {
            dto.setParentId(gradeEntry.getParent().getId());
        }

        // Set course and student info from enrollment
        Enrollment enrollment = gradeEntry.getEnrollment();
        dto.setCourseCode(enrollment.getCourseOffering().getCourse().getCourseCode());
        dto.setCourseName(enrollment.getCourseOffering().getCourse().getCourseName());
        dto.setStudentName(enrollment.getStudent().getFullName());

        return dto;
    }

    /**
     * Convert GradeEntry entity to GradeEntryDTO with nested children (recursive)
     */
    private GradeEntryDTO convertToDTOWithChildren(GradeEntry gradeEntry) {
        GradeEntryDTO dto = convertToDTO(gradeEntry);

        // Recursively convert children
        if (gradeEntry.getChildren() != null && !gradeEntry.getChildren().isEmpty()) {
            List<GradeEntryDTO> childDTOs = gradeEntry.getChildren().stream()
                    .map(this::convertToDTOWithChildren)
                    .collect(Collectors.toList());
            dto.setChildren(childDTOs);
        }

        return dto;
    }
}
