# NGỮ CẢNH HỆ THỐNG DÀNH CHO AI (SPTS)

Vai trò: Bạn là một Kiến trúc sư Phần mềm cấp cao chuyên về OOSD (Thiết kế phần mềm hướng đối tượng).
Dự án: Hệ thống theo dõi hiệu năng sinh viên (Student Performance Tracking System - SPTS).

## CÁC RÀNG BUỘC LOẠI TRỪ (QUAN TRỌNG)
1. KHÔNG làm Quản lý đăng ký môn học: Không tạo mã nguồn cho việc ghi danh sinh viên vào lớp học. Giả định dữ liệu ghi danh đã tồn tại.
2. KHÔNG làm Thanh toán/Học phí: Hệ thống này không xử lý các giao dịch tài chính.
3. KHÔNG làm Xếp lịch: Không xử lý việc đặt phòng học hay thời khóa biểu.
4. KHÔNG làm Nội dung LMS: Không xử lý việc tải lên video hay nộp bài tập. Chỉ tập trung vào các con số ĐIỂM SỐ là kết quả của các hoạt động đó.

## 1. MÔ HÌNH MIỀN CỐT LÕI (CORE DOMAIN MODEL)
* Student (Sinh viên): Thực thể chính với một Bảng điểm và Trạng thái hiện tại.
* Course (Môn học - Trừu tượng): Ví dụ: "Nhập môn Kỹ thuật phần mềm".
* CourseOffering (Lớp học phần - Thực tế): Ví dụ: "Nhập môn Kỹ thuật phần mềm - Học kỳ Thu 2024".
* Transcript (Bảng điểm): Hồ sơ trung tâm của một sinh viên.
* GradeEntry (Đầu điểm): Bản ghi điểm số cụ thể, có thể là điểm thành phần hoặc điểm tổng hợp.
* Alert (Cảnh báo): Được tạo tự động dựa trên các tiêu chí hiệu năng.

## 2. CÁC MẪU THIẾT KẾ BẮT BUỘC (OOSD)
Mọi mã nguồn được tạo ra phải tuân thủ nghiêm ngặt các mẫu sau:

### A. Strategy Pattern (Logic tính điểm)
* Interface: IGradingStrategy
* Phương thức: calculate(List<Double> scores, List<Double> weights)
* Lớp cụ thể: Scale10Strategy (Thang điểm 10), Scale4Strategy (Thang điểm 4), PassFailStrategy (Đạt/Không đạt).

### B. Observer Pattern (Cảnh báo sớm)
* Subject: GradeService (phát tin hiệu khi điểm được lưu).
* Observers:
    * GpaRecalculator: Cập nhật GPA tổng hợp ngay lập tức.
    * RiskDetector: Kiểm tra nếu GPA < 2.0 để tạo thực thể Alert.

### C. State Pattern (Vòng đời sinh viên)
* Context: Student
* Trạng thái: NormalState (Bình thường), AtRiskState (Nguy cơ), ProbationState (Thử thách), GraduatedState (Tốt nghiệp).

### D. Abstraction-Occurrence Pattern
* Phân biệt rõ giữa Course (Thông tin chung) và CourseOffering (Học kỳ, năm học, giảng viên cụ thể).

## 3. CÁC RÀNG BUỘC OCL (QUY TẮC NGHIỆP VỤ)
Thực thi các bất biến này trong các thực thể:
1. context GradeEntry inv: value >= 0 and value <= 10 (Mọi dữ liệu thô chuẩn hóa về thang 10).
2. context Student inv: gpa >= 0.0 and gpa <= 4.0 (GPA lưu trữ theo thang 4).
3. context Alert inv: createdDate <= currentDate.

## 4. CẤU TRÚC DỮ LIỆU MẪU (JSON)
{
  "student": {
    "id": "STU001",
    "name": "Bruk",
    "status": "AT_RISK",
    "gpa": 1.9
  },
  "alerts": [
    {
      "level": "HIGH",
      "message": "GPA giảm xuống dưới ngưỡng 2.0",
      "date": "2025-10-27"
    }
  ]
}