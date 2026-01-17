package com.spts.config;

import com.spts.entity.*;
import com.spts.repository.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data initializer for development profile.
 * Seeds sample data for testing and development purposes.
 * 
 * Seeds: 5 students, 4 courses, 3 offerings, sample enrollments, alerts
 * 
 * @author SPTS Team
 */
@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GradeEntryRepository gradeEntryRepository;
    private final AlertRepository alertRepository;

    public DataInitializer(
            StudentRepository studentRepository,
            CourseRepository courseRepository,
            CourseOfferingRepository courseOfferingRepository,
            EnrollmentRepository enrollmentRepository,
            GradeEntryRepository gradeEntryRepository,
            AlertRepository alertRepository) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.courseOfferingRepository = courseOfferingRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.gradeEntryRepository = gradeEntryRepository;
        this.alertRepository = alertRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Check if data already exists
        if (studentRepository.count() > 0) {
            System.out.println("DataInitializer: Data already exists, skipping seeding.");
            return;
        }

        System.out.println("DataInitializer: Seeding sample data...");

        // ==================== Create Students ====================
        Student s1 = createStudent("STU001", "Nguyen", "Van A", "nguyen.vana@university.edu", 
                3.5, StudentStatus.NORMAL, LocalDate.of(2002, 5, 15));
        Student s2 = createStudent("STU002", "Tran", "Thi B", "tran.thib@university.edu", 
                2.8, StudentStatus.NORMAL, LocalDate.of(2001, 8, 22));
        Student s3 = createStudent("STU003", "Le", "Van C", "le.vanc@university.edu", 
                1.8, StudentStatus.AT_RISK, LocalDate.of(2003, 1, 10));
        Student s4 = createStudent("STU004", "Pham", "Thi D", "pham.thid@university.edu", 
                1.3, StudentStatus.PROBATION, LocalDate.of(2002, 11, 5));
        Student s5 = createStudent("STU005", "Hoang", "Van E", "hoang.vane@university.edu", 
                3.9, StudentStatus.NORMAL, LocalDate.of(2001, 3, 28));

        // ==================== Create Courses ====================
        Course c1 = createCourse("CS101", "Introduction to Programming", 
                "Fundamentals of programming using Java", 3, "Computer Science");
        Course c2 = createCourse("CS201", "Data Structures and Algorithms", 
                "Advanced data structures and algorithm analysis", 4, "Computer Science");
        Course c3 = createCourse("CS301", "Software Engineering", 
                "Software development lifecycle and design patterns", 3, "Computer Science");
        Course c4 = createCourse("MATH101", "Calculus I", 
                "Introduction to differential and integral calculus", 4, "Mathematics");

        // ==================== Create Course Offerings ====================
        CourseOffering o1 = createOffering(c1, Semester.FALL, 2025, "Dr. Nguyen Van Minh", 40);
        CourseOffering o2 = createOffering(c2, Semester.FALL, 2025, "Dr. Tran Thi Lan", 35);
        CourseOffering o3 = createOffering(c3, Semester.FALL, 2025, "Dr. Le Quoc Hung", 30);

        // ==================== Create Enrollments ====================
        // Student 1 - Good student with completed courses
        Enrollment e1 = createEnrollment(s1, o1, EnrollmentStatus.COMPLETED, 8.5);
        Enrollment e2 = createEnrollment(s1, o2, EnrollmentStatus.IN_PROGRESS, null);

        // Student 2 - Average student
        Enrollment e3 = createEnrollment(s2, o1, EnrollmentStatus.COMPLETED, 7.0);
        Enrollment e4 = createEnrollment(s2, o3, EnrollmentStatus.IN_PROGRESS, null);

        // Student 3 - At-risk student
        Enrollment e5 = createEnrollment(s3, o1, EnrollmentStatus.COMPLETED, 5.0);
        Enrollment e6 = createEnrollment(s3, o2, EnrollmentStatus.IN_PROGRESS, null);

        // Student 4 - Probation student
        Enrollment e7 = createEnrollment(s4, o1, EnrollmentStatus.COMPLETED, 4.0);

        // Student 5 - Excellent student
        Enrollment e8 = createEnrollment(s5, o1, EnrollmentStatus.COMPLETED, 9.5);
        Enrollment e9 = createEnrollment(s5, o2, EnrollmentStatus.COMPLETED, 9.0);
        Enrollment e10 = createEnrollment(s5, o3, EnrollmentStatus.IN_PROGRESS, null);

        // ==================== Create Grade Entries ====================
        // Sample grade entries for completed enrollment e1 (Student 1, CS101)
        createGradeEntry(e1, "Midterm", 0.3, 8.0);
        createGradeEntry(e1, "Final Exam", 0.4, 9.0);
        createGradeEntry(e1, "Assignments", 0.3, 8.5);

        // Sample grade entries for Student 5's completed CS201 enrollment
        createGradeEntry(e9, "Midterm", 0.3, 9.0);
        createGradeEntry(e9, "Final Exam", 0.4, 9.5);
        createGradeEntry(e9, "Lab Work", 0.3, 8.5);

        // ==================== Create Alerts ====================
        createAlert(s3, AlertLevel.WARNING, AlertType.LOW_GPA, 
                "GPA has fallen below 2.0. Current GPA: 1.8. Academic intervention recommended.");
        createAlert(s4, AlertLevel.CRITICAL, AlertType.PROBATION, 
                "Student has been placed on academic probation. GPA: 1.3. Immediate advisor meeting required.");
        createAlert(s4, AlertLevel.HIGH, AlertType.LOW_GPA, 
                "GPA is critically low at 1.3. Risk of academic dismissal if not improved.");
        createAlert(s5, AlertLevel.INFO, AlertType.IMPROVEMENT, 
                "Excellent academic performance maintained. GPA: 3.9. Dean's List candidate.");

        System.out.println("DataInitializer: Sample data seeded successfully!");
        System.out.println("  - Students: 5");
        System.out.println("  - Courses: 4");
        System.out.println("  - Course Offerings: 3");
        System.out.println("  - Enrollments: 10");
        System.out.println("  - Grade Entries: 6");
        System.out.println("  - Alerts: 4");
    }

    // ==================== Helper Methods ====================

    private Student createStudent(String studentId, String firstName, String lastName, 
            String email, Double gpa, StudentStatus status, LocalDate dateOfBirth) {
        Student student = new Student();
        student.setStudentId(studentId);
        student.setFirstName(firstName);
        student.setLastName(lastName);
        student.setEmail(email);
        student.setGpa(gpa);
        student.setStatus(status);
        student.setDateOfBirth(dateOfBirth);
        student.setEnrollmentDate(LocalDate.of(2023, 9, 1));
        student.setTotalCredits(0);
        return studentRepository.save(student);
    }

    private Course createCourse(String courseCode, String courseName, String description, 
            Integer credits, String department) {
        Course course = new Course();
        course.setCourseCode(courseCode);
        course.setCourseName(courseName);
        course.setDescription(description);
        course.setCredits(credits);
        course.setDepartment(department);
        course.setGradingType(GradingType.SCALE_10);
        return courseRepository.save(course);
    }

    private CourseOffering createOffering(Course course, Semester semester, Integer year, 
            String instructor, Integer maxEnrollment) {
        CourseOffering offering = new CourseOffering();
        offering.setCourse(course);
        offering.setSemester(semester);
        offering.setAcademicYear(year);
        offering.setInstructor(instructor);
        offering.setMaxEnrollment(maxEnrollment);
        offering.setCurrentEnrollment(0);
        offering.setGradingScale("SCALE_10");
        return courseOfferingRepository.save(offering);
    }

    private Enrollment createEnrollment(Student student, CourseOffering offering, 
            EnrollmentStatus status, Double finalScore) {
        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourseOffering(offering);
        enrollment.setStatus(status);
        enrollment.setEnrolledAt(LocalDateTime.now().minusMonths(3));
        
        if (finalScore != null) {
            enrollment.setFinalScore(finalScore);
            enrollment.setCompletedAt(LocalDateTime.now().minusWeeks(1));
        }
        
        // Update offering's current enrollment count
        offering.setCurrentEnrollment(offering.getCurrentEnrollment() + 1);
        courseOfferingRepository.save(offering);
        
        return enrollmentRepository.save(enrollment);
    }

    private GradeEntry createGradeEntry(Enrollment enrollment, String name, Double weight, Double score) {
        GradeEntry entry = new GradeEntry();
        entry.setEnrollment(enrollment);
        entry.setName(name);
        entry.setWeight(weight);
        entry.setScore(score);
        entry.setEntryType(GradeEntryType.COMPONENT);
        entry.setRecordedBy("System");
        entry.setRecordedAt(LocalDateTime.now().minusWeeks(2));
        return gradeEntryRepository.save(entry);
    }

    private Alert createAlert(Student student, AlertLevel level, AlertType type, String message) {
        Alert alert = new Alert();
        alert.setStudent(student);
        alert.setLevel(level);
        alert.setType(type);
        alert.setMessage(message);
        alert.setIsRead(false);
        alert.setIsResolved(false);
        alert.setCreatedAt(LocalDateTime.now().minusDays(1));
        return alertRepository.save(alert);
    }
}
