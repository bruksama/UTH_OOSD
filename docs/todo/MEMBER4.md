# MEMBER4 - UX Developer

## ROLE
UX Developer - Frontend React/TypeScript, API Integration, UI Components

## CURRENT STATE
- [x] Frontend Structure COMPLETE
  - [x] React 18 + TypeScript + Vite
  - [x] Tailwind CSS configured
  - [x] React Router configured
  - [x] Layout component with navigation
- [x] Pages CREATED (with mock data)
  - [x] teacher/Dashboard.tsx
  - [x] teacher/Students.tsx
  - [x] teacher/Courses.tsx
  - [x] teacher/Alerts.tsx
  - [x] student/Dashboard.tsx
  - [x] student/MyAlerts.tsx
  - [x] auth/Login.tsx, auth/Register.tsx, auth/ForgotPassword.tsx
- [x] Types COMPLETE
  - [x] All DTOs in types/index.ts
  - [x] Enums match backend
- [~] API integration PARTIAL
  - [x] `frontend/src/services/api.ts` exists (axios instance)
  - [x] `frontend/src/services/course.api.ts` uses real backend `/courses`
  - [ ] `frontend/src/services/student.api.ts` still returns mock data
  - [ ] `frontend/src/services/alert.api.ts` is incorrect (currently duplicates student mock fetch)
  - [ ] Duplicated/overlapping service files: `student.api.ts` + `student.service.ts` (pick one convention)

---

## NEXT TASKS (as of 2026-01-21)

## TASK 1: Normalize Frontend Service Layer
**Priority: CRITICAL - Foundation for all API calls**

- [ ] Use env-based base URL (do not hardcode)
  - `api.ts`: use `import.meta.env.VITE_API_URL || 'http://localhost:8080/api'`
- [ ] Fix `alert.api.ts` to fetch real alerts (rename functions/types appropriately)
- [ ] Decide and apply ONE naming convention:
  - Option A: `*.api.ts` exports `fetchX()` helpers returning data
  - Option B: `*Service.ts` exports a service object (axios calls)
- [ ] Add missing endpoints needed by pages:
  - students: list + at-risk
  - alerts: unread + mark read + resolve
  - enrollments: by-student + complete/withdraw (if UI supports)

### 1.1 Create src/services/api.ts
```
Location: frontend/src/services/api.ts
Purpose: Axios instance with base configuration
```

SPEC:
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error or show toast notification
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
```

### 1.2 Create src/services/studentService.ts
```typescript
import api from './api';
import { StudentDTO } from '../types';

export const studentService = {
  getAll: () => api.get<StudentDTO[]>('/students'),
  getById: (id: number) => api.get<StudentDTO>(`/students/${id}`),
  getByCode: (code: string) => api.get<StudentDTO>(`/students/code/${code}`),
  create: (data: StudentDTO) => api.post<StudentDTO>('/students', data),
  update: (id: number, data: StudentDTO) => api.put<StudentDTO>(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
  getEnrollments: (id: number) => api.get(`/students/${id}/enrollments`),
  getAtRisk: () => api.get<StudentDTO[]>('/students/at-risk'),
};
```

### 1.3 Create src/services/courseService.ts
```typescript
import api from './api';
import { CourseDTO, CourseOfferingDTO } from '../types';

export const courseService = {
  getAll: () => api.get<CourseDTO[]>('/courses'),
  getById: (id: number) => api.get<CourseDTO>(`/courses/${id}`),
  create: (data: CourseDTO) => api.post<CourseDTO>('/courses', data),
  update: (id: number, data: CourseDTO) => api.put<CourseDTO>(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
  getOfferings: (id: number) => api.get<CourseOfferingDTO[]>(`/courses/${id}/offerings`),
};
```

### 1.4 Create src/services/enrollmentService.ts
```typescript
import api from './api';
import { EnrollmentDTO } from '../types';

export const enrollmentService = {
  getAll: () => api.get<EnrollmentDTO[]>('/enrollments'),
  getById: (id: number) => api.get<EnrollmentDTO>(`/enrollments/${id}`),
  create: (data: EnrollmentDTO) => api.post<EnrollmentDTO>('/enrollments', data),
  complete: (id: number, score: number) => 
    api.post<EnrollmentDTO>(`/enrollments/${id}/complete`, null, { params: { score } }),
  completeWithStrategy: (id: number, score: number) =>
    api.post<EnrollmentDTO>(`/enrollments/${id}/complete-with-strategy`, null, { params: { score } }),
  withdraw: (id: number) => api.post<EnrollmentDTO>(`/enrollments/${id}/withdraw`),
  getByStudent: (studentId: number) => api.get<EnrollmentDTO[]>(`/enrollments/student/${studentId}`),
};
```

### 1.5 Create src/services/alertService.ts
```typescript
import api from './api';
import { AlertDTO } from '../types';

export const alertService = {
  getAll: () => api.get<AlertDTO[]>('/alerts'),
  getUnread: () => api.get<AlertDTO[]>('/alerts/unread'),
  getByStudent: (studentId: number) => api.get<AlertDTO[]>(`/alerts/student/${studentId}`),
  markAsRead: (id: number) => api.put<AlertDTO>(`/alerts/${id}/read`),
  resolve: (id: number, resolvedBy: string) => 
    api.put<AlertDTO>(`/alerts/${id}/resolve`, null, { params: { resolvedBy } }),
};
```

### 1.6 Create src/services/index.ts
```typescript
export { default as api } from './api';
export { studentService } from './studentService';
export { courseService } from './courseService';
export { enrollmentService } from './enrollmentService';
export { alertService } from './alertService';
```

---

## TASK 2: Update Pages to Use Real API
**Priority: HIGH - After API service layer**

### 2.1 Update Students.tsx
```
Current: Uses mockStudents from data/mockData.ts
Change to: Use studentService with useEffect
```

PATTERN:
```typescript
import { useState, useEffect } from 'react';
import { studentService } from '../services';
import { StudentDTO } from '../types';

const Students = () => {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await studentService.getAll();
        setStudents(response.data);
      } catch (err) {
        setError('Failed to load students');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Rest of component using students state
};
```

### 2.2 Update Courses.tsx
Same pattern as Students.tsx but with courseService.

### 2.3 Update Alerts.tsx
Same pattern with alertService.getUnread() or getAll().

### 2.4 Update Dashboard.tsx
Dashboard aggregates data from multiple sources:
```typescript
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [studentsRes, alertsRes] = await Promise.all([
        studentService.getAll(),
        alertService.getUnread(),
      ]);
      
      const students = studentsRes.data;
      setTotalStudents(students.length);
      setAtRiskCount(students.filter(s => s.status === 'AT_RISK').length);
      setProbationCount(students.filter(s => s.status === 'PROBATION').length);
      setAverageGpa(calculateAverageGpa(students));
      setActiveAlerts(alertsRes.data.length);
    } catch (err) {
      console.error('Dashboard data error:', err);
    }
  };
  fetchDashboardData();
}, []);
```

---

## TASK 3: Add CRUD Operations to UI
**Priority: MEDIUM - After data displays correctly**

### 3.1 Add Student Create/Edit Modal
```
Create: src/components/StudentModal.tsx
Features:
- Form with all StudentDTO fields
- Validation (required fields, email format)
- Create mode vs Edit mode
- Submit calls studentService.create() or .update()
```

### 3.2 Add Student Delete Confirmation
```
Create: src/components/ConfirmDialog.tsx
Features:
- Generic confirmation dialog
- Accept title, message, onConfirm callback
- Delete calls studentService.delete()
```

### 3.3 Add Alert Actions
In Alerts.tsx:
- "Mark as Read" button → alertService.markAsRead()
- "Resolve" button → alertService.resolve()

---

## TASK 4: Environment Configuration
**Priority: HIGH**

### 4.1 Create .env.example
```
Location: frontend/.env.example
```
Content:
```
VITE_API_URL=http://localhost:8080/api
```

### 4.2 Update .gitignore
Ensure `.env` is gitignored (keep .env.example).

---

## EXECUTION ORDER
```
1. Install axios: cd frontend && npm install axios
2. Create src/services/ directory
3. Create api.ts with axios instance
4. Create all service files (student, course, enrollment, alert)
5. Create services/index.ts barrel export
6. Update Students.tsx to use real API
7. Verify backend is running (mvn spring-boot:run)
8. Test Students page loads real data
9. Update remaining pages (Courses, Alerts, Dashboard)
10. Add CRUD modals (optional, time permitting)
```

## VERIFICATION STEPS
```bash
# Terminal 1 - Backend
cd backend && mvn spring-boot:run -Dspring.profiles.active=dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Browser
# Go to http://localhost:5173
# Verify:
# - Dashboard shows counts from API
# - Students page shows real student data
# - Alerts page shows real alerts
# - Network tab shows API calls to localhost:8080
```

---

## SUCCESS CRITERIA
- [ ] API service layer created with axios
- [ ] All 4 pages fetch from real API
- [ ] Loading states shown while fetching
- [ ] Error states shown on API failure
- [ ] No mock data imports remaining in pages
- [ ] CORS works between frontend (5173) and backend (8080)

---

## DEPENDENCIES
- Requires: Backend API running (MEMBER1 controllers)
- Requires: Backend seeded with data (MEMBER1 DataInitializer)

## BLOCKED BY
If backend is not ready:
1. Keep mock data as fallback
2. Use environment variable to switch:
   ```typescript
   const useMockData = import.meta.env.VITE_USE_MOCK === 'true';
   ```

## DO NOT
- Remove mock data files until API fully working
- Hardcode localhost:8080 (use env variable)
- Make API calls without error handling
- Remove TypeScript types (keep type safety)

## KEY FILES TO READ FIRST
```
1. frontend/src/types/index.ts - All DTO types
2. frontend/src/pages/Students.tsx - Current mock implementation
3. frontend/src/data/mockData.ts - Mock data structure
4. frontend/src/App.tsx - Router configuration
```

---

## VISUAL REQUIREMENTS
- Loading spinner while fetching
- Error message in red on failure
- Empty state when no data
- Refresh button to reload data
- Toast notifications for actions (optional)

---
*Last Updated: 2026-01-21*
