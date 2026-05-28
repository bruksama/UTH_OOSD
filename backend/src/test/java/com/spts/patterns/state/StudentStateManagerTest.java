package com.spts.patterns.state;

import com.spts.entity.Student;
import com.spts.entity.StudentStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for StudentStateManager.
 * Tests state transition thresholds and status determination logic.
 * 
 * @author SPTS Team - Member 3 (Behavioral Engineer)
 */
class StudentStateManagerTest {

    private StudentStateManager stateManager;
    private NormalState normalState;
    private AtRiskState atRiskState;
    private ProbationState probationState;
    private GraduatedState graduatedState;

    @BeforeEach
    void setUp() {
        normalState = new NormalState();
        atRiskState = new AtRiskState();
        probationState = new ProbationState();
        graduatedState = new GraduatedState();
        stateManager = new StudentStateManager(normalState, atRiskState, probationState, graduatedState);
    }

    @Nested
    @DisplayName("determineStatusFromGpa Tests")
    class DetermineStatusFromGpaTests {

        @Test
        @DisplayName("GPA >= 2.0 should return NORMAL status")
        void gpaAtOrAboveNormalThreshold_ReturnsNormal() {
            assertEquals(StudentStatus.NORMAL, stateManager.determineStatusFromGpa(2.0));
            assertEquals(StudentStatus.NORMAL, stateManager.determineStatusFromGpa(2.5));
            assertEquals(StudentStatus.NORMAL, stateManager.determineStatusFromGpa(3.0));
            assertEquals(StudentStatus.NORMAL, stateManager.determineStatusFromGpa(4.0));
        }

        @Test
        @DisplayName("1.5 <= GPA < 2.0 should return AT_RISK status")
        void gpaBetweenAtRiskAndNormal_ReturnsAtRisk() {
            assertEquals(StudentStatus.AT_RISK, stateManager.determineStatusFromGpa(1.5));
            assertEquals(StudentStatus.AT_RISK, stateManager.determineStatusFromGpa(1.7));
            assertEquals(StudentStatus.AT_RISK, stateManager.determineStatusFromGpa(1.99));
        }

        @Test
        @DisplayName("GPA < 1.5 should return PROBATION status")
        void gpaBelowAtRiskThreshold_ReturnsProbation() {
            assertEquals(StudentStatus.PROBATION, stateManager.determineStatusFromGpa(1.49));
            assertEquals(StudentStatus.PROBATION, stateManager.determineStatusFromGpa(1.0));
            assertEquals(StudentStatus.PROBATION, stateManager.determineStatusFromGpa(0.0));
        }

        @Test
        @DisplayName("Null GPA should return NORMAL status (default for new students)")
        void nullGpa_ReturnsNormal() {
            assertEquals(StudentStatus.NORMAL, stateManager.determineStatusFromGpa(null));
        }
    }

    @Nested
    @DisplayName("getStateForStatus Tests")
    class GetStateForStatusTests {

        @Test
        @DisplayName("Should return correct state for each status")
        void returnsCorrectStateForEachStatus() {
            assertInstanceOf(NormalState.class, stateManager.getStateForStatus(StudentStatus.NORMAL));
            assertInstanceOf(AtRiskState.class, stateManager.getStateForStatus(StudentStatus.AT_RISK));
            assertInstanceOf(ProbationState.class, stateManager.getStateForStatus(StudentStatus.PROBATION));
            assertInstanceOf(GraduatedState.class, stateManager.getStateForStatus(StudentStatus.GRADUATED));
        }
    }

    @Nested
    @DisplayName("handleStateTransition Tests")
    class HandleStateTransitionTests {

        @Test
        @DisplayName("Should transition from NORMAL to AT_RISK when GPA drops below 2.0")
        void normalToAtRisk_WhenGpaDrops() {
            Student student = createStudentWithStatus(StudentStatus.NORMAL);
            
            StudentStatus newStatus = stateManager.handleStateTransition(student, 1.8);
            
            assertEquals(StudentStatus.AT_RISK, newStatus);
        }

        @Test
        @DisplayName("Should transition from NORMAL to PROBATION when GPA drops below 1.5")
        void normalToProbation_WhenGpaDropsSeverely() {
            Student student = createStudentWithStatus(StudentStatus.NORMAL);
            
            StudentStatus newStatus = stateManager.handleStateTransition(student, 1.2);
            
            assertEquals(StudentStatus.PROBATION, newStatus);
        }

        @Test
        @DisplayName("Should transition from AT_RISK to NORMAL when GPA improves to 2.0+")
        void atRiskToNormal_WhenGpaImproves() {
            Student student = createStudentWithStatus(StudentStatus.AT_RISK);
            
            StudentStatus newStatus = stateManager.handleStateTransition(student, 2.5);
            
            assertEquals(StudentStatus.NORMAL, newStatus);
        }

        @Test
        @DisplayName("Should transition from PROBATION to NORMAL when GPA improves to 2.0+")
        void probationToNormal_WhenGpaImproves() {
            Student student = createStudentWithStatus(StudentStatus.PROBATION);
            
            StudentStatus newStatus = stateManager.handleStateTransition(student, 2.0);
            
            assertEquals(StudentStatus.NORMAL, newStatus);
        }

        @Test
        @DisplayName("Should remain in same status when GPA stays in range")
        void remainsInSameStatus_WhenGpaStaysInRange() {
            Student student = createStudentWithStatus(StudentStatus.NORMAL);
            
            StudentStatus newStatus = stateManager.handleStateTransition(student, 3.5);
            
            assertEquals(StudentStatus.NORMAL, newStatus);
        }
    }

    @Nested
    @DisplayName("Helper Methods Tests")
    class HelperMethodsTests {

        @Test
        @DisplayName("canRegisterCourses should return correct values")
        void canRegisterCourses_ReturnsCorrectValues() {
            assertTrue(stateManager.canRegisterCourses(StudentStatus.NORMAL));
            assertTrue(stateManager.canRegisterCourses(StudentStatus.AT_RISK));
            assertTrue(stateManager.canRegisterCourses(StudentStatus.PROBATION));
            assertFalse(stateManager.canRegisterCourses(StudentStatus.GRADUATED));
        }

        @Test
        @DisplayName("requiresCounseling should return correct values")
        void requiresCounseling_ReturnsCorrectValues() {
            assertFalse(stateManager.requiresCounseling(StudentStatus.NORMAL));
            assertTrue(stateManager.requiresCounseling(StudentStatus.AT_RISK));
            assertTrue(stateManager.requiresCounseling(StudentStatus.PROBATION));
            assertFalse(stateManager.requiresCounseling(StudentStatus.GRADUATED));
        }

        @Test
        @DisplayName("getMaxCreditHours should return correct values")
        void getMaxCreditHours_ReturnsCorrectValues() {
            assertEquals(18, stateManager.getMaxCreditHours(StudentStatus.NORMAL));
            assertEquals(15, stateManager.getMaxCreditHours(StudentStatus.AT_RISK));
            assertEquals(12, stateManager.getMaxCreditHours(StudentStatus.PROBATION));
            assertEquals(0, stateManager.getMaxCreditHours(StudentStatus.GRADUATED));
        }
    }

    // Helper method to create a student with specific status
    private Student createStudentWithStatus(StudentStatus status) {
        Student student = new Student();
        student.setStudentId("TEST001");
        student.setFirstName("Test");
        student.setLastName("Student");
        student.setStatus(status);
        return student;
    }
}
