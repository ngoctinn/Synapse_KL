---
phase: testing
title: Operational Settings Testing Strategy
description: Test plan for Operational Settings
---

# Operational Settings Testing Strategy

## Test Coverage Goals
- **Unit Testing**: 100% coverage for `SettingsService` logic.
- **Integration Testing**: Verify API Endpoints return correct HTTP codes.

## Test Scenarios

### 1. Backend Service Tests
- [ ] **Get Default**: When DB is empty, `get_settings` returns default schedule.
- [ ] **Update Success**: Valid data updates DB correctly (overwrites old data).
- [ ] **Data Integrity**: `operating_hours` always has 7 records (0-6) after update (if logic mandates).

### 2. API Tests
- [ ] **Auth Check**: `PUT /settings/operational` without token -> 401.
- [ ] **Role Check**: `PUT` with 'Technician' role -> 403.
- [ ] **Validation**: `PUT` with invalid time string ("25:00") -> 422.

### 3. Manual Frontend Verification
- [ ] Open Settings page -> Should load default/current settings.
- [ ] Change Monday open time to 09:00 -> Save -> Reload -> Should show 09:00.
- [ ] Add Exception Date (Next Friday, Closed) -> Save -> Reload -> Should check list.
- [ ] Verify validation errors appear if End Time < Start Time (Frontend validation).

## Test Data
- **Default Schedule**: Mon-Sun, 08:00 - 20:00.
- **Test Exception**: 2025-01-01 (New Year), Closed.
