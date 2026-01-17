# THIET KE CHI TIET CO SO DU LIEU TOI UU HOA (ERD DESIGN OPTIMIZED)

## 1. DANH SACH CAC BANG (TABLES)

### Bang: Students (Sinh vien)
| Cot | Kieu du lieu | Rang buoc | Giai thich |
|:---|:---|:---|:---|
| id | BIGINT | PK, AUTO_INCREMENT | Dinh danh noi bo |
| student_id | VARCHAR(20) | UNIQUE, NOT NULL | Ma so sinh vien (STU001) |
| first_name | VARCHAR(50) | NOT NULL | Ho |
| last_name | VARCHAR(50) | NOT NULL | Ten |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Email lien lac |
| date_of_birth | DATE | NULL | Ngay sinh |
| enrollment_date | DATE | NULL | Ngay nhap hoc |
| status | ENUM | NOT NULL, DEFAULT 'NORMAL' | NORMAL, AT_RISK, PROBATION, GRADUATED |
| gpa | DECIMAL(3,2) | DEFAULT 0.00, CHECK (0-4) | Diem trung binh tich luy (Thang 4.0) |
| total_credits | INT | DEFAULT 0 | Tong so tin chi da hoan thanh |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thoi diem tao ho so |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Thoi diem cap nhat cuoi |

### Bang: Courses (Mon hoc - Abstraction)
| Cot | Kieu du lieu | Rang buoc | Giai thich |
|:---|:---|:---|:---|
| id | BIGINT | PK, AUTO_INCREMENT | Dinh danh noi bo |
| course_code | VARCHAR(20) | UNIQUE, NOT NULL | Ma mon hoc (VD: CS101) |
| course_name | VARCHAR(200) | NOT NULL | Ten mon hoc |
| description | TEXT | NULL | Mo ta mon hoc |
| credits | TINYINT | NOT NULL, CHECK > 0 | So tin chi cua mon hoc |
| department | VARCHAR(100) | NULL | Khoa/Bo mon quan ly |
| grading_type | ENUM | NOT NULL, DEFAULT 'SCALE_10' | SCALE_10, SCALE_4, PASS_FAIL |

### Bang: Course_Offerings (Lop hoc phan - Occurrence)
| Cot | Kieu du lieu | Rang buoc | Giai thich |
|:---|:---|:---|:---|
| id | BIGINT | PK, AUTO_INCREMENT | Dinh danh lop hoc phan |
| course_id | BIGINT | FK, NOT NULL | Tro den Courses(id) |
| semester | ENUM | NOT NULL | SPRING, SUMMER, FALL, WINTER |
| academic_year | SMALLINT | NOT NULL | Nam hoc (VD: 2024) |
| instructor | VARCHAR(100) | NULL | Ten giang vien phu trach |
| max_enrollment | INT | NULL | So luong toi da |
| current_enrollment | INT | DEFAULT 0 | So luong hien tai |
| UNIQUE | | (course_id, semester, academic_year) | Rang buoc duy nhat |

### Bang: Enrollments (Dang ky mon hoc)
| Cot | Kieu du lieu | Rang buoc | Giai thich |
|:---|:---|:---|:---|
| id | BIGINT | PK, AUTO_INCREMENT | Dinh danh luot hoc |
| student_id | BIGINT | FK, NOT NULL | Tro den Students(id) |
| course_offering_id | BIGINT | FK, NOT NULL | Tro den Course_Offerings(id) |
| final_score | DECIMAL(4,2) | NULL, CHECK (0-10) | Diem tong ket he 10 |
| letter_grade | VARCHAR(2) | NULL | Diem chu (A, B+, B, C+, C, D+, D, F) |
| gpa_value | DECIMAL(3,2) | NULL, CHECK (0-4) | Gia tri GPA (he 4) |
| status | ENUM | DEFAULT 'IN_PROGRESS' | IN_PROGRESS, COMPLETED, WITHDRAWN |
| enrolled_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thoi diem dang ky |
| completed_at | TIMESTAMP | NULL | Thoi diem hoan thanh |
| UNIQUE | | (student_id, course_offering_id) | Moi SV chi dang ky 1 lan/lop |

### Bang: Grade_Entries (Dau diem thanh phan - Composite Pattern)
| Cot | Kieu du lieu | Rang buoc | Giai thich |
|:---|:---|:---|:---|
| id | BIGINT | PK, AUTO_INCREMENT | Dinh danh dau diem |
| enrollment_id | BIGINT | FK, NOT NULL | Tro den Enrollments(id) |
| parent_id | BIGINT | FK (Self), NULL | Tro den Grade_Entries(id) neu la diem con |
| name | VARCHAR(100) | NOT NULL | Ten dau diem (VD: Midterm, Lab, Quiz1) |
| weight | DECIMAL(3,2) | NOT NULL, CHECK (0-1) | Trong so (VD: 0.3 cho 30%) |
| score | DECIMAL(4,2) | NULL, CHECK (0-10) | Gia tri diem so thuc te |
| entry_type | ENUM | NOT NULL | COMPONENT, FINAL |
| recorded_by | VARCHAR(100) | NULL | Nguoi nhap diem |
| recorded_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thoi diem nhap diem |
| notes | TEXT | NULL | Ghi chu |

### Bang: Alerts (Canh bao)
| Cot | Kieu du lieu | Rang buoc | Giai thich |
|:---|:---|:---|:---|
| id | BIGINT | PK, AUTO_INCREMENT | Dinh danh canh bao |
| student_id | BIGINT | FK, NOT NULL | Tro den Students(id) |
| level | ENUM | NOT NULL | INFO, WARNING, HIGH, CRITICAL |
| type | ENUM | NOT NULL | LOW_GPA, GPA_DROP, STATUS_CHANGE, PROBATION, IMPROVEMENT |
| message | TEXT | NOT NULL | Noi dung chi tiet canh bao |
| is_read | BOOLEAN | DEFAULT FALSE | Da doc hay chua |
| read_at | TIMESTAMP | NULL | Thoi diem doc |
| is_resolved | BOOLEAN | DEFAULT FALSE | Da xu ly hay chua |
| resolved_at | TIMESTAMP | NULL | Thoi diem xu ly |
| resolved_by | VARCHAR(100) | NULL | Nguoi xu ly |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thoi diem phat sinh canh bao |

---

## 2. SO DO QUAN HE (RELATIONSHIPS)

```
Students (1) ----< (N) Enrollments (N) >---- (1) Course_Offerings (N) >---- (1) Courses
    |                       |
    |                       |
    v                       v
  (1:N)                   (1:N)
    |                       |
    v                       v
 Alerts              Grade_Entries (self-referencing for Composite)
```

### Chi tiet quan he:
| Quan he | Cardinality | Mo ta |
|:---|:---|:---|
| Students → Enrollments | 1:N | Mot SV co nhieu luot dang ky |
| Course_Offerings → Enrollments | 1:N | Mot lop co nhieu SV dang ky |
| Courses → Course_Offerings | 1:N | Mot mon co nhieu lop hoc phan |
| Enrollments → Grade_Entries | 1:N | Mot luot hoc co nhieu dau diem |
| Grade_Entries → Grade_Entries | 1:N | Dau diem cha-con (Composite) |
| Students → Alerts | 1:N | Mot SV co nhieu canh bao |

---

## 3. CHI MUC TOI UU HOA (INDEXES)

De dam bao toc do truy van cho he thong Analytics, can thiet lap cac chi muc sau:

1. **INDEX tren Students(status):** Loc nhanh sinh vien theo trang thai hoc thuat.
2. **INDEX tren Students(gpa):** Loc sinh vien theo GPA.
3. **INDEX tren Enrollments(student_id):** Truy xuat nhanh lich su hoc cua mot sinh vien.
4. **INDEX tren Enrollments(course_offering_id):** Lay danh sach SV trong mot lop.
5. **INDEX tren Grade_Entries(enrollment_id):** Lay nhanh cac dau diem de tinh toan GPA.
6. **INDEX tren Grade_Entries(parent_id):** Truy van cau truc diem phan cap.
7. **INDEX tren Alerts(student_id, created_at):** Xem lich su canh bao theo thoi gian cua sinh vien.
8. **INDEX tren Alerts(is_resolved):** Loc cac canh bao chua xu ly.

---

## 4. QUY TAC TOAN VEN (INTEGRITY RULES)

1. **Deletion Policy:**
   - Khi xoa mot `Course`, khong duoc phep xoa neu da co `Course_Offering` (RESTRICT).
   - Khi xoa mot `Course_Offering`, khong duoc phep xoa neu da co `Enrollment` (RESTRICT).
   - Khi xoa mot `Student`, thuc hien xoa cac `Alerts` va `Enrollments` lien quan (CASCADE).
   - Khi xoa mot `Enrollment`, thuc hien xoa cac `Grade_Entries` lien quan (CASCADE).

2. **Precision:** 
   - Su dung `DECIMAL` thay vi `FLOAT` de tranh sai so lam tron trong cong thuc tinh GPA tich luy.

3. **Audit:** 
   - Moi thay doi ve trang thai sinh vien hoac diem so deu duoc ghi nhan qua cot `updated_at`, `recorded_at` hoac `created_at`.

4. **OCL Constraints:**
   - `Grade_Entries.score`: >= 0 AND <= 10
   - `Students.gpa`: >= 0.0 AND <= 4.0
   - `Enrollments.final_score`: >= 0 AND <= 10
   - `Grade_Entries.weight`: >= 0 AND <= 1
   - `Alerts.created_at`: <= CURRENT_TIMESTAMP

---

## 5. DESIGN PATTERNS APPLIED

### 5.1 Abstraction-Occurrence Pattern (Chapter 6)
- **Abstraction:** `Courses` - Dinh nghia mon hoc chung
- **Occurrence:** `Course_Offerings` - The hien cu the trong tung hoc ky

### 5.2 Composite Pattern
- **Component:** `Grade_Entries` voi `parent_id` tu tham chieu
- **Leaf:** Dau diem khong co con (parent_id = NULL hoac khong co children)
- **Composite:** Dau diem co cac dau diem con (VD: Lab -> Quiz1, Quiz2, Assignment)

```
Final Grade (weight: 1.0)
├── Midterm (weight: 0.3)
├── Final Exam (weight: 0.4)  
└── Lab (weight: 0.3)
    ├── Quiz 1 (weight: 0.33)
    ├── Quiz 2 (weight: 0.33)
    └── Assignment (weight: 0.34)
```

---

*Last Updated: 2026-01-14*
