# SPTS Runbook

Deployment, monitoring, and troubleshooting guide.

---

## Deployment

### Development

```bash
# Start all services
docker-compose up -d                    # Database
cd backend && mvn spring-boot:run       # API
cd frontend && npm run dev              # UI
```

### Production Build

```bash
# Backend
cd backend
mvn clean package -DskipTests
java -jar target/student-performance-tracking-system-1.0.0-SNAPSHOT.jar

# Frontend
cd frontend
npm run build
# Deploy dist/ folder to static hosting
```

### Environment Variables

**Root `.env`** (Docker PostgreSQL):
```env
POSTGRES_DB=spts_db
POSTGRES_USER=spts_user
POSTGRES_PASSWORD=<secure-password>
```

**Frontend `.env`**:
```env
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=<key>
VITE_FIREBASE_AUTH_DOMAIN=<domain>
VITE_FIREBASE_PROJECT_ID=<project>
VITE_FIREBASE_STORAGE_BUCKET=<bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<id>
VITE_FIREBASE_APP_ID=<id>
```

**Backend** (`application.properties`):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/spts_db
spring.datasource.username=${POSTGRES_USER:spts_user}
spring.datasource.password=${POSTGRES_PASSWORD:spts_password}
firebase.service-account-path=/path/to/firebase-service-account.json
```

---

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:8080/api/auth/health

# Database connection
docker exec spts_postgres pg_isready -U spts_user -d spts_db
```

### Logs

```bash
# Docker PostgreSQL logs
docker-compose logs -f postgres

# Backend logs (in console or configure logback)
# Frontend: Browser DevTools console
```

### Key Metrics to Monitor

- API response times (Swagger UI shows response codes)
- Database connection pool
- Firebase authentication errors
- Student GPA alerts (Observer pattern triggers)

---

## Troubleshooting

### Backend Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Port 8080 in use | Another process | `netstat -ano \| findstr :8080` (Windows) or `lsof -i :8080` (Unix), kill process |
| Database connection failed | PostgreSQL not running | `docker-compose up -d` or check credentials |
| Maven build fails | Dependency issues | `mvn clean install -U` |
| `Malformed \uxxxx encoding` | Backslash in path | Use forward slashes in `application.properties` paths |
| Firebase init failed | Missing service account | Check `firebase.service-account-path` is correct absolute path |

### Frontend Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| `auth/invalid-api-key` | Bad Firebase config | Verify all `VITE_FIREBASE_*` values in `.env` |
| Network Error | Backend not running | Start backend, check `VITE_API_URL` |
| Module not found | Missing deps | `rm -rf node_modules && npm install` |
| Port 5173 in use | - | Vite auto-selects next port |

### Database Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Cannot connect | PostgreSQL not running | `docker-compose up -d` or start local PostgreSQL |
| Auth failed | Wrong credentials | Check `.env` matches `application.properties` |
| Tables not created | DDL mode | Ensure `spring.jpa.hibernate.ddl-auto=update` |

---

## Common Operations

### Reset Database

```bash
# Docker: Remove volume and recreate
docker-compose down -v
docker-compose up -d

# H2: Restart backend (in-memory, auto-resets)
```

### Create Admin User

1. Register via Firebase Console > Authentication > Add User
2. Copy the UID
3. Insert into database:
```sql
INSERT INTO users (firebase_uid, email, display_name, role, created_at)
VALUES ('<uid>', 'admin@example.com', 'Admin', 'ADMIN', NOW());
```

### Switch Database (PostgreSQL <-> H2)

Edit `backend/src/main/resources/application.properties`:
- Comment/uncomment the respective datasource sections
- Update Hibernate dialect accordingly

---

## Rollback Procedures

### Backend Rollback

```bash
# Keep previous JAR versions
cp target/app-1.0.0.jar backups/app-1.0.0-$(date +%Y%m%d).jar

# Rollback: stop current, start previous
pkill -f 'student-performance-tracking-system'
java -jar backups/app-previous.jar
```

### Database Rollback

```bash
# Before major changes, backup
docker exec spts_postgres pg_dump -U spts_user spts_db > backup.sql

# Restore
docker exec -i spts_postgres psql -U spts_user spts_db < backup.sql
```

### Frontend Rollback

```bash
# Keep previous builds
cp -r dist/ backups/dist-$(date +%Y%m%d)/

# Rollback: deploy previous dist folder
```

---

## Security Checklist

- [ ] Firebase service account JSON not in version control
- [ ] `.env` files in `.gitignore`
- [ ] Production uses strong database passwords
- [ ] CORS configured for production domains only
- [ ] HTTPS enabled in production
