package com.spts.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for GradeEntry Composite Pattern functionality.
 * Tests hierarchical grade structure and recursive calculations.
 * 
 * @author Member2 - Logic Engineer
 */
class GradeEntryCompositeTest {

    private GradeEntry rootEntry;
    private GradeEntry midterm;
    private GradeEntry finalExam;
    private GradeEntry lab; // Composite node
    private GradeEntry quiz1;
    private GradeEntry quiz2;
    private GradeEntry assignment;

    @BeforeEach
    void setUp() {
        // Create a mock enrollment (we only need it for the entity, not for logic
        // tests)
        // For unit tests, we'll test the Composite methods directly

        // Root entries (no parent)
        midterm = new GradeEntry();
        midterm.setName("Midterm");
        midterm.setWeight(0.3);
        midterm.setScore(8.0);

        finalExam = new GradeEntry();
        finalExam.setName("Final");
        finalExam.setWeight(0.4);
        finalExam.setScore(7.0);

        // Lab is a composite (has children)
        lab = new GradeEntry();
        lab.setName("Lab");
        lab.setWeight(0.3);
        // lab.score is null - calculated from children

        // Children of Lab
        quiz1 = new GradeEntry();
        quiz1.setName("Quiz1");
        quiz1.setWeight(0.4);
        quiz1.setScore(9.0);

        quiz2 = new GradeEntry();
        quiz2.setName("Quiz2");
        quiz2.setWeight(0.3);
        quiz2.setScore(8.5);

        assignment = new GradeEntry();
        assignment.setName("Assignment");
        assignment.setWeight(0.3);
        assignment.setScore(8.0);

        // Build composite structure
        lab.addChild(quiz1);
        lab.addChild(quiz2);
        lab.addChild(assignment);
    }

    // ==================== isLeaf Tests ====================

    @Test
    @DisplayName("Should return true for leaf node (no children)")
    void testIsLeafTrue() {
        assertTrue(midterm.isLeaf());
        assertTrue(quiz1.isLeaf());
        assertTrue(quiz2.isLeaf());
        assertTrue(assignment.isLeaf());
    }

    @Test
    @DisplayName("Should return false for composite node (has children)")
    void testIsLeafFalse() {
        assertFalse(lab.isLeaf());
    }

    // ==================== isRoot Tests ====================

    @Test
    @DisplayName("Should return true for root node (no parent)")
    void testIsRootTrue() {
        assertTrue(midterm.isRoot());
        assertTrue(finalExam.isRoot());
        assertTrue(lab.isRoot());
    }

    @Test
    @DisplayName("Should return false for child node (has parent)")
    void testIsRootFalse() {
        assertFalse(quiz1.isRoot());
        assertFalse(quiz2.isRoot());
        assertFalse(assignment.isRoot());
    }

    // ==================== addChild Tests ====================

    @Test
    @DisplayName("Should add child and set parent reference")
    void testAddChild() {
        GradeEntry parent = new GradeEntry();
        parent.setName("Parent");
        parent.setWeight(1.0);

        GradeEntry child = new GradeEntry();
        child.setName("Child");
        child.setWeight(0.5);
        child.setScore(8.0);

        parent.addChild(child);

        assertEquals(1, parent.getChildren().size());
        assertEquals(parent, child.getParent());
        assertFalse(parent.isLeaf());
    }

    // ==================== removeChild Tests ====================

    @Test
    @DisplayName("Should remove child and clear parent reference")
    void testRemoveChild() {
        assertEquals(3, lab.getChildren().size());

        lab.removeChild(quiz1);

        assertEquals(2, lab.getChildren().size());
        assertNull(quiz1.getParent());
    }

    // ==================== getCalculatedScore Tests ====================

    @Test
    @DisplayName("Should return direct score for leaf node")
    void testGetCalculatedScoreLeaf() {
        assertEquals(8.0, midterm.getCalculatedScore());
        assertEquals(9.0, quiz1.getCalculatedScore());
    }

    @Test
    @DisplayName("Should calculate weighted average from children for composite")
    void testGetCalculatedScoreComposite() {
        // Lab score = (9.0 * 0.4 + 8.5 * 0.3 + 8.0 * 0.3) / (0.4 + 0.3 + 0.3)
        // = (3.6 + 2.55 + 2.4) / 1.0 = 8.55
        Double expected = 8.55;
        assertEquals(expected, lab.getCalculatedScore(), 0.01);
    }

    @Test
    @DisplayName("Should return null for composite with no scores")
    void testGetCalculatedScoreNoScores() {
        GradeEntry emptyComposite = new GradeEntry();
        emptyComposite.setName("Empty");
        emptyComposite.setWeight(1.0);

        GradeEntry childNoScore = new GradeEntry();
        childNoScore.setName("NoScore");
        childNoScore.setWeight(1.0);
        childNoScore.setScore(null);

        emptyComposite.addChild(childNoScore);

        assertNull(emptyComposite.getCalculatedScore());
    }

    // ==================== calculateWeightedScore Tests ====================

    @Test
    @DisplayName("Should calculate weighted score for leaf (score * weight)")
    void testCalculateWeightedScoreLeaf() {
        // midterm: 8.0 * 0.3 = 2.4
        assertEquals(2.4, midterm.calculateWeightedScore(), 0.01);
    }

    @Test
    @DisplayName("Should calculate weighted score for composite from children")
    void testCalculateWeightedScoreComposite() {
        // Lab calculated score = 8.55
        // Lab weighted score = 8.55 * 0.3 = 2.565
        assertEquals(2.565, lab.calculateWeightedScore(), 0.01);
    }

    @Test
    @DisplayName("Should return null for null score on leaf")
    void testCalculateWeightedScoreNull() {
        GradeEntry noScore = new GradeEntry();
        noScore.setWeight(0.5);
        noScore.setScore(null);

        assertNull(noScore.calculateWeightedScore());
    }

    // ==================== Nested Composite Tests ====================

    @Test
    @DisplayName("Should handle multi-level composite correctly")
    void testMultiLevelComposite() {
        // Create deeper nesting
        GradeEntry chapter1 = new GradeEntry();
        chapter1.setName("Chapter1");
        chapter1.setWeight(0.5);
        chapter1.setScore(9.0);

        GradeEntry chapter2 = new GradeEntry();
        chapter2.setName("Chapter2");
        chapter2.setWeight(0.5);
        chapter2.setScore(7.0);

        GradeEntry reading = new GradeEntry();
        reading.setName("Reading");
        reading.setWeight(0.5);
        reading.addChild(chapter1);
        reading.addChild(chapter2);

        // Reading score = (9.0 * 0.5 + 7.0 * 0.5) / 1.0 = 8.0
        assertEquals(8.0, reading.getCalculatedScore(), 0.01);

        GradeEntry homework = new GradeEntry();
        homework.setName("Homework");
        homework.setWeight(0.5);
        homework.setScore(8.5);

        GradeEntry assignment2 = new GradeEntry();
        assignment2.setName("Assignment");
        assignment2.setWeight(1.0);
        assignment2.addChild(reading);
        assignment2.addChild(homework);

        // Assignment score = (8.0 * 0.5 + 8.5 * 0.5) / 1.0 = 8.25
        assertEquals(8.25, assignment2.getCalculatedScore(), 0.01);
    }

    // ==================== Validation Tests ====================

    @Test
    @DisplayName("Should throw exception for out of range score")
    void testScoreValidation() {
        GradeEntry entry = new GradeEntry();
        assertThrows(IllegalArgumentException.class, () -> entry.setScore(11.0));
        assertThrows(IllegalArgumentException.class, () -> entry.setScore(-1.0));
    }

    @Test
    @DisplayName("Should throw exception for out of range weight")
    void testWeightValidation() {
        GradeEntry entry = new GradeEntry();
        assertThrows(IllegalArgumentException.class, () -> entry.setWeight(1.5));
        assertThrows(IllegalArgumentException.class, () -> entry.setWeight(-0.1));
    }

    @Test
    @DisplayName("Should accept valid score and weight")
    void testValidScoreAndWeight() {
        GradeEntry entry = new GradeEntry();
        assertDoesNotThrow(() -> entry.setScore(0.0));
        assertDoesNotThrow(() -> entry.setScore(10.0));
        assertDoesNotThrow(() -> entry.setWeight(0.0));
        assertDoesNotThrow(() -> entry.setWeight(1.0));
    }
}
