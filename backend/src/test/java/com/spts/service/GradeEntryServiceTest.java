package com.spts.service;

import com.spts.dto.GradeEntryDTO;
import com.spts.entity.Course;
import com.spts.entity.CourseOffering;
import com.spts.entity.Enrollment;
import com.spts.entity.Semester;
import com.spts.entity.Student;
import com.spts.patterns.observer.GradeSubject;
import com.spts.repository.EnrollmentRepository;
import com.spts.repository.GradeEntryRepository;
import com.spts.entity.GradeEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class GradeEntryServiceTest {

    @Mock
    private GradeEntryRepository gradeEntryRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private GradeSubject gradeSubject;

    private GradeEntryService gradeEntryService;
    private Enrollment enrollment;
    private List<GradeEntry> savedEntries;
    private AtomicLong nextGradeEntryId;

    @BeforeEach
    void setUp() {
        gradeEntryService = new GradeEntryService(gradeEntryRepository, enrollmentRepository, gradeSubject);
        enrollment = createEnrollment();
        savedEntries = new ArrayList<>();
        nextGradeEntryId = new AtomicLong(1);

        lenient().when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(enrollment));
        lenient().when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(gradeEntryRepository.findByEnrollmentId(1L)).thenReturn(savedEntries);
        lenient().when(gradeEntryRepository.save(any(GradeEntry.class))).thenAnswer(invocation -> {
            GradeEntry entry = invocation.getArgument(0);
            entry.setId(nextGradeEntryId.getAndIncrement());
            savedEntries.add(entry);
            return entry;
        });
    }

    @Test
    void createGradeEntryAcceptsScoreAtUpperBoundaryAfterExistingEntries() {
        createGradeEntry(5.0, 0.5);
        createGradeEntry(0.0, 0.5);
        createGradeEntry(0.1, 0.5);
        createGradeEntry(9.9, 0.5);

        GradeEntryDTO result = assertDoesNotThrow(() -> createGradeEntry(10.0, 0.5));

        assertEquals(10.0, result.getScore());
        assertEquals(5.0, enrollment.getFinalScore(), 0.001);
    }

    @Test
    void createGradeEntryAcceptsWeightAtUpperBoundaryAfterExistingEntries() {
        createGradeEntry(5.0, 0.5);
        createGradeEntry(0.0, 0.5);
        createGradeEntry(0.1, 0.5);
        createGradeEntry(9.9, 0.5);
        createGradeEntry(10.0, 0.5);
        createGradeEntry(5.0, 0.0);
        createGradeEntry(5.0, 0.01);
        createGradeEntry(5.0, 0.99);

        GradeEntryDTO result = assertDoesNotThrow(() -> createGradeEntry(5.0, 1.0));

        assertEquals(1.0, result.getWeight());
        assertEquals(5.0, enrollment.getFinalScore(), 0.001);
    }

    @Test
    void createGradeEntryClearsStaleEnrollmentGradeWhenTotalWeightIsZero() {
        enrollment.setFinalScore(7.5);
        enrollment.setFinalScore(null);
        enrollment.setLetterGrade("B");
        enrollment.setGpaValue(3.0);

        assertDoesNotThrow(() -> createGradeEntry(5.0, 0.0));

        assertNull(enrollment.getFinalScore());
        assertNull(enrollment.getLetterGrade());
        assertNull(enrollment.getGpaValue());
    }

    private GradeEntryDTO createGradeEntry(Double score, Double weight) {
        GradeEntryDTO dto = new GradeEntryDTO();
        dto.setEnrollmentId(1L);
        dto.setName("Regression " + savedEntries.size());
        dto.setScore(score);
        dto.setWeight(weight);
        dto.setRecordedBy("test");
        return gradeEntryService.createGradeEntry(dto);
    }

    private Enrollment createEnrollment() {
        Student student = new Student("IT999999", "Test", "Student", "test.student@uth.edu.vn");
        student.setId(1L);

        Course course = new Course("TST101", "Regression Testing", 3);
        course.setId(1L);

        CourseOffering offering = new CourseOffering(course, Semester.SPRING, 2026);
        offering.setId(1L);

        Enrollment result = new Enrollment(student, offering);
        result.setId(1L);
        return result;
    }
}
