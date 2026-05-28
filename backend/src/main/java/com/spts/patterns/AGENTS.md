# Design Patterns Module

**Parent:** [Backend AGENTS.md](../AGENTS.md)

## Overview

OOSD-mandated design pattern implementations. Each subdirectory = one pattern.

## Structure

```
patterns/
├── strategy/    # Grading calculations
├── observer/    # Grade change notifications  
└── state/       # Student status lifecycle
```

## Pattern Quick Reference

### Strategy Pattern (`strategy/`)

**Interface:** `IGradingStrategy`
**Implementations:**
| Strategy | Scale | Passing | Usage |
|----------|-------|---------|-------|
| `Scale10Strategy` | 0-10 | 5.0 | Vietnamese grading |
| `Scale4Strategy` | 0-4 | 2.0 | US GPA scale |
| `PassFailStrategy` | P/F | 5.0 | Binary grading |

**Factory:** `GradingStrategyFactory.getStrategy(GradingType)`

### Observer Pattern (`observer/`)

**Subject:** `GradeSubject` - notifies observers on grade changes
**Observers:**
- `GpaRecalculatorObserver` (priority 0) - recalculates student GPA
- `RiskDetectorObserver` (priority 10) - creates alerts for at-risk

**Integration:** Services call `gradeSubject.notifyObservers(student, enrollment, entry)`

### State Pattern (`state/`)

**Abstract:** `StudentState`
**Concrete States:**
| State | GPA Range | canRegister | maxCredits |
|-------|-----------|-------------|------------|
| `NormalState` | ≥ 2.0 | true | 21 |
| `AtRiskState` | 1.5 - 2.0 | true | 15 |
| `ProbationState` | < 1.5 | false | 12 |
| `GraduatedState` | - | false | 0 |

**Transition:** `state.handleGpaChange(student, newGpa)` returns new state

## Where to Modify

| Task | File(s) |
|------|---------|
| Add grading scale | New strategy + update factory |
| Add grade observer | New observer + register in config |
| Modify state rules | Concrete state + transitions |

## Anti-Patterns

- NEVER modify interface contracts without updating all implementations
- NEVER add state transition logic outside state classes
- NEVER bypass factory for strategy instantiation
