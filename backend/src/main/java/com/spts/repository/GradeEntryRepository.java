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
 * 
 * @author SPTS Team
 */
@Repository
public interface GradeEntryRepository extends JpaRepository<GradeEntry, Long> {

    /**
     * Find grade entries by transcript ID
     */
    List<GradeEntry> findByTranscriptId(Long transcriptId);

    /**
     * Find grade entries by course offering ID
     */
    List<GradeEntry> findByCourseOfferingId(Long courseOfferingId);

    /**
     * Find grade entries by type
     */
    List<GradeEntry> findByEntryType(GradeEntryType entryType);

    /**
     * Find grade entries for a student in a specific course offering
     */
    @Query("SELECT ge FROM GradeEntry ge WHERE ge.transcript.student.id = :studentId " +
           "AND ge.courseOffering.id = :courseOfferingId")
    List<GradeEntry> findByStudentAndCourseOffering(
            @Param("studentId") Long studentId,
            @Param("courseOfferingId") Long courseOfferingId);

    /**
     * Find final grades for a transcript
     */
    @Query("SELECT ge FROM GradeEntry ge WHERE ge.transcript.id = :transcriptId " +
           "AND ge.entryType = 'FINAL'")
    List<GradeEntry> findFinalGradesByTranscript(@Param("transcriptId") Long transcriptId);

    /**
     * Calculate average grade for a course offering
     */
    @Query("SELECT AVG(ge.value) FROM GradeEntry ge WHERE ge.courseOffering.id = :courseOfferingId " +
           "AND ge.entryType = 'FINAL'")
    Double calculateAverageGrade(@Param("courseOfferingId") Long courseOfferingId);
}
