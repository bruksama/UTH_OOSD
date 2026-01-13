package com.spts.repository;

import com.spts.entity.Student;
import com.spts.entity.StudentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Student entity.
 * Provides CRUD operations and custom queries.
 * 
 * @author SPTS Team
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    /**
     * Find student by student ID
     */
    Optional<Student> findByStudentId(String studentId);

    /**
     * Find student by email
     */
    Optional<Student> findByEmail(String email);

    /**
     * Check if student ID exists
     */
    boolean existsByStudentId(String studentId);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Find students by status
     */
    List<Student> findByStatus(StudentStatus status);

    /**
     * Find students with GPA below threshold
     */
    @Query("SELECT s FROM Student s WHERE s.gpa < :threshold")
    List<Student> findStudentsWithGpaBelow(@Param("threshold") Double threshold);

    /**
     * Find students at risk (GPA between 1.5 and 2.0)
     */
    @Query("SELECT s FROM Student s WHERE s.gpa >= 1.5 AND s.gpa < 2.0")
    List<Student> findAtRiskStudents();

    /**
     * Find students on probation (GPA below 1.5)
     */
    @Query("SELECT s FROM Student s WHERE s.gpa < 1.5")
    List<Student> findStudentsOnProbation();

    /**
     * Search students by name (case-insensitive)
     */
    @Query("SELECT s FROM Student s WHERE LOWER(s.firstName) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Student> searchByName(@Param("name") String name);
}
