---
phase: implementation
title: Operational Settings Implementation Notes
description: Technical details for implementing Operational Settings
---

# Operational Settings Implementation Implementation Guide

## Code Structure

### Backend
Directory: `backend/app/modules/settings`
- `models.py`: Database entities.
- `schemas.py`: Request/Response DTOs.
- `service.py`: Business logic.
- `router.py`: API definitions.

## Implementation Details

### Data Persistence
- **Default State**: If DB is empty, the `get_settings` service should return a default 8 AM - 8 PM (Mon-Sun) schedule to avoid UI errors.
- **Time Format**: Use `datetime.time` objects in Python, serialized to `HH:MM` strings in JSON.

### Transactional Logic (`service.py`)
```python
async def update_settings(self, db: AsyncSession, settings: OperationalSettingsUpdate):
    async with db.begin():
        # Clear existing
        await db.execute(delete(OperatingHour))
        await db.execute(delete(ExceptionDate))

        # Insert new
        db.add_all([OperatingHour(**h.model_dump()) for h in settings.regular_operating_hours])
        db.add_all([ExceptionDate(**d.model_dump()) for d in settings.exception_dates])

        # Commit happens automatically on exit context if no error
```

### Frontend Integration
- **Server Action**:
  - Fetch token from cookies/header.
  - Call Backend API.
  - Handle errors (401, 403, 500) and return user-friendly messages.
  - `revalidatePath` to refresh cache.

## Error Handling
- **Database Connection**: Handle `SQLAlchemyError`.
- **Validation**: Pydantic will handle invalid Time/Date formats automatically.
- **Permissions**: Return 403 if user is not a Manager.
