---
trigger: always_on
---
# Domain Rules: Spa Management (Agent-Optimized)

## 1. Core Problem
- **Domain**: Online Spa Customer Care.
- **Engine**: Service Scheduling (RCPSP problem).
- **Tech**: Google OR-Tools (CP-SAT).

## 2. Scheduling Constraints (Strict)
- **RESOURCES**: Technician skills, Function beds, Specialized equipment.
- **TIME**: Business hours, Service duration, Recovery time (break between sessions).
- **GOAL**: Feasible (No conflicts) > Load Balancing > Fair allocation.

## 3. Actors & Scope
- **MANAGER**: Full access, Analytics, HR, Finance.
- **RECEPTIONIST**: Booking grid, Check-in/out, POS.
- **TECHNICIAN**: My schedule, Service execution (Mobile-first).
- **CUSTOMER**: Online booking, Personal profile, History.