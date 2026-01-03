# IMPL_PLAN: SERVICES MODULE REFACTOR & FIXES (v1)

## 1. BACKEND: PAGINATION & OPTIMIZATION
**Problem**: API `/services` returns ALL rows. Crash risk > 200 items.
**Solution**: Implement Offset/Limit Pagination.

### Tasks
- [ ] **Schema Update**: Update `ServiceListResponse` in `schemas.py` to include `total`, `page`, `limit`.
- [ ] **Service Layer**: Update `get_all_services` in `service.py` to accept `page/limit`, return `(services, total)`.
- [ ] **Router**: Update `GET /services` to consume new signature.

## 2. FRONTEND: FORM VALIDATION LOGIC
**Problem**: Changing `duration` breaks `resource` usage times silently.
**Solution**: Active Form Guard using `useWatch`.

### Tasks
- [ ] **Hook**: Create `useServiceFormLogic` hook extracting logic from Sheet.
- [ ] **Logic**: Watch `duration` and `buffer_time`.
    - If `duration` < `max(resource.end_time)`, auto-trim usage or show Warning Alert.
- [ ] **UI**: Add visual indicator when resources are auto-adjusted.

## 3. FRONTEND: PERFORMANCE (CONDITIONAL FETCHING)
**Problem**: Loading "Categories" tab waits for "Services" data (heavy).
**Solution**: SearchParams-based Data Fetching in `page.tsx`.

### Tasks
- [ ] **Page Logic**: In `ServiceManagement`, checks `searchParams.view`.
- [ ] **Switch Case**:
    - `view=services` (default): Fetch Services + Categories + skills.
    - `view=resources`: Fetch Resources + Groups only.
    - `view=categories`: Fetch Categories only.
- [ ] **Skeleton**: Split `ServiceManagementSkeleton` into granular skeletons (`ServicesSkeleton`, `ResourcesSkeleton`).

## 4. UX: DELETE & MAINTENANCE
**Problem**: "Delete" button trap; "Maintenance" items selectable.
**Solution**: Disable logic & Filtering.

### Tasks
- [ ] **Resource Tab**: Disable "Delete Group" button if `resource_count > 0`.
- [ ] **Service Form**: Filter out `status != ACTIVE` resources in `ServiceResourceTab` dropdown.

## 5. CLEANUP: ORPHANED IMAGES (LOW PRIORITY)
**Problem**: Unused images accumulate.
**Solution**: (Defer to Phase 2) Implement "Confirm Upload" flow or cronjob.
