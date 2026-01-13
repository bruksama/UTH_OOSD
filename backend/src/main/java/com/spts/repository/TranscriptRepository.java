package com.spts.repository;

import com.spts.entity.Transcript;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Transcript entity.
 * 
 * @author SPTS Team
 */
@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, Long> {

    /**
     * Find transcript by student ID
     */
    Optional<Transcript> findByStudentId(Long studentId);

    /**
     * Check if transcript exists for student
     */
    boolean existsByStudentId(Long studentId);
}
