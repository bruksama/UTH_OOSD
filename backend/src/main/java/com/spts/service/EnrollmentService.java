@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

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
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));
                if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot withdraw from a completed enrollment");
        }
        if (enrollment.getStatus() == EnrollmentStatus.WITHDRAWN) {
            throw new RuntimeException("Enrollment is already withdrawn");
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
     * Calculate GPA value from score (10-point to 4-point conversion).
     * Static utility method that mirrors Enrollment entity logic.
     * 
     * @param score Score on 10-point scale
     * @return GPA value on 4-point scale
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
            throw new RuntimeException("Student not found with id: " + studentId);
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
            throw new RuntimeException("Course offering not found with id: " + offeringId);
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