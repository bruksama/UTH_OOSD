package com.spts.repository;

import com.spts.entity.GradeEntry;
import com.spts.entity.GradeEntryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for GradeEntry entity.
 * Supports Composite Pattern queries.
 * 
 * @author SPTS Team
 */
@Repository
public interface GradeEntryRepository extends JpaRepository<GradeEntry, Long> {

    /**
     * Find grade entries by enrollment ID
     */
    List<GradeEntry> findByEnrollmentId(Long enrollmentId);

    /**
     * Find root grade entries (no parent) by enrollment
     */
    List<GradeEntry> findByEnrollmentIdAndParentIsNull(Long enrollmentId);

    /**
     * Find child grade entries by parent ID
     */
    List<GradeEntry> findByParentId(Long parentId);

    /**
     * Find grade entries by type
     */
    List<GradeEntry> findByEntryType(GradeEntryType entryType);

    /**
     * Find grade entries by enrollment and type
     */
    List<GradeEntry> findByEnrollmentIdAndEntryType(Long enrollmentId, GradeEntryType entryType);

    /**
     * Find grade entries for a student across all enrollments
     */
    @Query("SELECT ge FROM GradeEntry ge WHERE ge.enrollment.student.id = :studentId")
    List<GradeEntry> findByStudentId(@Param("studentId") Long studentId);

    /**
     * Find grade entries for a student in a specific course offering
     */
    @Query("SELECT ge FROM GradeEntry ge WHERE ge.enrollment.student.id = :studentId " +
           "AND ge.enrollment.courseOffering.id = :courseOfferingId")
    List<GradeEntry> findByStudentAndCourseOffering(
            @Param("studentId") Long studentId,
            @Param("courseOfferingId") Long courseOfferingId);

    /**
     * Find final grades for an enrollment
     */
    @Query("SELECT ge FROM GradeEntry ge WHERE ge.enrollment.id = :enrollmentId " +
           "AND ge.entryType = 'FINAL'")
    List<GradeEntry> findFinalGradesByEnrollment(@Param("enrollmentId") Long enrollmentId);

    /**
     * Calculate average score for an enrollment's root components
     */
    @Query("SELECT AVG(ge.score) FROM GradeEntry ge WHERE ge.enrollment.id = :enrollmentId " +
           "AND ge.parent IS NULL AND ge.score IS NOT NULL")
    Double calculateAverageScore(@Param("enrollmentId") Long enrollmentId);

    /**
     * Find all leaf entries (entries without children)
     */
    @Query("SELECT ge FROM GradeEntry ge WHERE ge.enrollment.id = :enrollmentId " +
           "AND NOT EXISTS (SELECT child FROM GradeEntry child WHERE child.parent = ge)")
    List<GradeEntry> findLeafEntries(@Param("enrollmentId") Long enrollmentId);

    /**
     * Count grade entries for an enrollment
     */
    Long countByEnrollmentId(Long enrollmentId);
}
