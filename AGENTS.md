# AGENTS.md - AI Agent Guidelines for SPTS

> Student Performance Tracking System - Spring Boot + React TypeScript

**Generated:** 2026-01-18 | **Commit:** c817268 | **Branch:** main

## Project Overview

Analytics Engine for tracking student academic performance, GPA calculation, and early warning system.
**NOT in scope**: Course registration, payments, scheduling, LMS content.

## Quick Reference

| Stack | Technology |
|-------|------------|
| Backend | Java 17, Spring Boot 3.2.5, JPA/Hibernate, Maven |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Database | MySQL 8.0 / PostgreSQL 15 / H2 (dev) |
| Testing | JUnit 5, Mockito |

---

## Build / Lint / Test Commands

### Backend (from `backend/` directory)

```bash
# Compile
mvn compile

# Run application
mvn spring-boot:run

# Run all tests
mvn test

# Run single test class
mvn test -Dtest=StudentServiceTest

# Run single test method
mvn test -Dtest=StudentServiceTest#testCalculateGpa

# Package (skip tests)
mvn package -DskipTests

# Clean build
mvn clean install
```

### Frontend (from `frontend/` directory)

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

---

## Code Style Guidelines

### Java Backend

#### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Classes | PascalCase | `StudentService`, `GradeEntry` |
| Methods/Variables | camelCase | `calculateGpa`, `studentId` |
| Constants | UPPER_SNAKE_CASE | `MAX_SCORE`, `DEFAULT_GPA` |
| Database columns | snake_case | `student_id`, `created_at` |
| Packages | lowercase | `com.spts.service` |

#### Import Organization (order)
```java
// 1. Project imports
import com.spts.dto.*;
import com.spts.entity.*;
import com.spts.repository.*;

// 2. Spring imports
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// 3. Java/Jakarta imports
import java.util.List;
import jakarta.validation.constraints.*;
```

#### Class Structure
```java
@Service
@Transactional
public class ExampleService {

    // 1. Dependencies (constructor injection)
    private final ExampleRepository repository;

    public ExampleService(ExampleRepository repository) {
        this.repository = repository;
    }

    // 2. CRUD Operations section
    // ==================== CRUD Operations ====================

    @Transactional(readOnly = true)
    public List<ExampleDTO> getAll() { ... }

    // 3. Business Logic section
    // ==================== Business Logic ====================

    // 4. Private helper methods
    private ExampleDTO convertToDTO(Example entity) { ... }
}
```

#### Error Handling
```java
// Standard pattern - throw RuntimeException with descriptive message
Entity entity = repository.findById(id)
    .orElseThrow(() -> new RuntimeException("Entity not found with id: " + id));

// Use Bean Validation annotations on entities/DTOs
@NotBlank(message = "Field is required")
@DecimalMin(value = "0.0", message = "Value cannot be negative")
```

#### Documentation
```java
/**
 * Brief description of the class/method.
 * 
 * Integration points:
 * - Pattern Name: Description of integration
 * 
 * OCL Constraints:
 * - fieldName >= 0 AND fieldName <= 10
 * 
 * @author SPTS Team
 */
```

### TypeScript Frontend

#### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `StudentList`, `Dashboard` |
| Files (components) | PascalCase.tsx | `Students.tsx` |
| Files (utilities) | camelCase.ts | `mockData.ts` |
| Interfaces | PascalCase + DTO suffix | `StudentDTO`, `AlertDTO` |
| Enums | PascalCase | `StudentStatus`, `AlertLevel` |
| Variables/Functions | camelCase | `filteredStudents`, `handleClick` |

#### Import Organization
```typescript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { LineChart } from 'recharts';

// 3. Local types
import { StudentDTO, StudentStatus } from '../types';

// 4. Local utilities/data
import { mockStudents } from '../data/mockData';
```

#### Component Structure
```typescript
/**
 * Component description
 */
const ExampleComponent: React.FC = () => {
  // 1. State declarations
  const [data, setData] = useState<DataType[]>([]);

  // 2. Effects
  useEffect(() => { ... }, []);

  // 3. Event handlers
  const handleAction = () => { ... };

  // 4. Render
  return ( ... );
};

export default ExampleComponent;
```

#### Types
- All types centralized in `src/types/index.ts`
- Use `?` for optional properties
- Match backend DTO structure exactly

---

## Design Patterns (MANDATORY)

### Strategy Pattern - Grading
```
IGradingStrategy (interface)
├── Scale10Strategy (Vietnamese 10-point)
├── Scale4Strategy (US 4-point GPA)
└── PassFailStrategy (Binary)
```

### Observer Pattern - Alerts
```
GradeSubject (notifies on grade changes)
├── GpaRecalculatorObserver
└── RiskDetectorObserver (creates Alerts)
```

### State Pattern - Student Lifecycle
```
StudentState (abstract)
├── NormalState (GPA >= 2.0)
├── AtRiskState (1.5 <= GPA < 2.0)
├── ProbationState (GPA < 1.5)
└── GraduatedState
```

### Abstraction-Occurrence Pattern
- `Course` = Abstraction (course definition)
- `CourseOffering` = Occurrence (specific semester instance)

### Composite Pattern - Grade Entries
- `GradeEntry` with self-referencing `parent_id`
- Leaf nodes: Individual scores
- Composite nodes: Aggregated components (e.g., Lab → Quiz1, Quiz2)

---

## OCL Constraints (Enforce in Entities)

```
GradeEntry.score: >= 0 AND <= 10
GradeEntry.weight: >= 0 AND <= 1
Student.gpa: >= 0.0 AND <= 4.0
Enrollment.finalScore: >= 0 AND <= 10
Alert.createdAt: <= CURRENT_TIMESTAMP
```

---

## Project Structure

```
backend/src/main/java/com/spts/
├── config/          # App configuration (Swagger, CORS)
├── controller/      # REST controllers
├── dto/             # Data Transfer Objects
├── entity/          # JPA entities
├── exception/       # Custom exceptions
├── patterns/        # Design pattern implementations
│   ├── strategy/    # Grading strategies
│   ├── observer/    # Alert observers
│   └── state/       # Student states
├── repository/      # Data access layer
└── service/         # Business logic

frontend/src/
├── components/      # Reusable UI components
├── pages/           # Page components
├── types/           # TypeScript definitions (index.ts)
├── data/            # Mock data
└── App.tsx          # Root component with routing
```

---

## Key Documentation

| Document | Purpose |
|----------|---------|
| `docs/agents/PROJECT_CHARTER.md` | Project vision, team roles |
| `docs/agents/TECH_STACK.md` | Technology decisions |
| `docs/agents/SRS_AI_CONTEXT.md` | Domain model, constraints |
| `docs/agents/ERD.md` | Database design |
| `docs/todo/MEMBER*.md` | Task tracking per team member |

---

## Common Pitfalls

1. **DO NOT** suppress type errors (`as any`, `@ts-ignore`)
2. **DO NOT** create empty catch blocks
3. **DO NOT** mix Vietnamese and English in code (100% English)
4. **DO** use constructor injection (not `@Autowired` on fields)
5. **DO** use `@Transactional(readOnly = true)` for read operations
6. **DO** validate OCL constraints in entity setters
7. **DO** match frontend TypeScript types with backend DTOs exactly

---

## Commit Format

```
<type>: <description in English>

Types: feat, fix, refactor, test, docs, chore
Example: feat: implement observer pattern for grade updates
```

---

*Last Updated: 2026-01-17*
