package com.spts.repository;

import com.spts.entity.Course;
import com.spts.entity.GradingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Course entity.
 * 
 * @author SPTS Team
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    /**
     * Find course by course code
     */
    Optional<Course> findByCourseCode(String courseCode);

    /**
     * Check if course code exists
     */
    boolean existsByCourseCode(String courseCode);

    /**
     * Find courses by department
     */
    List<Course> findByDepartment(String department);

    /**
     * Find courses by grading type
     */
    List<Course> findByGradingType(GradingType gradingType);

    /**
     * Search courses by name (case-insensitive)
     */
    @Query("SELECT c FROM Course c WHERE LOWER(c.courseName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Course> searchByName(@Param("name") String name);

    /**
     * Find courses by credit range
     */
    @Query("SELECT c FROM Course c WHERE c.credits >= :minCredits AND c.credits <= :maxCredits")
    List<Course> findByCreditRange(@Param("minCredits") Integer minCredits, 
                                    @Param("maxCredits") Integer maxCredits);
}
