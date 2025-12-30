---
phase: requirements
title: Operational Settings Requirements
description: Manage opening hours and exception dates for Synapse Spa
---

# Operational Settings Requirements

## Problem Statement
**What problem are we solving?**

- **Use Case**: Spas have specific operating hours (e.g., Mon-Sun, 8 AM - 8 PM) and special days off (holidays, maintenance, team building).
- **Pain Point**: Without a centralized configuration, the Scheduling Engine (RCPSP) cannot accurately validate bookings. Customers might book slots when the spa is closed.
- **Current Situation**: Hardcoded hours or ad-hoc manual checks, leading to errors.

## Goals & Objectives
**What do we want to achieve?**

- **Primary**: Centralize the management of operating hours and exception dates in the database.
- **Secondary**: Provide an intuitive UI for Managers to update these settings easily.
- **Non-goals**: Managing individual employee shifts (shift roster is a separate feature).

## User Stories & Use Cases
**How will users interact with the solution?**

1.  **View Operating Hours (Manager)**:
    - As a Manager, I want to see the current weekly schedule (Mon-Sun) to verify opening/closing times.
2.  **Update Operating Hours (Manager)**:
    - As a Manager, I want to edit opening/closing times for specific weekdays or set a day as "Closed" so the booking system reflects changes immediately.
3.  **Manage Exception Dates (Manager)**:
    - As a Manager, I want to add specific dates (e.g., Tet Holiday) as closed or with modified hours to prevent bookings on those dates.
    - As a Manager, I want to remove exception dates if plans change.
4.  **Validate Booking (System)**:
    - As the Booking Engine, I need to look up these settings to determine valid time slots for customer bookings.

## Success Criteria
**How will we know when we're done?**

- [ ] Manager can view and update regular operating hours (Mon-Sun).
- [ ] Manager can add/remove exception dates.
- [ ] Backend API (`GET`, `PUT`) is fully functional.
- [ ] Database stores configuration correctly.
- [ ] Frontend reflects the saved state after reload.

## Constraints & Assumptions
**What limitations do we need to work within?**

- **Technical**: Must use FastAPI + SQLModel (Backend) and Next.js 16 (Frontend).
- **Time**: Basic CRUD must be completed in this sprint.
- **Assumption**: There is only one active branch (Synapse_KL) for the MVP scope (no multi-branch complexity yet).

## Questions & Open Items
**What do we still need to clarify?**

- None at this stage. Logic is standard for booking systems.
