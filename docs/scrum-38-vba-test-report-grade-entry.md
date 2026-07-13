# Assignment: Báo cáo kiểm thử VBA test cases cho Grade Entry

**Thời lượng:** 90 phút
**Chủ đề:** Phân hoạch lớp tương đương, phân tích giá trị biên, thiết kế test case và kiểm thử tự động
**Mức độ:** Cơ bản đến trung bình
**Hình thức:** Cá nhân
**Tổng điểm:** 10 điểm

---

## 1. Mục tiêu bài tập

1. Xác định được **điều kiện kiểm thử** từ chức năng Grade Entry.
2. Áp dụng được kỹ thuật **phân hoạch lớp tương đương** cho các input chính: `score`, `weight`, `name`, `enrollmentId`.
3. Áp dụng được kỹ thuật **phân tích giá trị biên** cho `score` và `weight`.
4. Thiết kế được bảng **test case** có đầy đủ input, expected result và tag bao phủ.
5. Viết được kịch bản kiểm thử tự động theo dạng VBA/Postman evidence cho SCRUM-38.

---

## 2. Nội dung tham khảo

Báo cáo này bám sát dữ liệu trong workbook:

- `docs/sheet/SPTS_Test_Cases_Jira_Workbook.xlsx`
- Sheet `Summary`
- Sheet `Test Cases`
- Sheet `Function Grade`

Trong báo cáo này, cần trình bày theo mẫu:

| Conditions | Valid Partitions | Tag | Invalid Partitions | Tag | Valid Boundaries | Tag |
|---|---|---|---|---|---|---|

và bảng test case theo mẫu:

| Test Case | Input | Expected Outcome | New Tags Covered |
|---|---|---|---|

---

## 3. Mô tả bài toán

Chức năng Grade Entry cho phép tạo điểm thành phần cho một enrollment.

Một request tạo Grade Entry được xem là **hợp lệ** khi các điều kiện sau thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Miền giá trị hợp lệ |
|---|---|---|---|
| `score` | Điểm số | Số thực | Từ 0.0 đến 10.0 |
| `weight` | Trọng số điểm | Số thực | Từ 0.0 đến 1.0 |
| `name` | Tên cột điểm | Chuỗi | Không rỗng, tối đa 100 ký tự |
| `enrollmentId` | Mã đăng ký học phần | Số nguyên | Tồn tại trong hệ thống |

Hệ thống trả về:

- `201 Created` nếu request hợp lệ.
- `400 Bad Request` nếu dữ liệu sai validation.
- `404 Not Found` nếu `enrollmentId` không tồn tại.

---

## 4. Giả định của bài toán

1. Chỉ xét các field đang có trong workbook SCRUM-38.
2. Không xét lỗi mạng hoặc lỗi môi trường.
3. `score` và `weight` là số thực.
4. `name` là chuỗi.
5. `enrollmentId` hợp lệ khi khác null và tồn tại.
6. Kết quả kiểm thử lấy từ workbook và evidence Postman/JUnit đã ghi nhận.

Công thức logic tổng quát:

$$
Valid =
(0.0 \leq score \leq 10.0)
\land
(0.0 \leq weight \leq 1.0)
\land
(name \neq blank)
\land
(length(name) \leq 100)
\land
(enrollmentId exists)
$$

---

# PHẦN A. ĐỀ BÀI GIAO CHO SINH VIÊN

---

## Câu 1. Xác định lớp tương đương

**Điểm:** 2 điểm

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
| ------------ | ---------- | --- | ---------------- | --- |
| Score | `0.0 ≤ score ≤ 10.0` | V1 | `score < 0.0` | X1 |
| | | | `score > 10.0` | X2 |
| Weight | `0.0 ≤ weight ≤ 1.0` | V2 | `weight < 0.0` | X3 |
| | | | `weight > 1.0` | X4 |
| Name | `name` không rỗng và `length ≤ 100` | V3 | `name` rỗng | X5 |
| | | | `length(name) > 100` | X6 |
| EnrollmentId | `enrollmentId` tồn tại | V4 | `enrollmentId = null` | X7 |
| | | | `enrollmentId` không tồn tại | X8 |

### Yêu cầu

- Mỗi biến cần có ít nhất 1 lớp hợp lệ.
- Mỗi biến cần có lớp không hợp lệ tương ứng.
- Mỗi lớp cần được đặt tag để phục vụ theo dõi độ bao phủ.

---

## Câu 2. Phân tích giá trị biên

**Điểm:** 2 điểm

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
| ------------ | --- | ---- | ------- | ---- | --- | -------- |
| Score | 0.0 | 0.1 | 5.0 | 9.9 | 10.0 | B1-B5 |
| Weight | 0.0 | 0.01 | 0.5 | 0.99 | 1.0 | B6-B10 |

### Gợi ý chọn nominal

| Biến | Miền hợp lệ | Có thể chọn nominal |
|---|---:|---:|
| Score | 0.0 đến 10.0 | 5.0 |
| Weight | 0.0 đến 1.0 | 0.5 |

---

## Câu 3. Thiết kế test case

**Điểm:** 3 điểm

| STT | Tên test case | Input / Điều kiện | Kết quả mong đợi | Tag được bao phủ |
| --- | ------------- | ----------------- | ---------------- | ---------------- |
| 1 | Valid_Nominal | score hợp lệ, weight hợp lệ, name hợp lệ, enrollmentId hợp lệ | **201 Created** | V1, V2, V3, V4 |
| 2 | Score_Min | `score = 0.0` | **201 Created** | B1 |
| 3 | Score_MinPlus | `score = 0.1` | **201 Created** | B2 |
| 4 | Score_MaxMinus | `score = 9.9` | **201 Created** | B4 |
| 5 | Score_Max | `score = 10.0` | **201 Created** | B5 |
| 6 | Weight_Min | `weight = 0.0` | **201 Created** | B6 |
| 7 | Weight_MinPlus | `weight = 0.01` | **201 Created** | B7 |
| 8 | Weight_MaxMinus | `weight = 0.99` | **201 Created** | B9 |
| 9 | Weight_Max | `weight = 1.0` | **201 Created** | B10 |
| 10 | Name_Valid | `name` hợp lệ | **201 Created** | V3 |
| 11 | Name_Blank | `name` rỗng | **400 Bad Request** | X5 |
| 12 | Name_TooLong | `length(name) > 100` | **400 Bad Request** | X6 |
| 13 | EnrollmentId_Valid | `enrollmentId` tồn tại | **201 Created** | V4 |
| 14 | EnrollmentId_Null | `enrollmentId = null` | **400 Bad Request** | X7 |
| 15 | EnrollmentId_NotFound | `enrollmentId` không tồn tại | **404 Not Found** | X8 |

---

## Câu 4. Triển khai kiểm thử tự động

**Điểm:** 3 điểm

Kịch bản kiểm thử tự động được ghi nhận trong workbook ở dạng Postman/VBA-style execution matrix:

```text
Function Code: GRADE
Function Name: Grade Entry
Created By: SPTS Team
Executed By: SPTS Testing Team
Test requirement: SCRUM-42 GradeEntry bug cases all re-verified: TC_GRADE_01..15 passed
Passed: 15
Failed: 0
Untested: 0
Total Test Cases: 15
Normal: 3
Abnormal: 4
Boundary: 8
Executed Date: 2026-07-04
Defect ID: SCRUM-38, SCRUM-43, SCRUM-44, SCRUM-45, SCRUM-46, SCRUM-47
```

Mã kiểm thử logic rút gọn:

```python
def validate_grade_entry(score, weight, name, enrollment_exists):
    return (
        0.0 <= score <= 10.0
        and 0.0 <= weight <= 1.0
        and name is not None
        and len(name.strip()) > 0
        and len(name) <= 100
        and enrollment_exists
    )

import unittest

class TestValidateGradeEntry(unittest.TestCase):
    def test_score_min_valid(self):
        self.assertTrue(validate_grade_entry(0.0, 0.5, "Midterm", True))

    def test_score_max_valid(self):
        self.assertTrue(validate_grade_entry(10.0, 0.5, "Final", True))

    def test_name_blank_invalid(self):
        self.assertFalse(validate_grade_entry(5.0, 0.5, "", True))

    def test_enrollment_not_found_invalid(self):
        self.assertFalse(validate_grade_entry(5.0, 0.5, "Quiz", False))

if __name__ == "__main__":
    unittest.main(verbosity=2)
```

Kết quả khi chạy mã:

```bash
test_score_min_valid (__main__.TestValidateGradeEntry.test_score_min_valid) ... ok
test_score_max_valid (__main__.TestValidateGradeEntry.test_score_max_valid) ... ok
test_name_blank_invalid (__main__.TestValidateGradeEntry.test_name_blank_invalid) ... ok
test_enrollment_not_found_invalid (__main__.TestValidateGradeEntry.test_enrollment_not_found_invalid) ... ok

----------------------------------------------------------------------
Ran 4 tests in 0.001s

OK
```

# PHẦN B. BẢNG CHẤM ĐIỂM CHI TIẾT

---

## Câu 1. Lớp tương đương: 2 điểm

| Tiêu chí | Điểm |
|---|---:|
| Xác định đúng lớp hợp lệ cho 4 nhóm input | 0.8 |
| Xác định đúng lớp không hợp lệ nhỏ hơn hoặc thiếu dữ liệu | 0.4 |
| Xác định đúng lớp không hợp lệ lớn hơn hoặc không tồn tại | 0.4 |
| Có đặt tag rõ ràng cho các lớp | 0.4 |
| **Tổng** | **2.0** |

---

## Câu 2. Giá trị biên: 2 điểm

| Tiêu chí | Điểm |
|---|---:|
| Xác định đúng biên cho score | 1.0 |
| Xác định đúng biên cho weight | 1.0 |
| **Tổng** | **2.0** |

---

## Câu 3. Test case: 3 điểm

| Tiêu chí | Điểm |
|---|---:|
| Có tối thiểu 8 test case | 0.5 |
| Có test case hợp lệ | 0.5 |
| Có test case không hợp lệ | 0.5 |
| Có test case tại biên hoặc gần biên | 0.5 |
| Expected result rõ ràng, có lý do khi không hợp lệ | 0.5 |
| Có tag được bao phủ | 0.5 |
| **Tổng** | **3.0** |

---

## Câu 4. Unit test: 3 điểm

| Tiêu chí | Điểm |
|---|---:|
| Viết đúng hàm `validate_grade_entry` | 1.0 |
| Có sử dụng framework unit test | 0.5 |
| Có ít nhất 2 test case biên | 0.5 |
| Có ít nhất 1 case hợp lệ tại biên | 0.5 |
| Có ít nhất 1 case không hợp lệ ngoài biên | 0.5 |
| **Tổng** | **3.0** |

---

# PHẦN C. NHẬN XÉT

## 1. Vì sao cần tag?

Tag giúp theo dõi test case nào đã bao phủ lớp nào hoặc biên nào.

Ví dụ:

| Tag | Ý nghĩa |
|---|---|
| V1 | Score hợp lệ |
| X5 | Name rỗng |
| X8 | EnrollmentId không tồn tại |
| B1 | Score tại min |
| B10 | Weight tại max |

Khi thiết kế test case, sinh viên có thể ghi:

| Test case | Tag bao phủ |
|---|---|
| TC_GRADE_01 | V1, V2, V3, V4 |
| TC_GRADE_02 | B1 |
| TC_GRADE_11 | X5 |

---

## 2. Tổng kết SCRUM-38

| Nội dung | Kết quả |
|---|---|
| Module | Grade Entry |
| Jira | SCRUM-38 |
| Tổng test case | 15 |
| Passed | 15 |
| Failed | 0 |
| Untested | 0 |
| Normal | 3 |
| Abnormal | 4 |
| Boundary | 8 |
| Evidence | `SPTS_Test_Cases_Jira_Workbook.xlsx`, sheet `Function Grade` |

Unresolved questions: none.
