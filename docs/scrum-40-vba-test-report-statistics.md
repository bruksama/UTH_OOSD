# Assignment: Báo cáo kiểm thử VBA test cases cho Statistics

**Thời lượng:** 90 phút
**Chủ đề:** Phân hoạch lớp tương đương, phân tích giá trị biên, thiết kế test case và kiểm thử tự động
**Mức độ:** Cơ bản đến trung bình
**Hình thức:** Cá nhân
**Tổng điểm:** 10 điểm

---

## 1. Mục tiêu bài tập

1. Xác định được **điều kiện kiểm thử** từ chức năng Statistics.
2. Áp dụng được kỹ thuật **phân hoạch lớp tương đương** cho token, endpoint và query param `limit`.
3. Áp dụng được kỹ thuật **phân tích giá trị biên** cho `limit`.
4. Thiết kế được bảng **test case** có đầy đủ input, expected result và tag bao phủ.
5. Viết được kịch bản kiểm thử tự động theo dạng VBA/Postman evidence cho SCRUM-40.

---

## 2. Nội dung tham khảo

Báo cáo này bám sát dữ liệu trong workbook:

- `docs/sheet/SPTS_Test_Cases_Jira_Workbook.xlsx`
- Sheet `Summary`
- Sheet `Test Cases`
- Sheet `Function Stats`

Trong báo cáo này, cần trình bày theo mẫu:

| Conditions | Valid Partitions | Tag | Invalid Partitions | Tag | Valid Boundaries | Tag |
|---|---|---|---|---|---|---|

và bảng test case theo mẫu:

| Test Case | Input | Expected Outcome | New Tags Covered |
|---|---|---|---|

---

## 3. Mô tả bài toán

Chức năng Statistics cung cấp dữ liệu thống kê dashboard, top courses, department stats, enrollment trends và credit distribution.

Một request Statistics được xem là **hợp lệ** khi các điều kiện sau thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Miền giá trị hợp lệ |
|---|---|---|---|
| `Authorization` | Token người dùng | Header | Bearer token hợp lệ |
| `endpoint` | API thống kê | Chuỗi | Endpoint tồn tại trong StatisticsController |
| `limit` | Số lượng top courses | Số nguyên | Không truyền, hoặc `limit ≥ 1`; `limit = 0` trả mảng rỗng |
| `dataset` | Dữ liệu seed/dev | Dữ liệu hệ thống | Có enrollment/course/student data |

Hệ thống trả về:

- `200 OK` nếu request hợp lệ.
- `401 Unauthorized` nếu thiếu hoặc sai token.
- `400 Bad Request` nếu query param sai kiểu.

---

## 4. Giả định của bài toán

1. Chỉ xét dữ liệu trong workbook SCRUM-40.
2. Dev profile cho phép mock token hợp lệ.
3. Không xét lỗi mạng hoặc lỗi môi trường.
4. `limit` là số nguyên khi parse được.
5. Dataset seed theo evidence ngày 2026-07-03.
6. Kết quả kiểm thử lấy từ workbook và screenshot/Postman evidence đã ghi nhận.

Công thức logic tổng quát:

$$
Valid =
(Authorization = valid)
\land
(endpoint \in StatisticsEndpoints)
\land
(limit = absent \lor limit \in Integer)
$$

---

# PHẦN A. ĐỀ BÀI GIAO CHO SINH VIÊN

---

## Câu 1. Xác định lớp tương đương

**Điểm:** 2 điểm

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
| ------------ | ---------- | --- | ---------------- | --- |
| Authorization | Bearer token hợp lệ | V1 | Không gửi token | X1 |
| | | | Token sai định dạng hoặc không hợp lệ | X2 |
| Endpoint | Endpoint Statistics tồn tại | V2 | Endpoint không tồn tại | X3 |
| Limit | Không truyền `limit` hoặc `limit ≥ 1` | V3 | `limit = abc` | X4 |
| Dataset | Có dữ liệu seed/dev | V4 | Dữ liệu thiếu hoặc không nhất quán | X5 |

### Yêu cầu

- Mỗi nhóm input cần có ít nhất 1 lớp hợp lệ.
- Các trường hợp thiếu token, token sai, limit sai kiểu phải được bao phủ.
- Mỗi lớp cần được đặt tag để phục vụ theo dõi độ bao phủ.

---

## Câu 2. Phân tích giá trị biên

**Điểm:** 2 điểm

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
| ------------ | --- | ---- | ------- | ---- | --- | -------- |
| Limit | 1 | 2 | 10 | N/A | N/A | B1-B3 |

### Gợi ý chọn nominal

| Biến | Miền hợp lệ | Có thể chọn nominal |
|---|---:|---:|
| Limit | `limit ≥ 1` hoặc default 10 | 10 |

### Lưu ý

`limit = 0` được workbook ghi nhận là abnormal case trả `200 OK` với array rỗng `[]`, không phải lỗi parse.

---

## Câu 3. Thiết kế test case

**Điểm:** 3 điểm

| STT | Tên test case | Input / Điều kiện | Kết quả mong đợi | Tag được bao phủ |
| --- | ------------- | ----------------- | ---------------- | ---------------- |
| 1 | No_Token | Không gửi `Authorization` | **401 Unauthorized** | X1 |
| 2 | Invalid_Token | `Authorization: Bearer invalid.fake.token` | **401 Unauthorized** | X2 |
| 3 | Dashboard_Structure | `GET /api/statistics/dashboard` với token hợp lệ | **200 OK**, đủ field dashboard | V1, V2, V4 |
| 4 | Dashboard_EnrollmentCount | Dashboard enrollment count | **200 OK**, `totalEnrollments = 90` | V1, V2, V4 |
| 5 | Dashboard_GPA_Accuracy | Dashboard GPA average | **200 OK**, GPA đúng và làm tròn 2 chữ số | V1, V2, V4 |
| 6 | Dashboard_TopCourses_In_Dashboard | Dashboard top courses | **200 OK**, top courses sorted giảm dần | V1, V2, V4 |
| 7 | TopCourses_Default_Limit | Không truyền `limit` | **200 OK**, 10 môn | V1, V2, V3, B3 |
| 8 | TopCourses_Limit_Min | `limit = 1` | **200 OK**, đúng 1 phần tử | V1, V2, V3, B1 |
| 9 | TopCourses_Limit_Two | `limit = 2` | **200 OK**, đúng 2 phần tử | V1, V2, V3, B2 |
| 10 | TopCourses_Limit_Zero | `limit = 0` | **200 OK**, array rỗng `[]` | V1, V2 |
| 11 | TopCourses_InvalidType | `limit = abc` | **400 Bad Request** | X4 |
| 12 | Departments_Structure_And_Data | `GET /api/statistics/departments` | **200 OK**, 5 department, sorted giảm dần | V1, V2, V4 |
| 13 | Departments_UniqueStudents_Count | Department unique student count | **200 OK**, distinct studentId | V1, V2, V4 |
| 14 | EnrollmentTrends_SinglePeriod | `GET /api/statistics/enrollment-trends` | **200 OK**, `Spring 2026`, count 90 | V1, V2, V4 |
| 15 | CreditDist_AllGroups | `GET /api/statistics/credit-distribution` | **200 OK**, 4 nhóm credits, total courseCount = 20 | V1, V2, V4 |

---

## Câu 4. Triển khai kiểm thử tự động

**Điểm:** 3 điểm

Kịch bản kiểm thử tự động được ghi nhận trong workbook ở dạng Postman/VBA-style execution matrix:

```text
Function Code: STAT
Function Name: Statistics
Created By: SPTS Team
Executed By: SPTS Testing Team
Test requirement: SCRUM-40 DOCX: TC_STAT_01..15 + SCRUM-37 screenshots
Passed: 15
Failed: 0
Untested: 0
Total Test Cases: 15
Normal: 7
Abnormal: 5
Boundary: 3
Executed Date: 2026-07-04
Defect ID: SCRUM-37, SCRUM-40
Evidence: Screenshot 2026-07-03: 27 assertions, all green/passed
```

Mã kiểm thử logic rút gọn:

```python
def validate_statistics_request(has_token, token_valid, endpoint_exists, limit_value=None):
    if not has_token or not token_valid:
        return 401
    if not endpoint_exists:
        return 404
    if limit_value is None:
        return 200
    if not isinstance(limit_value, int):
        return 400
    return 200

import unittest

class TestValidateStatisticsRequest(unittest.TestCase):
    def test_no_token_invalid(self):
        self.assertEqual(validate_statistics_request(False, False, True), 401)

    def test_default_limit_valid(self):
        self.assertEqual(validate_statistics_request(True, True, True), 200)

    def test_limit_min_valid(self):
        self.assertEqual(validate_statistics_request(True, True, True, 1), 200)

    def test_limit_invalid_type(self):
        self.assertEqual(validate_statistics_request(True, True, True, "abc"), 400)

if __name__ == "__main__":
    unittest.main(verbosity=2)
```

Kết quả khi chạy mã:

```bash
test_no_token_invalid (__main__.TestValidateStatisticsRequest.test_no_token_invalid) ... ok
test_default_limit_valid (__main__.TestValidateStatisticsRequest.test_default_limit_valid) ... ok
test_limit_min_valid (__main__.TestValidateStatisticsRequest.test_limit_min_valid) ... ok
test_limit_invalid_type (__main__.TestValidateStatisticsRequest.test_limit_invalid_type) ... ok

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
| Xác định đúng lớp không hợp lệ cho token | 0.4 |
| Xác định đúng lớp không hợp lệ cho limit/dataset | 0.4 |
| Có đặt tag rõ ràng cho các lớp | 0.4 |
| **Tổng** | **2.0** |

---

## Câu 2. Giá trị biên: 2 điểm

| Tiêu chí | Điểm |
|---|---:|
| Xác định đúng biên `limit = 1` | 0.7 |
| Xác định đúng `limit = 2` | 0.6 |
| Xác định đúng default/nominal `limit = 10` | 0.7 |
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
| Viết đúng hàm `validate_statistics_request` | 1.0 |
| Có sử dụng framework unit test | 0.5 |
| Có ít nhất 2 test case biên/token | 0.5 |
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
| V1 | Token hợp lệ |
| X1 | Không gửi token |
| X4 | `limit` sai kiểu |
| B1 | `limit = 1` |
| B3 | default `limit = 10` |

Khi thiết kế test case, sinh viên có thể ghi:

| Test case | Tag bao phủ |
|---|---|
| TC_STAT_01 | X1 |
| TC_STAT_07 | V1, V2, V3, B3 |
| TC_STAT_11 | X4 |

---

## 2. Tổng kết SCRUM-40

| Nội dung | Kết quả |
|---|---|
| Module | Statistics |
| Jira | SCRUM-40 |
| Tổng test case | 15 |
| Passed | 15 |
| Failed | 0 |
| Untested | 0 |
| Normal | 7 |
| Abnormal | 5 |
| Boundary | 3 |
| Evidence | `SPTS_Test_Cases_Jira_Workbook.xlsx`, sheet `Function Stats` |

Unresolved questions: none.
