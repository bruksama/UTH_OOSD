# SPTS - Student Performance Tracking System

Analytics engine for tracking student academic performance, GPA calculation, and early warning system.

---

## Quick Start

```bash
# 1. Start database
docker-compose up -d

# 2. Start backend (Terminal 1)
cd backend && mvn spring-boot:run

# 3. Start frontend (Terminal 2)
cd frontend && npm install && npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Spring Boot 3.2, Java 17, Spring Data JPA |
| Database | PostgreSQL 15 (prod), H2 (dev) |
| Auth | Firebase Authentication |
| Docs | SpringDoc OpenAPI / Swagger |

---

## Design Patterns (OOSD)

- **Strategy** - Grading scales (10-point, 4-point GPA, Pass/Fail)
- **Observer** - Auto-alerts on GPA changes
- **State** - Student status (Normal, At-Risk, Probation, Graduated)
- **Composite** - Hierarchical grade entries

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/CONTRIB.md](docs/CONTRIB.md) | Development setup, commands, testing |
| [docs/RUNBOOK.md](docs/RUNBOOK.md) | Deployment, monitoring, troubleshooting |
| [Swagger UI](http://localhost:8080/swagger-ui.html) | Interactive API documentation |

---

## Project Structure

```
UTH_OOSD/
├── backend/          # Spring Boot API
├── frontend/         # React + Vite UI
├── docs/             # Documentation
├── docker-compose.yml
└── .env.example
```

---

## License

MIT License
