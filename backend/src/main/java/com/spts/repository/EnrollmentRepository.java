package com.spts.repository;

import com.spts.entity.Enrollment;
import com.spts.entity.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Enrollment entity.
 * 
 * @author SPTS Team
 */
@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    /**
     * Find enrollments by student ID
     */
    List<Enrollment> findByStudentId(Long studentId);

    /**
     * Find enrollments by course offering ID
     */
    List<Enrollment> findByCourseOfferingId(Long courseOfferingId);

    /**
     * Find enrollment by student and course offering (unique combination)
     */
    Optional<Enrollment> findByStudentIdAndCourseOfferingId(Long studentId, Long courseOfferingId);

    /**
     * Check if student is already enrolled in a course offering
     */
    boolean existsByStudentIdAndCourseOfferingId(Long studentId, Long courseOfferingId);

    /**
     * Find enrollments by status
     */
    List<Enrollment> findByStatus(EnrollmentStatus status);

    /**
     * Find completed enrollments for a student
     */
    List<Enrollment> findByStudentIdAndStatus(Long studentId, EnrollmentStatus status);

    /**
     * Find enrollments by student's studentId (string)
     */
    @Query("SELECT e FROM Enrollment e WHERE e.student.studentId = :studentId")
    List<Enrollment> findByStudentStudentId(@Param("studentId") String studentId);

    /**
     * Calculate GPA for a student from completed enrollments
     */
    @Query("SELECT AVG(e.gpaValue) FROM Enrollment e " +
           "WHERE e.student.id = :studentId AND e.status = 'COMPLETED' AND e.gpaValue IS NOT NULL")
    Double calculateAverageGpa(@Param("studentId") Long studentId);

    /**
     * Count completed credits for a student (passing grade >= 1.0 GPA)
     */
    @Query("SELECT COALESCE(SUM(c.credits), 0) FROM Enrollment e " +
           "JOIN e.courseOffering co JOIN co.course c " +
           "WHERE e.student.id = :studentId AND e.status = 'COMPLETED' AND e.gpaValue >= 1.0")
    Integer countCompletedCredits(@Param("studentId") Long studentId);

    /**
     * Find enrollments for a specific semester and year
     */
    @Query("SELECT e FROM Enrollment e WHERE e.courseOffering.semester = :semester " +
           "AND e.courseOffering.academicYear = :year")
    List<Enrollment> findBySemesterAndYear(@Param("semester") String semester, 
                                            @Param("year") Integer year);

    /**
     * Find in-progress enrollments for a student
     */
    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.status = 'IN_PROGRESS'")
    List<Enrollment> findInProgressByStudent(@Param("studentId") Long studentId);
}
