# SPTS - Student Performance Tracking System

Analytics Engine for tracking student academic performance, GPA calculation, learning curve analysis, and early warning system.

## Project Structure

```
UTH_OOSD/
├── backend/                 # Spring Boot Backend
│   └── src/main/java/com/spts/
│       ├── config/         # Application configuration
│       ├── controller/     # REST controllers
│       ├── dto/            # Data Transfer Objects
│       ├── entity/         # JPA entities
│       ├── patterns/       # OOSD Design Patterns
│       │   ├── strategy/   # Grading strategies
│       │   ├── observer/   # Alert observers
│       │   └── state/      # Student states
│       ├── repository/     # Data access layer
│       └── service/        # Business logic
├── frontend/               # React + Vite Frontend
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── types/          # TypeScript definitions
│       └── data/           # Mock data
└── docs/                   # Documentation
    └── agents/             # AI context documents
```

## Tech Stack

### Backend
- Java 17 (LTS)
- Spring Boot 3.2.x
- Spring Data JPA (Hibernate)
- MySQL 8.0 / PostgreSQL 15
- Maven
- JUnit 5 + Mockito
- OpenAPI (Swagger)

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- React Router

## Getting Started

### Prerequisites
- Java JDK 17+
- Maven 3.8+
- Node.js 18+
- MySQL/PostgreSQL (or use H2 for development)

### Database Setup
```sql
CREATE DATABASE spts_db;
```

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
- Server: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Application: http://localhost:5173

## Design Patterns Implemented

### Strategy Pattern (Grading)
- `IGradingStrategy` - Interface
- `Scale10Strategy` - Vietnamese 10-point scale
- `Scale4Strategy` - US 4-point GPA scale
- `PassFailStrategy` - Binary pass/fail

### Observer Pattern (Alerts)
- `IGradeObserver` - Interface
- `GradeSubject` - Subject class
- `GpaRecalculatorObserver` - Recalculates GPA
- `RiskDetectorObserver` - Detects at-risk students

### State Pattern (Student Lifecycle)
- `StudentState` - Abstract class
- `NormalState` - GPA >= 2.0
- `AtRiskState` - 1.5 <= GPA < 2.0
- `ProbationState` - GPA < 1.5
- `GraduatedState` - Completed requirements

### Abstraction-Occurrence Pattern
- `Course` - Abstraction (course definition)
- `CourseOffering` - Occurrence (specific semester)

## OCL Constraints

1. `GradeEntry`: value >= 0 and value <= 10
2. `Student`: gpa >= 0.0 and gpa <= 4.0
3. `Alert`: createdDate <= currentDate

## Team Members

1. **Foundation Architect** - ERD, Entities, OCL constraints
2. **Logic Engineer** - Strategy, Composite patterns
3. **Behavioral Engineer** - Observer, State patterns
4. **UX Developer** - Dashboard, Charts, Mock API

## Development Workflow

1. Phase 1 (Day 1-2): Interface and DTO definitions
2. Phase 2 (Day 3-6): Implementation
3. Phase 3 (Day 7): Integration and Testing

## License

MIT License
