---
phase: planning
title: Operational Settings Implementation Plan
description: Task breakdown for implementing Operational Settings
---

# Operational Settings Implementation Plan

## Milestones
- [ ] Milestone 1: Backend Foundation (Models, Schema, Migration)
- [ ] Milestone 2: Service & API Implementation
- [x] Milestone 3: Frontend Integration & Testing

## Task Breakdown

### Phase 1: Foundation (Backend)
- [x] Task 1.1: Create basic module structure (`backend/app/modules/settings`)
- [x] Task 1.2: Define `models.py` (SQLModel for `OperatingHour`, `ExceptionDate`)
- [x] Task 1.3: Generate Alembic migration and apply to DB

### Phase 2: Core Logic (Backend)
- [x] Task 2.1: Define Pydantic schemas in `schemas.py`
- [x] Task 2.2: Implement `SettingsService` logic (Get all, Transactional Upsert) in `service.py`
- [x] Task 2.3: Implement `router.py` with Authentication (`require_manager`)
- [x] Task 2.4: Register router in `main.py` (via `app/api/router.py`)
- [x] Task 2.5: Verify API via Swagger UI (Verified via curl)

### Phase 3: Integration (Frontend)
- [x] Task 3.1: Update `actions.ts` to call FastAPI endpoints instead of Mock DB
- [x] Task 3.2: Ensure Type safety matches Backend Schemas
- [x] Task 3.3: End-to-end testing (Load Page -> Update -> Reload)

## Dependencies
- Backend Framework (FastAPI, SQLModel) setup - DONE
- Auth Module (Supabase) - DONE (Role checks available)

## Timeline & Estimates
- **Backend**: 2-3 hours
- **Frontend Integration**: 1-2 hours
- **Testing**: 0.5 hours

## Risks & Mitigation
- **Risk**: Transaction failure leaves partial data.
- **Mitigation**: Use `async with session.begin()` for atomic commits.
