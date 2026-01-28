# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (Spring Boot)
- **Run server**: `mvn spring-boot:run` (runs on port 8080)
- **Run all tests**: `mvn test`
- **Run single test class**: `mvn test -Dtest=ClassName`
- **Run single test method**: `mvn test -Dtest=ClassName#methodName`
- **Build/Package**: `mvn clean install` or `mvn package -DskipTests`
- **Clean**: `mvn clean`

### Frontend (React + Vite)
- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev` (runs on port 5173)
- **Run all tests**: `npm run test:run`
- **Run tests (watch)**: `npm run test`
- **Type check**: `npx tsc --noEmit`
- **Lint**: `npm run lint`
- **Build**: `npm run build`

### Infrastructure
- **Start Database**: `docker-compose up -d` (PostgreSQL)
- **Stop Database**: `docker-compose down`
- **Logs**: `docker-compose logs -f`

## Architecture & Structure

### Backend (`backend/`)
Spring Boot 3.2 application using Java 17.
- **Structure**:
  - `controller/`: REST endpoints (`/api/...`)
  - `service/`: Business logic
  - `repository/`: Data access (Spring Data JPA)
  - `entity/`: JPA entities mapping to DB tables
  - `dto/`: Data Transfer Objects
  - `patterns/`: Implementation of OOSD patterns
- **Design Patterns**:
  - **Strategy**: Grade calculation scales (10-point, 4-point, Pass/Fail)
  - **Observer**: Alert generation based on GPA changes
  - **State**: Student status tracking (Normal, At-Risk, Probation, Graduated)
  - **Composite**: Grade entry hierarchy

### Frontend (`frontend/`)
React 18 application built with Vite and TypeScript.
- **Styling**: Tailwind CSS
- **State/Auth**: Firebase Authentication
- **Structure**:
  - `components/`: Reusable UI components
  - `pages/`: Route-level page components
  - `services/`: API client functions connecting to backend
  - `types/`: TypeScript definitions

### Database
- Primary: PostgreSQL (via Docker)
- Dev/Test fallback: H2 In-Memory (configured in `application.properties`)
