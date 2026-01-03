# IMPLEMENTATION SUMMARY - STAFF MODULE MIGRATION

## ✅ Completed Tasks

### 1. Database Migration (Supabase MCP)
- [x] **New Table `profiles`**: Created to sync with `auth.users` via trigger.
- [x] **New Enum `user_role`**: Defined roles (`manager`, `technician`, etc.).
- [x] **Triggers**: Implemented `handle_new_user` to auto-create profiles and staff entries upon user creation/invitation.
- [x] **Cleanup**: Cleaned up legacy `staff_profiles` data and enforced FK to `profiles`.

### 2. Backend Integration (FastAPI)
- [x] **Supabase SDK**: Installed `supabase` package and configured client with Service Role Key.
- [x] **Models**: Refactored `StaffProfile` to link with `UserProfile`.
- [x] **Endpoints**:
    - Added `POST /staff/invite` to use Supabase Admin API.
    - Updated `GET /staff` and `GET /staff/{id}` to join with profile data.
    - Updated `PUT /staff/{id}` to handle profile updates.
- [x] **Config**: Added `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` to Settings.

### 3. Frontend Integration (Next.js)
- [x] **Actions**: Added `inviteStaffAction` to handle backend invitation endpoint.
- [x] **Schemas**: Added `staffInviteSchema` for validation.
- [x] **UI**: Completely refactored `StaffFormSheet` to support "Invite Mode" (Email, Role, Name) vs "Edit Mode" (Bio, Skills, etc.).

## 🚀 Next Steps for User
1. **Environment Variables**: Ensure `.env` has:
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   FRONTEND_URL=http://localhost:3000
   ```
2. **Restart Backend**: Restart the FastAPI server to load new settings and UV dependencies.
3. **Verify**: Test the invite flow via the "Mời nhân viên" button.
