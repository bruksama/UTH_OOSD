# Báo Cáo Tổng Kết Đóng Góp Thành Viên

## 1. Thông Tin Chung

| Hạng mục | Nội dung |
|---|---|
| Dự án | SPTS - Student Performance Tracking System |
| Mục tiêu | Tổng kết khối lượng công việc và minh chứng đóng góp của từng thành viên |
| Nguồn dữ liệu | Jira workspace SCRUM, Git commit history, test workbook |
| Chu kỳ sprint | 1 tuần |
| Giai đoạn báo cáo | 23/05/2026 - 10/07/2026 |

Báo cáo này tổng hợp công việc của nhóm dựa trên Jira task, nhãn công việc, trạng thái task, sprint date và commit Git liên quan. Mục tiêu là thể hiện rõ mỗi thành viên đã tham gia phần nào, làm loại việc gì, và có bằng chứng kiểm chứng từ Jira/Git.

## 2. Tổng Quan Khối Lượng Theo Thành Viên

| Thành viên | Jira issues | Hoàn thành | Module chính | Loại công việc chính | Minh chứng chính |
|---|---:|---:|---|---|---|
| Huu Tri | 8 | 8 | Setup, Auth, Student, Course, Statistics | manual-test, postman-test, bug-fix, test-design | SCRUM-5, 6, 16, 18, 20, 33, 37, 41 |
| Phạm Trần Khánh Nguyên | 8 | 8 | Setup, Auth, Student, Course, Grade Entry | postman-test, bug-fix, test-design | SCRUM-7, 11, 12, 22, 25, 34, 36, 39 |
| Nguyễn Thanh Tùng | 7 | 6 | Auth, Student, Course, Grade Entry | test-design, bug-fix, boundary-value | SCRUM-8, 26, 29, 42, 43, 44, 45 |
| Nguyen Chanh Hoan | 5 | 5 | Auth, Student, Code Quality, Statistics | test-design, sonarqube-scan, bug-fix | SCRUM-9, 13, 21, 32, 40 |
| Phạm Thịnh | 4 | 4 | Student, Course, Grade Entry | test-design, postman-test, bug-fix | SCRUM-27, 28, 30, 38 |
| Bruk | 4 | 4 | Course, Grade Entry, Alert Controller | bug-fix, boundary-value, white-box-test, coverage | SCRUM-35, 46, 47, 48 |
| Shared / Unassigned | 1 | 1 | Course | bug-fix, manual-test | SCRUM-31 |

Ghi chú: SCRUM-31 là bug tổng hợp cho Course Management và đang không có assignee trực tiếp trên Jira. Các subtask liên quan đã được phân công cho từng thành viên.

## 3. Timeline Theo Sprint

| Sprint | Thời gian | Trọng tâm công việc | Jira evidence |
|---|---|---|---|
| Sprint 1 | 23/05/2026 - 29/05/2026 | Khởi tạo hệ thống, Swagger, Postman setup, phân tích test ban đầu | SCRUM-5 đến SCRUM-9 |
| Sprint 2 | 30/05/2026 - 05/06/2026 | Kiểm thử Authentication và lỗi logout | SCRUM-11 đến SCRUM-16 |
| Sprint 3 | 04/06/2026 - 10/06/2026 | Kiểm thử và sửa lỗi Student Management | SCRUM-18 đến SCRUM-27 |
| Sprint 4 | 10/06/2026 - 16/06/2026 | Test design và Postman cho Course / Enrollment | SCRUM-28 đến SCRUM-30 |
| Sprint 5 | 19/06/2026 - 25/06/2026 | Sửa lỗi Course và SonarQube / Code Quality | SCRUM-31 đến SCRUM-35 |
| Sprint 6 | 27/06/2026 - 03/07/2026 | Test design và Postman cho Grade Entry, Statistics | SCRUM-36 đến SCRUM-41 |
| Sprint 7 | 03/07/2026 - 09/07/2026 | Sửa lỗi GradeEntry sau Postman run | SCRUM-42 đến SCRUM-47 |
| Sprint 8 | 10/07/2026 | Bổ sung kiểm thử white-box và báo cáo coverage cho AlertController | SCRUM-48 |

## 4. Chi Tiết Đóng Góp Từng Thành Viên

### 4.1. Huu Tri

| Nội dung | Kết quả |
|---|---|
| Jira workload | 8 issues, 8 Done |
| Module tham gia | Setup, Authentication, Student, Course, Statistics |
| Loại công việc | manual-test, postman-test, bug-fix, test-design |
| Jira task chính | SCRUM-5, SCRUM-6, SCRUM-16, SCRUM-18, SCRUM-20, SCRUM-33, SCRUM-37, SCRUM-41 |

Đóng góp chính:
- Khởi chạy hệ thống và lấy endpoint qua Swagger.
- Tham gia kiểm thử Authentication, đặc biệt lỗi logout `TC_LOGOUT_02`.
- Tham gia kiểm thử Student Management và Statistics.
- Có đóng góp ở Course bug case `TC_COURSE_01`.

### 4.2. Phạm Trần Khánh Nguyên

| Nội dung | Kết quả |
|---|---|
| Jira workload | 8 issues, 8 Done |
| Module tham gia | Setup, Authentication, Student, Course, Grade Entry |
| Loại công việc | postman-test, bug-fix, test-design |
| Jira task chính | SCRUM-7, SCRUM-11, SCRUM-12, SCRUM-22, SCRUM-25, SCRUM-34, SCRUM-36, SCRUM-39 |

Đóng góp chính:
- Thiết lập Postman và thực hiện kiểm thử Authentication.
- Tham gia tổng hợp và xử lý bug Student Management.
- Phụ trách Postman / test execution cho Grade Entry.
- Tham gia xử lý Course bug `TC_COURSE_05`.

### 4.3. Nguyễn Thanh Tùng

| Nội dung | Kết quả |
|---|---|
| Jira workload | 7 issues, 6 Done |
| Module tham gia | Authentication, Student, Course, Grade Entry |
| Loại công việc | test-design, bug-fix, boundary-value |
| Jira task chính | SCRUM-8, SCRUM-26, SCRUM-29, SCRUM-42, SCRUM-43, SCRUM-44, SCRUM-45 |

Đóng góp chính:
- Phân tích chức năng và thiết kế test case Authentication.
- Viết kịch bản kiểm thử cho Course Management.
- Phụ trách nhóm bug GradeEntry còn lại sau Postman run.
- Xử lý các case `TC_GRADE_13`, `TC_GRADE_08`, `TC_GRADE_10`.

Ghi chú: SCRUM-42 là parent bug đang ở trạng thái In Review, các subtask liên quan đã Done.

### 4.4. Nguyen Chanh Hoan

| Nội dung | Kết quả |
|---|---|
| Jira workload | 5 issues, 5 Done |
| Module tham gia | Authentication, Student, Code Quality, Statistics |
| Loại công việc | test-design, sonarqube-scan, bug-fix |
| Jira task chính | SCRUM-9, SCRUM-13, SCRUM-21, SCRUM-32, SCRUM-40 |

Đóng góp chính:
- Đọc và phân tích SRS.
- Viết kịch bản test cho Authentication và Student Management.
- Thực hiện sửa lỗi code quality theo SonarQube ở SCRUM-32.
- Tham gia test design cho Statistics.

### 4.5. Phạm Thịnh

| Nội dung | Kết quả |
|---|---|
| Jira workload | 4 issues, 4 Done |
| Module tham gia | Student, Course, Grade Entry |
| Loại công việc | test-design, postman-test, bug-fix |
| Jira task chính | SCRUM-27, SCRUM-28, SCRUM-30, SCRUM-38 |

Đóng góp chính:
- Phụ trách kiểm thử Course Management.
- Thực hiện Postman cho Course.
- Tham gia test case Grade Entry.
- Tham gia xử lý Student bug `TC_STUDENT_05`.

### 4.6. Bruk

| Nội dung | Kết quả |
|---|---|
| Jira workload | 4 issues, 4 Done |
| Module tham gia | Course, Grade Entry, Alert Controller |
| Loại công việc | bug-fix, boundary-value, white-box-test, coverage |
| Jira task chính | SCRUM-35, SCRUM-46, SCRUM-47, SCRUM-48 |

Đóng góp chính:
- Xử lý lỗi Course `TC_COURSE_10`.
- Xử lý GradeEntry boundary cases `TC_GRADE_09` và `TC_GRADE_05`.
- Bổ sung regression tests cho GradeEntry và cập nhật CI chạy nhóm test liên quan.
- Thiết kế và triển khai kiểm thử white-box cho `AlertController`.
- Cấu hình JaCoCo và ghi nhận coverage percent: 100% instructions, 100% lines, 100% methods cho `AlertController`.

## 5. Minh Chứng Git Commit

| Git author | Số commit liên quan | Commit / nội dung nổi bật |
|---|---:|---|
| ThanhTunq08 / Thanh Tung | 14 | SCRUM-29, cập nhật TC_COURSE.csv, TC_STUDENT.csv, TC_LOGIN.csv, TC_GRADE.csv |
| Tri2503 | 10+ | SCRUM-16, SCRUM-22, SCRUM-31, TC_STATISTICS_06 |
| gthinh29 | 4 | SCRUM-22 hotfixes, xử lý lỗi Student Management |
| teohoan | 3 | SCRUM-32, thay `|= 0` bằng `Math.trunc` theo SonarQube |
| Bruk / bruksama | nhiều commit | SCRUM-35, SCRUM-46, SCRUM-47, SCRUM-48, CI regression tests, JaCoCo coverage |
| trankhanhnguyen1008-collab | 1 | TC_COURSE_05 |

Một số commit tiêu biểu:

| Commit | Ngày | Author | Nội dung |
|---|---|---|---|
| 4091c1a | 03/06/2026 | Tri2503 | fix: SCRUM-16 |
| 3f3f608 | 09/06/2026 | gthinh29 | hotfix: SCRUM-22 |
| a61fdc6 | 11/06/2026 | ThanhTunq08 | fix: SCRUM-29 |
| 956f949 | 18/06/2026 | Tri2503 | fix: TC_COURSE_01 (SCRUM-31) |
| 7e437c6 | 19/06/2026 | Bruk | fix: SCRUM-31 TC_COURSE_10 |
| a4c5c89 | 19/06/2026 | teohoan | fix: replace bitwise with Math.trunc (SCRUM-32) |
| 9d9dee4 | 03/07/2026 | Tri2503 | fix: SCRUM-31 |
| 6699030 | 04/07/2026 | bruksama | fix GradeEntry final score calculation |
| db2a207 | 04/07/2026 | bruksama | fix GradeEntry review feedback |
| 0a5aaeb | 04/07/2026 | bruksama | ci(test): run solved Jira regressions |
| 97ee75a | 10/07/2026 | bruksama | fix: SCRUM-48 |

## 6. Minh Chứng Kiểm Thử Và Chất Lượng

| Nhóm minh chứng | Nguồn |
|---|---|
| Test design | Jira labels `test-design`, workbook test cases |
| Postman testing | Jira labels `postman-test`, attachments / Postman run |
| Manual verification | Jira labels `manual-test`, actual result trong workbook |
| Boundary testing | Jira labels `boundary-value`, GradeEntry TC 05, 08, 09, 10, 13 |
| White-box testing | SCRUM-48, `AlertControllerTest`, JaCoCo method/line coverage |
| Bug fixing | Jira labels `bug-fix`, Git commits gắn SCRUM / TC |
| SonarQube | SCRUM-32, label `sonarqube-scan` |
| CI regression | Backend unit tests, GradeEntry regression tests |

Kết quả Grade Entry sau cập nhật:

| Module | Tổng TC | Passed | Failed | Ghi chú |
|---|---:|---:|---:|---|
| Grade Entry | 15 | 15 | 0 | Các case SCRUM-43 đến SCRUM-47 đã cập nhật Passed |
| Alert Controller | 7 | 7 | 0 | SCRUM-48: 19/19 endpoint methods covered; JaCoCo line/method coverage 100% |

Kết quả coverage cho `AlertController`:

| Metric | Covered / Total | Coverage | Ghi chú |
|---|---:|---:|---|
| Instructions | 126 / 126 | 100% | JaCoCo |
| Lines | 23 / 23 | 100% | JaCoCo |
| Methods | 20 / 20 | 100% | JaCoCo tính cả constructor |
| Endpoint methods | 19 / 19 | 100% | Các endpoint controller |
| Branches | 0 / 0 | N/A | Controller không có nhánh `if/else` |

## 7. Nhận Xét Chung

- Nhóm có phân chia công việc theo module rõ: Auth, Student, Course, Grade Entry, Statistics, Code Quality.
- Jira thể hiện workload qua assignee, labels, start date, due date và trạng thái.
- Git commit bổ sung bằng chứng kỹ thuật cho các task bug fix và CI.
- Các task kiểm thử có đủ loại: normal case, abnormal case, boundary value.
- Các lỗi quan trọng đã được liên kết với Jira bug/subtask và có trạng thái xử lý.

## 8. Kết Luận

Nhóm đã hoàn thành phần lớn công việc kiểm thử và sửa lỗi theo từng sprint một tuần. Jira được dùng để quản lý task, phân công thành viên, gắn nhãn module và loại kiểm thử. Git commit được dùng làm bằng chứng triển khai cho các bug fix quan trọng. Báo cáo này cho thấy đóng góp của từng thành viên dựa trên dữ liệu cụ thể thay vì mô tả cảm tính.

## Phụ Lục A. Nguồn Dữ Liệu Nên Đính Kèm Khi Nộp

| Phụ lục | Nội dung nên xuất |
|---|---|
| A1 | Jira workload export theo assignee |
| A2 | Jira issue list có labels, start date, due date |
| A3 | Git commit log có SCRUM / TC reference |
| A4 | Test workbook `SPTS_Test_Cases_Jira_Workbook.xlsx` |
| A5 | Screenshot CI / test result |

## Phụ Lục B. Lưu Ý Khi Trình Bày Với Giảng Viên

- Không cần đưa toàn bộ raw Git log vào phần chính, chỉ đưa bảng tóm tắt và commit tiêu biểu.
- Nếu bị hỏi workload, mở Jira export theo assignee.
- Nếu bị hỏi bằng chứng fix, mở commit có SCRUM ID hoặc test workbook.
- Nếu bị hỏi timeline, dùng bảng sprint theo tuần.
