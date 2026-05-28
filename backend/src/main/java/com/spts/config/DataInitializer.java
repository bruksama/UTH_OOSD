package com.spts.config;

import com.spts.entity.*;
import com.spts.repository.*;
import com.spts.entity.ApprovalStatus;
import com.spts.entity.GradingType;
import com.spts.entity.Semester;
import com.spts.entity.StudentStatus;
import com.spts.entity.EnrollmentStatus;
import com.spts.entity.AlertLevel;
import com.spts.entity.AlertType;
import com.spts.entity.GradeEntryType;

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
        if (studentRepository.count() > 0) {
            System.out.println("DataInitializer: Data directory already indexed. Skipping seeding.");
            return;
        }

        System.out.println("DataInitializer: Generating High-Engagement Test Dataset...");

        // ==================== 1. DEPARTMENTS & COURSES ====================
        // Computer Science
        Course cs1 = createCourse("CS101", "Introduction to Computing", "Basics of hardware and software.", 3, "Computer Science", ApprovalStatus.APPROVED);
        Course cs2 = createCourse("CS202", "Data Structures", "Advanced Algorithms and complexity.", 4, "Computer Science", ApprovalStatus.APPROVED);
        Course cs3 = createCourse("CS301", "Operating Systems", "Kernel, memory and process management.", 4, "Computer Science", ApprovalStatus.APPROVED);
        Course cs4 = createCourse("CS401", "Database Systems", "SQL, NoSQL and data modeling.", 3, "Computer Science", ApprovalStatus.APPROVED);
        
        // Software Engineering
        Course se1 = createCourse("SE101", "Design Patterns", "Clean Code & SOLID principles.", 3, "Software Engineering", ApprovalStatus.APPROVED);
        Course se2 = createCourse("SE102", "Requirement Engineering", "Managing software lifecycle.", 3, "Software Engineering", ApprovalStatus.APPROVED);
        Course se3 = createCourse("SE301", "Full-Stack Web Dev", "React, Node and Modern Web.", 4, "Software Engineering", ApprovalStatus.APPROVED);
        Course se4 = createCourse("SE402", "Mobile Application", "Android and Flutter development.", 4, "Software Engineering", ApprovalStatus.APPROVED);

        // Artificial Intelligence
        Course ai1 = createCourse("AI101", "Neural Networks", "Deep Learning Base.", 4, "Artificial Intelligence", ApprovalStatus.APPROVED);
        Course ai2 = createCourse("AI102", "Machine Learning", "Supervised and Unsupervised.", 4, "Artificial Intelligence", ApprovalStatus.APPROVED);
        Course ai3 = createCourse("AI201", "Natural Language", "NLP and LLM fundamentals.", 4, "Artificial Intelligence", ApprovalStatus.APPROVED);
        Course ai4 = createCourse("AI301", "Computer Vision", "Image processing and CNN.", 4, "Artificial Intelligence", ApprovalStatus.APPROVED);

        // Physics
        Course ph1 = createCourse("PHY101", "General Physics 1", "Mechanics and Thermodynamics.", 3, "Physics", ApprovalStatus.APPROVED);
        Course ph2 = createCourse("PHY102", "Electromagnetism", "Electricity and Magnetism.", 3, "Physics", ApprovalStatus.APPROVED);
        Course ph3 = createCourse("PHY301", "Quantum Mechanics", "Particles and Wave functions.", 4, "Physics", ApprovalStatus.APPROVED);

        // Management
        Course mn1 = createCourse("MAN101", "Org Behavior", "Human behavior in organizations.", 3, "Management", ApprovalStatus.APPROVED);
        Course mn2 = createCourse("MAN301", "Strategic Management", "Corporate planning and growth.", 4, "Management", ApprovalStatus.APPROVED);
        Course mn3 = createCourse("MAN4438", "IT Management", "Core management for IT projects.", 4, "Management", ApprovalStatus.APPROVED);

        // Pending/Rejected Proposals (For Admin Testing)
        createCourse("WEB404", "Quantum Computing", "Future of Compute", 5, "Experimental", ApprovalStatus.PENDING, "dr.weird@lab.edu");
        createCourse("FAIL101", "Underwater Basket Weaving", "No credits", 1, "Arts", ApprovalStatus.REJECTED, "lazy.pro@edu.vn");

        // ==================== 2. COURSE OFFERINGS (SPRING 2026) ====================
        // Core offerings
        CourseOffering o1 = createOffering(ph1, Semester.SPRING, 2026, null, 60);
        CourseOffering o2 = createOffering(mn3, Semester.SPRING, 2026, null, 40);
        CourseOffering o3 = createOffering(cs2, Semester.SPRING, 2026, null, 50);
        CourseOffering o4 = createOffering(se1, Semester.SPRING, 2026, null, 45);
        CourseOffering o5 = createOffering(ai1, Semester.SPRING, 2026, null, 35);
        
        // Secondary offerings
        CourseOffering o6 = createOffering(cs1, Semester.SPRING, 2026, "Dr. Banner", 80);
        CourseOffering o7 = createOffering(se3, Semester.SPRING, 2026, "Prof. Stark", 40);
        CourseOffering o8 = createOffering(ai2, Semester.SPRING, 2026, "Dr. Strange", 30);
        CourseOffering o9 = createOffering(ph2, Semester.SPRING, 2026, "Dr. Newton", 50);
        CourseOffering o10 = createOffering(mn2, Semester.SPRING, 2026, "Prof. Buffet", 45);

        // Additional offerings for previously missing courses
        CourseOffering o11 = createOffering(cs3, Semester.SPRING, 2026, "Prof. Xavier", 45);
        CourseOffering o12 = createOffering(cs4, Semester.SPRING, 2026, "Dr. Turing", 50);
        CourseOffering o13 = createOffering(se2, Semester.SPRING, 2026, "Prof. Pressman", 40);
        CourseOffering o14 = createOffering(se4, Semester.SPRING, 2026, "Eng. Jobs", 35);
        CourseOffering o15 = createOffering(ai3, Semester.SPRING, 2026, "Dr. Hinton", 30);
        CourseOffering o16 = createOffering(ai4, Semester.SPRING, 2026, "Prof. LeCun", 30);
        CourseOffering o17 = createOffering(ph3, Semester.SPRING, 2026, "Dr. Einstein", 25);
        CourseOffering o18 = createOffering(mn1, Semester.SPRING, 2026, "Dr. Drucker", 45);

        // ==================== 3. STUDENTS (VIETNAMESE LOCALIZED) ====================
        Student s1 = createStudent("IT202301", "Nguyễn", "Thị Mai", "mai.nt@student.uth.edu.vn", 3.95, StudentStatus.NORMAL, 2005, 12, 1);
        Student s2 = createStudent("IT202302", "Trần", "Văn Nam", "nam.tv@student.uth.edu.vn", 3.82, StudentStatus.NORMAL, 2004, 5, 20);
        Student s3 = createStudent("IT202303", "Alice", "Wonderland", "alice.w@univ.edu", 3.90, StudentStatus.NORMAL, 2005, 3, 15);
        Student s4 = createStudent("IT202304", "Lê", "Hoàng Long", "long.lh@student.uth.edu.vn", 2.50, StudentStatus.NORMAL, 2005, 6, 12);
        Student s5 = createStudent("IT202305", "Phạm", "Thanh Thảo", "thao.pt@student.uth.edu.vn", 2.75, StudentStatus.NORMAL, 2003, 8, 30);
        Student s6 = createStudent("IT202410", "Hoàng", "Minh Tuấn", "tuan.hm@student.uth.edu.vn", 1.85, StudentStatus.AT_RISK, 2006, 1, 10);
        Student s7 = createStudent("IT202411", "Đặng", "Văn Hậu", "hau.dv@student.uth.edu.vn", 1.25, StudentStatus.PROBATION, 2005, 11, 2);

        // Batch students
        String[] firstNames = {"Anh", "Bình", "Cường", "Dung", "Em", "Gia", "Hòa", "Khánh", "Linh", "Minh", "Nghĩa", "Oanh", "Phúc", "Quang", "Sơn"};
        String[] lastNames = {"Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương"};
        
        for(int i = 0; i < 15; i++) {
            createStudent("GEN2025" + String.format("%02d", i+1), lastNames[i], firstNames[i], 
                    "student." + (i+1) + "@uth.edu.vn", 
                    2.0 + (Math.random() * 1.8), StudentStatus.NORMAL, 2004 + (i%2), (i%12)+1, (i%28)+1);
        }

        // ==================== 4. ENROLLMENTS & GRADES ====================
        Enrollment e1 = createEnrollment(s1, o1, EnrollmentStatus.COMPLETED, 9.5);
        createGradeEntry(e1, "Baitap 1", 0.2, 10.0);
        createGradeEntry(e1, "Giua ky", 0.4, 9.0);
        createGradeEntry(e1, "Cuoi ky", 0.4, 9.5);
        
        createEnrollment(s1, o3, EnrollmentStatus.IN_PROGRESS, null);
        createEnrollment(s6, o1, EnrollmentStatus.COMPLETED, 4.5);

        // Fully engage all students in the new course offerings
        CourseOffering[] allOfferings = {o1, o2, o3, o4, o5, o6, o7, o8, o9, o10, o11, o12, o13, o14, o15, o16, o17, o18};
        var allStudents = studentRepository.findAll();
        for(int i = 0; i < allStudents.size(); i++) {
             Student st = allStudents.get(i);
             // Enroll each student in 3-4 different courses based on their index
             for(int j = 0; j < 4; j++) {
                 int offeringIdx = (i + j * 3) % allOfferings.length;
                 // Avoid duplicate enrollments for s1 and s6 who already have manual ones
                 if ((i == 0 && (offeringIdx == 0 || offeringIdx == 2)) || (i == 5 && offeringIdx == 0)) continue;
                 // 70% chance to be COMPLETED with a grade, 30% IN_PROGRESS
                 if (Math.random() > 0.3) {
                     double score = 5.0 + (Math.random() * 4.5); // Random score 5.0 - 9.5
                     // Round to 1 decimal
                     score = Math.round(score * 10.0) / 10.0;
                     createEnrollment(st, allOfferings[offeringIdx], EnrollmentStatus.COMPLETED, score);
                 } else {
                     createEnrollment(st, allOfferings[offeringIdx], EnrollmentStatus.IN_PROGRESS, null);
                 }
             }
        }

        // ==================== 5. ALERTS (HIERARCHY) ====================
        createAlert(s6, AlertLevel.CRITICAL, AlertType.PROBATION, "CRITICAL: Student on final probation. Dismissal pending next GPA drop.");
        createAlert(s5, AlertLevel.HIGH, AlertType.LOW_GPA, "WARNING: GPA below 2.0. Mandatory advising scheduled.");
        createAlert(s3, AlertLevel.WARNING, AlertType.GPA_DROP, "NOTICE: 0.5 GPA drop detected since last semester.");
        createAlert(s1, AlertLevel.INFO, AlertType.IMPROVEMENT, "ACHIEVEMENT: Top 1% of Computer Science faculty.");

        System.out.println("DataInitializer: High-Engagement Dataset Seeding Complete!");
        System.out.println(">> Indexing Summary:");
        System.out.println("   - Managed Records: " + studentRepository.count() + " Students");
        System.out.println("   - Catalog Assets: " + courseRepository.count() + " Courses");
        System.out.println("   - Active Offerings: " + courseOfferingRepository.count());
    }

    // ==================== Helper Methods ====================

    private Student createStudent(String studentId, String fName, String lName, String email, Double gpa, StudentStatus status, int y, int m, int d) {
        Student student = new Student();
        student.setStudentId(studentId);
        student.setFirstName(fName);
        student.setLastName(lName);
        student.setEmail(email);
        student.setGpa(gpa);
        student.setStatus(status);
        student.setDateOfBirth(LocalDate.of(y, m, d));
        student.setEnrollmentDate(LocalDate.now().minusYears(1));
        student.setTotalCredits(30 + (int)(Math.random() * 60));
        return studentRepository.save(student);
    }

    private Course createCourse(String code, String name, String desc, int credits, String dept, ApprovalStatus status) {
        return createCourse(code, name, desc, credits, dept, status, "admin@university.edu");
    }

    private Course createCourse(String code, String name, String desc, int credits, String dept, ApprovalStatus status, String creator) {
        Course course = new Course();
        course.setCourseCode(code);
        course.setCourseName(name);
        course.setDescription(desc);
        course.setCredits(credits);
        course.setDepartment(dept);
        course.setStatus(status);
        course.setCreatorEmail(creator);
        course.setGradingType(GradingType.SCALE_10);
        return courseRepository.save(course);
    }

    private CourseOffering createOffering(Course c, Semester s, int y, String inst, int max) {
        CourseOffering o = new CourseOffering();
        o.setCourse(c);
        o.setSemester(s);
        o.setAcademicYear(y);
        o.setInstructor(inst);
        o.setMaxEnrollment(max);
        o.setCurrentEnrollment(0);
        o.setGradingScale("SCALE_10");
        return courseOfferingRepository.save(o);
    }

    private Enrollment createEnrollment(Student s, CourseOffering o, EnrollmentStatus status, Double score) {
        Enrollment e = new Enrollment();
        e.setStudent(s);
        e.setCourseOffering(o);
        e.setStatus(status);
        e.setEnrolledAt(LocalDateTime.now().minusDays(30));
        if (score != null) {
            e.setFinalScore(score);
            e.setCompletedAt(LocalDateTime.now().minusDays(5));
        }
        o.setCurrentEnrollment(o.getCurrentEnrollment() + 1);
        courseOfferingRepository.save(o);
        return enrollmentRepository.save(e);
    }

    private void createGradeEntry(Enrollment e, String name, Double weight, Double score) {
        GradeEntry entry = new GradeEntry();
        entry.setEnrollment(e);
        entry.setName(name);
        entry.setWeight(weight);
        entry.setScore(score);
        entry.setEntryType(GradeEntryType.COMPONENT);
        entry.setRecordedBy("System_Initialize");
        entry.setRecordedAt(LocalDateTime.now().minusDays(15));
        gradeEntryRepository.save(entry);
    }

    private void createAlert(Student s, AlertLevel lvl, AlertType type, String msg) {
        Alert a = new Alert();
        a.setStudent(s);
        a.setLevel(lvl);
        a.setType(type);
        a.setMessage(msg);
        a.setIsRead(false);
        a.setIsResolved(false);
        a.setCreatedAt(LocalDateTime.now().minusHours(5));
        alertRepository.save(a);
    }
}
