@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private GradingStrategyFactory strategyFactory; // Inject Factory

    @Autowired
    private GradeEntryService gradeEntryService;

    @Transactional
    public void submitFinalGrade(Long enrollmentId) {
        // 1. Kiểm tra tồn tại
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // 2. Lấy Strategy từ Factory dựa trên cấu hình lớp học
        String scale = enrollment.getCourseOffering().getGradingScale();
        IGradingStrategy strategy = strategyFactory.getStrategy(scale);

        // 3. Lấy danh sách điểm thành phần (Leaf entries)
        // Lưu ý: Logic Composite đệ quy đã nằm trong GradeEntryService
        List<GradeEntry> leafEntries = gradeEntryService.getLeafEntries(enrollmentId);

        List<Double> scores = leafEntries.stream().map(GradeEntry::getScore).toList();
        List<Double> weights = leafEntries.stream().map(GradeEntry::getWeight).toList();

        // 4. Áp dụng Strategy để tính điểm tổng kết
        double finalScore = strategy.calculate(scores, weights);

        // 5. Lưu kết quả (Final Score & GPA)
        enrollment.setFinalScore(finalScore);
        enrollment.setGpaValue(finalScore); // Logic quy đổi cụ thể sẽ tùy thuộc vào Strategy

        enrollmentRepository.save(enrollment);

        // 6. Trigger Observer (Dành cho Member 3)
        // notifyObservers(enrollment);
    }
}