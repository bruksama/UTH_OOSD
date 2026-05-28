# Contributing to SPTS

Development workflow, environment setup, and testing guide.

---

## Prerequisites

| Requirement | Version | Verify |
|-------------|---------|--------|
| Java JDK | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| Docker | 20+ | `docker -version` (optional) |

---

## Environment Setup

### 1. Clone and Configure

```bash
git clone <repository-url>
cd UTH_OOSD

# Root environment (Docker PostgreSQL)
cp .env.example .env
# Edit: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD

# Frontend environment
cp frontend/.env.example frontend/.env
# Edit: Firebase config values from Firebase Console
```

### 2. Firebase Setup

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=<from-firebase-console>
VITE_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project-id>
VITE_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_APP_ID=<app-id>
```

**Backend**: Download service account JSON from Firebase Console > Project Settings > Service Accounts, place in `backend/src/main/resources/`.

### 3. Database Options

**Option A: Docker PostgreSQL (Recommended)**
```bash
docker-compose up -d
```

**Option B: H2 In-Memory (Quick Testing)**

Edit `backend/src/main/resources/application.properties`:
```properties
# Comment PostgreSQL, uncomment H2 section
spring.datasource.url=jdbc:h2:mem:spts_db;DB_CLOSE_DELAY=-1
spring.datasource.driverClassName=org.h2.Driver
spring.h2.console.enabled=true
```

---

## Development Commands

### Backend (Spring Boot)

```bash
cd backend

mvn spring-boot:run          # Start server (port 8080)
mvn compile                  # Compile only
mvn test                     # Run all tests
mvn test -Dtest=ClassName    # Run single test class
mvn clean install            # Full build
mvn package -DskipTests      # Package without tests
```

### Frontend (Vite + React)

```bash
cd frontend

npm install                  # Install dependencies
npm run dev                  # Start dev server (port 5173)
npm run build                # Production build
npm run preview              # Preview production build
npm run lint                 # ESLint check
npm run test                 # Run tests (watch mode)
npm run test:run             # Run tests once
npm run test:coverage        # Tests with coverage
```

### Docker

```bash
docker-compose up -d         # Start PostgreSQL
docker-compose down          # Stop
docker-compose down -v       # Stop and delete data
docker-compose logs -f       # View logs
```

---

## Running the Application

```bash
# Terminal 1: Database (if using Docker)
docker-compose up -d

# Terminal 2: Backend
cd backend && mvn spring-boot:run

# Terminal 3: Frontend
cd frontend && npm run dev
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console (if enabled)

---

## Project Structure

```
UTH_OOSD/
├── backend/                  # Spring Boot API
│   └── src/main/java/com/spts/
│       ├── controller/       # REST endpoints
│       ├── service/          # Business logic
│       ├── repository/       # Data access
│       ├── entity/           # JPA entities
│       ├── dto/              # Data transfer objects
│       └── patterns/         # Design patterns (Strategy, Observer, State)
├── frontend/                 # React + Vite
│   └── src/
│       ├── components/       # UI components
│       ├── pages/            # Page components
│       ├── services/         # API clients
│       └── types/            # TypeScript types
├── docs/                     # Documentation
└── docker-compose.yml        # PostgreSQL container
```

---

## Testing

### Backend Tests
```bash
cd backend
mvn test                              # All tests
mvn test -Dtest=StudentServiceTest    # Single class
mvn test -Dtest=*Test#methodName      # Single method
```

### Frontend Tests
```bash
cd frontend
npm run test:run                      # All tests
npm run test:coverage                 # With coverage report
```

---

## Code Style

- **Backend**: Follow Spring Boot conventions, use Lombok annotations
- **Frontend**: ESLint + TypeScript strict mode, Tailwind CSS for styling
- **Commits**: Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)

---

## API Documentation

Interactive API docs available at http://localhost:8080/swagger-ui.html when backend is running.

Key endpoints:
- `GET/POST /api/students` - Student CRUD
- `GET/POST /api/courses` - Course CRUD
- `GET/POST /api/enrollments` - Enrollment management
- `GET/POST /api/grade-entries` - Grade management (Composite pattern)
- `GET/POST /api/alerts` - Alert system (Observer pattern)
