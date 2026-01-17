# HƯỚNG DẪN KHỞI TẠO DỰ ÁN: SPTS

## Điều kiện tiên quyết
1. Java JDK 17+: Kiểm tra bằng lệnh 'java -version'.
2. Maven 3.8+: Kiểm tra bằng lệnh 'mvn -version'.
3. Node.js 18+: Dùng cho phát triển Frontend.
4. MySQL/PostgreSQL: Cài đặt bản địa hoặc chạy qua Docker.

## Bắt đầu nhanh cho lập trình viên

### 1. Thiết lập cơ sở dữ liệu
Tạo một schema mới trong cơ sở dữ liệu của bạn:
CREATE DATABASE spts_db;

Lưu ý: Cập nhật tệp application.properties với thông tin đăng nhập (username/password) của bạn.

### 2. Backend (Spring Boot)
Di chuyển vào thư mục /backend:
mvn clean install
mvn spring-boot:run

* Server chạy tại: http://localhost:8080
* Swagger UI: http://localhost:8080/swagger-ui.html (Sử dụng để kiểm tra API mà không cần Frontend).

### 3. Frontend (React)
Di chuyển vào thư mục /frontend:
npm install
npm run dev

* Ứng dụng chạy tại: http://localhost:5173

## Cấu trúc dự án
* /backend: Mã nguồn Java Spring Boot.
* /frontend: Mã nguồn React.
* /docs: Tài liệu và các sơ đồ thiết kế (ERD, Class Diagram, Sequence Diagram).

## Xử lý sự cố
* Cổng 8080 đã bị chiếm dụng: Thay đổi giá trị 'server.port' trong file application.properties.
* Lỗi CORS: Kiểm tra cấu hình @CrossOrigin trong các Controller của Backend hoặc cấu hình WebMvcConfigurer.