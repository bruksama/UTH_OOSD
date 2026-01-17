# SPTS - Student Performance Tracking System

Analytics Engine for tracking student academic performance, GPA calculation, and early warning system.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Setup Options](#setup-options)
  - [Option 1: Docker + PostgreSQL (Recommended)](#option-1-docker--postgresql-recommended)
  - [Option 2: H2 In-Memory Database (Quick Testing)](#option-2-h2-in-memory-database-quick-testing)
  - [Option 3: Local PostgreSQL/MySQL](#option-3-local-postgresqlmysql)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Design Patterns](#design-patterns)
- [API Documentation](#api-documentation)
- [Development Commands](#development-commands)

---

## Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Java JDK | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| Docker (optional) | 20+ | `docker -version` |

---

## Quick Start

**Fastest way to run (using H2 in-memory database):**

```bash
# Terminal 1: Backend
cd backend
# Edit application.properties to use H2 (see Option 2 below)
mvn spring-boot:run

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

- Backend: http://localhost:8080
- Frontend: http://localhost:5173
- Swagger UI: http://localhost:8080/swagger-ui.html

---

## Setup Options

### Option 1: Docker + PostgreSQL (Recommended)

Best for development with persistent data.

**Step 1: Configure environment variables**

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your preferred values
```

Example `.env`:
```env
POSTGRES_DB=spts_db
POSTGRES_USER=spts_user
POSTGRES_PASSWORD=spts_password
```

**Step 2: Start PostgreSQL container**

```bash
docker-compose up -d
```

Verify the container is running:
```bash
docker ps
# Should show spts_postgres container
```

**Step 3: Run the backend**

```bash
cd backend
mvn spring-boot:run
```

The application will automatically connect to PostgreSQL using credentials from `.env`.

---

### Option 2: H2 In-Memory Database (Quick Testing)

Best for quick testing without external database setup. Data is lost when application stops.

**Step 1: Modify `backend/src/main/resources/application.properties`**

Comment out PostgreSQL config and uncomment H2 config:

```properties
# Comment out PostgreSQL
# spring.datasource.url=jdbc:postgresql://localhost:5432/spts_db
# spring.datasource.driverClassName=org.postgresql.Driver
# spring.datasource.username=${POSTGRES_USER:spts_user}
# spring.datasource.password=${POSTGRES_PASSWORD:spts_password}
# spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Uncomment H2
spring.datasource.url=jdbc:h2:mem:spts_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
```

**Step 2: Run the backend**

```bash
cd backend
mvn spring-boot:run
```

H2 Console available at: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:spts_db`
- Username: `sa`
- Password: (leave empty)

---

### Option 3: Local PostgreSQL/MySQL

**PostgreSQL:**

```sql
-- Create database
CREATE DATABASE spts_db;

-- Create user (optional)
CREATE USER spts_user WITH PASSWORD 'spts_password';
GRANT ALL PRIVILEGES ON DATABASE spts_db TO spts_user;
```

Update `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/spts_db
spring.datasource.username=spts_user
spring.datasource.password=spts_password
```

**MySQL:**

```sql
CREATE DATABASE spts_db;
CREATE USER 'spts_user'@'localhost' IDENTIFIED BY 'spts_password';
GRANT ALL PRIVILEGES ON spts_db.* TO 'spts_user'@'localhost';
FLUSH PRIVILEGES;
```

Update `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/spts_db?useSSL=false&serverTimezone=UTC
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
spring.datasource.username=spts_user
spring.datasource.password=spts_password
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: http://localhost:5173

### Frontend Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Running the Application

### Development Mode

**Terminal 1 - Database (if using Docker):**
```bash
docker-compose up -d
```

**Terminal 2 - Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| API Docs (JSON) | http://localhost:8080/api-docs |
| H2 Console (if enabled) | http://localhost:8080/h2-console |

---

## Project Structure

```
UTH_OOSD/
├── backend/                      # Spring Boot Backend
│   ├── src/main/java/com/spts/
│   │   ├── config/              # App configuration (CORS, Swagger)
│   │   ├── controller/          # REST API endpoints
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── entity/              # JPA entities
│   │   ├── exception/           # Custom exceptions
│   │   ├── patterns/            # OOSD Design Patterns
│   │   │   ├── strategy/        # Grading strategies
│   │   │   ├── observer/        # Alert observers
│   │   │   └── state/           # Student states
│   │   ├── repository/          # Data access layer
│   │   └── service/             # Business logic
│   └── src/main/resources/
│       └── application.properties
├── frontend/                     # React + Vite Frontend
│   └── src/
│       ├── components/          # Reusable UI components
│       ├── pages/               # Page components
│       ├── types/               # TypeScript definitions
│       └── data/                # Mock data
├── docs/                         # Documentation
├── docker-compose.yml            # PostgreSQL container config
├── .env.example                  # Environment variables template
└── AGENTS.md                     # AI agent guidelines
```

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Language |
| Spring Boot | 3.2.5 | Framework |
| Spring Data JPA | - | ORM / Data Access |
| PostgreSQL | 15 | Production Database |
| H2 | - | Development Database |
| Maven | 3.8+ | Build Tool |
| SpringDoc OpenAPI | 2.3.0 | API Documentation |
| JUnit 5 + Mockito | - | Testing |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI Framework |
| TypeScript | 5.5 | Language |
| Vite | 5.4 | Build Tool |
| Tailwind CSS | 3.4 | Styling |
| React Router | 6.22 | Routing |
| Recharts | 2.12 | Charts |
| Axios | 1.6 | HTTP Client |

---

## Design Patterns

### Strategy Pattern (Grading)
Different grading scale implementations:
- `Scale10Strategy` - Vietnamese 10-point scale
- `Scale4Strategy` - US 4-point GPA scale
- `PassFailStrategy` - Binary pass/fail

### Observer Pattern (Alerts)
Automatic notifications on grade changes:
- `GpaRecalculatorObserver` - Recalculates student GPA
- `RiskDetectorObserver` - Detects at-risk students

### State Pattern (Student Lifecycle)
Student academic status management:
- `NormalState` - GPA >= 2.0
- `AtRiskState` - 1.5 <= GPA < 2.0
- `ProbationState` - GPA < 1.5
- `GraduatedState` - Completed requirements

### Composite Pattern (Grade Entries)
Hierarchical grade structure:
- Leaf nodes: Individual scores
- Composite nodes: Aggregated components (e.g., Lab -> Quiz1, Quiz2)

---

## API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

---

## Development Commands

### Backend

```bash
cd backend

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

### Frontend

```bash
cd frontend

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

### Docker

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f

# Reset database (delete volume)
docker-compose down -v
```

---

## Troubleshooting

### Backend won't start

1. **Port 8080 already in use**
   ```bash
   # Find process using port 8080
   netstat -ano | findstr :8080  # Windows
   lsof -i :8080                  # macOS/Linux
   ```

2. **Database connection failed**
   - Check if PostgreSQL/Docker is running
   - Verify credentials in `.env` match `application.properties`
   - Try H2 database for quick testing

3. **Maven build fails**
   ```bash
   mvn clean install -U  # Force update dependencies
   ```

### Frontend won't start

1. **Port 5173 already in use**
   - Vite will auto-select next available port
   
2. **Dependencies not installed**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## License

MIT License
