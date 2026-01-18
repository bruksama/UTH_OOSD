# Frontend Module

**Parent:** [Root AGENTS.md](../../AGENTS.md)

## Structure

```
src/
├── components/   # Reusable UI (Layout.tsx)
├── pages/        # Route pages (4: Dashboard, Students, Courses, Alerts)
├── types/        # ALL types in index.ts (match backend DTOs exactly)
├── data/         # mockData.ts for dev
├── App.tsx       # Router + Layout wrapper
└── main.tsx      # Entry point
```

## Where to Look

| Task | Location |
|------|----------|
| Add page | `pages/` + update `App.tsx` routes |
| Add component | `components/` |
| Add/modify types | `types/index.ts` ONLY |
| Mock data | `data/mockData.ts` |

## Type Synchronization

**CRITICAL:** Frontend types MUST match backend DTOs exactly.

```
Backend DTO              →  Frontend Type
StudentDTO.java          →  StudentDTO (types/index.ts)
AlertDTO.java            →  AlertDTO (types/index.ts)
```

Enums must have identical values:
```typescript
// CORRECT - matches backend exactly
enum StudentStatus {
  NORMAL = 'NORMAL',
  AT_RISK = 'AT_RISK',  // not 'AtRisk'
}
```

## Tailwind Custom Colors

Use project-defined semantic colors:
```
status-normal     #10b981  Student in good standing
status-atRisk     #f59e0b  Warning status
status-probation  #ef4444  Critical status
status-graduated  #6366f1  Completed

alert-info        #3b82f6
alert-warning     #f59e0b
alert-high        #f97316
alert-critical    #ef4444
```

## Component Pattern

```typescript
const Page: React.FC = () => {
  // 1. State
  const [data, setData] = useState<Type[]>([]);
  
  // 2. Effects
  useEffect(() => { /* fetch */ }, []);
  
  // 3. Handlers
  const handleX = () => {};
  
  // 4. Render
  return (<div>...</div>);
};
export default Page;
```

## Anti-Patterns

- NEVER create types outside `types/index.ts`
- NEVER use inline type definitions
- NEVER hardcode colors - use Tailwind theme
- NEVER `as any` or `@ts-ignore`
