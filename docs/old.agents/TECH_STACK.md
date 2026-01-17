# CÔNG NGHỆ VÀ QUY TẮC PHÁT TRIỂN (TECH STACK)

## 1. Công nghệ Backend (Chuẩn OOSD)
- Ngôn ngữ: Java 17 (LTS) - Tuân thủ Chương 2 của giáo trình.
- Framework: Spring Boot 3.2.x.
- Công cụ quản lý: Maven.
- Kiểm thử: JUnit 5 và Mockito.
- Tài liệu API: OpenAPI (Swagger).

## 2. Công nghệ Frontend
- Framework: React 18 (Sử dụng TypeScript).
- Công cụ xây dựng: Vite.
- Định dạng giao diện: Tailwind CSS.
- Trực quan hóa dữ liệu: Recharts.
- Quản lý trạng thái: React Context API.

## 3. Cơ sở dữ liệu
- Hệ quản trị CSDL: MySQL 8.0 hoặc PostgreSQL 15.
- ORM: Spring Data JPA (Hibernate).

## 4. Quy ước mã nguồn và Thực thi tốt nhất
- Quy tắc đặt tên:
    - Lớp (Classes): PascalCase (Ví dụ: GradeCalculator).
    - Phương thức/Biến: camelCase (Ví dụ: calculateGpa).
    - Hằng số: UPPER_SNAKE_CASE (Ví dụ: MAX_SCORE).
- Triển khai Pattern:
    - Tên lớp phải thể hiện rõ Pattern đang sử dụng (Ví dụ: StandardGradingStrategy, GradeChangeObserver, StudentProbationState).
- Ngôn ngữ:
    - Mã nguồn, chú thích, thông điệp commit: 100% tiếng Anh (để đảm bảo tính chuyên nghiệp).
- Định dạng Commit:
    - Cấu trúc: <loại>: <mô tả ngắn gọn>
    - Ví dụ: feat: triển khai observer pattern cho cập nhật điểm số.

## 5. Cấu trúc thư mục (Backend)
src/main/java/com/spts/
├── config/             # Cấu hình ứng dụng (Swagger, CORS)
├── controller/         # Các lớp điều khiển REST
├── dto/                # Các đối tượng chuyển đổi dữ liệu
├── entity/             # Các thực thể JPA
├── patterns/           # Triển khai các mẫu thiết kế OOSD
│   ├── strategy/       # Các chiến lược tính điểm
│   ├── observer/       # Các bộ theo dõi cảnh báo
│   └── state/          # Các trạng thái của sinh viên
├── repository/         # Lớp truy cập dữ liệu
└── service/            # Lớp xử lý nghiệp vụ