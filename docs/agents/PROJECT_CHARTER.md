# PROJECT CHARTER: HỆ THỐNG THEO DÕI HIỆU NĂNG SINH VIÊN (SPTS)

## 1. Tầm nhìn Dự án (Project Vision)
Xây dựng hệ thống Analytics Engine tập trung phân tích dữ liệu học tập, tính toán GPA, Learning Curve và Early Warning.
- Giá trị cốt lõi: Biến dữ liệu điểm số thô thành thông tin chi tiết giúp cải thiện kết quả học tập.
- Ngoài phạm vi: Quản lý tuyển sinh, Đăng ký môn học, Xếp thời khóa biểu, Thanh toán học phí.

## 2. Cấu trúc Nhóm và Vai trò (4 Thành viên)
Dự án phân chia theo Pattern và Layer để tối ưu hóa việc làm việc song song:

### Thành viên 1: Kiến trúc sư chính và Ràng buộc (Foundation)
- Trách nhiệm:
    - Thiết kế ERD và thực thể (Student, Course, Transcript, GradeEntry).
    - Triển khai Abstraction-Occurrence Pattern cho Course và CourseOffering (Chương 6).
    - Viết các ràng buộc OCL (Object Constraint Language) cho dữ liệu (Chương 5).
    - Thiết lập Base Repository và Controller.

### Thành viên 2: Kỹ sư Logic (Structural Patterns)
- Trách nhiệm:
    - Triển khai Strategy Pattern: Xử lý logic tính điểm đa dạng (Thang 10, Thang 4, Đạt/Không đạt).
    - Triển khai Composite Pattern: Xử lý cấu trúc điểm phân cấp (Trọng số điểm thành phần).
    - Viết Unit Test (JUnit 5) cho thuật toán tính toán (Chương 10).

### Thành viên 3: Kỹ sư Hành vi (Behavioral Patterns)
- Trách nhiệm:
    - Triển khai Observer Pattern: Tự động kích hoạt tính năng khi có điểm số mới.
    - Triển khai State Pattern: Quản lý vòng đời sinh viên (Normal, AtRisk, Probation).
    - Xử lý logic Alerts tự động khi trạng thái học tập thay đổi.

### Thành viên 4: Giao diện và Trực quan hóa (User Experience)
- Trách nhiệm:
    - Thiết kế Dashboard với React và Recharts.
    - Trực quan hóa biểu đồ: GPA Trend, Credit Completion Rate.
    - Tạo Mock API để phát triển giao diện độc lập với Backend.
    - Triển khai luồng xác thực cơ bản.

## 3. Quy trình thực hiện (Workflow)
- Giai đoạn 1: Định nghĩa Interface và DTO (Ngày 1-2).
- Giai đoạn 2: Triển khai chi tiết (Ngày 3-6).
- Giai đoạn 3: Tích hợp và Kiểm thử (Ngày 7).