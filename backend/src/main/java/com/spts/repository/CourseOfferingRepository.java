package com.spts.repository;

import com.spts.entity.CourseOffering;
import com.spts.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for CourseOffering entity.
 * 
 * @author SPTS Team
 */
@Repository
public interface CourseOfferingRepository extends JpaRepository<CourseOffering, Long> {

    /**
     * Find offerings by course ID
     */
    List<CourseOffering> findByCourseId(Long courseId);

    /**
     * Find offerings by semester and year
     */
    List<CourseOffering> findBySemesterAndAcademicYear(Semester semester, Integer academicYear);

    /**
     * Find offering by course, semester, and year
     */
    Optional<CourseOffering> findByCourseIdAndSemesterAndAcademicYear(
            Long courseId, Semester semester, Integer academicYear);

    /**
     * Find offerings by instructor
     */
    List<CourseOffering> findByInstructor(String instructor);

    /**
     * Find offerings with available seats
     */
    @Query("SELECT co FROM CourseOffering co WHERE co.currentEnrollment < co.maxEnrollment")
    List<CourseOffering> findOfferingsWithAvailableSeats();

    /**
     * Find offerings by academic year
     */
    List<CourseOffering> findByAcademicYear(Integer academicYear);

    /**
     * Find current semester offerings
     */
    @Query("SELECT co FROM CourseOffering co WHERE co.semester = :semester AND co.academicYear = :year")
    List<CourseOffering> findCurrentOfferings(@Param("semester") Semester semester, 
                                               @Param("year") Integer year);
}
