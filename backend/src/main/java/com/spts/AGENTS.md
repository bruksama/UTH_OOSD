# Backend Module - com.spts

**Parent:** [Root AGENTS.md](../../../../../AGENTS.md)

## Structure

```
com.spts/
├── config/        # CORS, Swagger, DataInitializer
├── controller/    # REST endpoints (6 controllers)
├── dto/           # Request/Response objects (6 DTOs)
├── entity/        # JPA entities (13 files incl. enums)
├── exception/     # GlobalExceptionHandler + custom exceptions
├── patterns/      # OOSD patterns → see patterns/AGENTS.md
├── repository/    # Spring Data JPA interfaces (6)
└── service/       # Business logic (6 services)
```

## Where to Look

| Task | Location |
|------|----------|
| Add new entity | `entity/` + `repository/` + `dto/` |
| Add endpoint | `controller/` + update Swagger tags |
| Business logic | `service/` layer only |
| Pattern integration | `patterns/` + service hooks |
| Exception handling | `exception/GlobalExceptionHandler.java` |

## Key Patterns (THIS MODULE)

1. **Constructor Injection** - NO `@Autowired` on fields
2. **Section Comments** - `// ==================== CRUD Operations ====================`
3. **DTO Conversion** - Private `convertToDTO()` methods in services
4. **Validation** - Bean Validation on entities, OCL in setters

## Entity Relationships

```
Student ──< Enrollment >── CourseOffering >── Course
   │              │
   ▼              ▼
 Alert       GradeEntry (self-referencing composite)
```

## TODO: Incomplete Observer Hooks

Files with unfinished observer pattern integration:
- `EnrollmentService.java` - TODO on enrollment changes
- `GradeEntryService.java` - TODO on grade changes

## Anti-Patterns

- DO NOT use field injection (`@Autowired` on private fields)
- DO NOT catch exceptions silently - use GlobalExceptionHandler
- DO NOT skip `@Transactional(readOnly = true)` for reads
