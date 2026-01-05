# Research: Best Practices for Staff Management UX/UI

## 1. Core Workflow: Invitation-Based Onboarding
Because "Staff are invited users", the workflow changes from direct creation to an invitation model.

### 1.1 The Invitation Flow (Admin Side)
*   **Action**: Admin clicks "Invite Staff" (instead of "Create Staff").
*   **Input**: Minimal details required initially:
    *   Email (Mandatory - Unique ID).
    *   Role (Manager / Receptionist / Technician).
    *   *Optional*: Full Name (can be filled by staff later), Phone.
*   **Status Indicators**:
    *   `Pending`: Invitation sent, not yet activated.
    *   `Active`: Staff has set password and logged in.
    *   `Suspended`: Access revoked.
    *   `Expired`: Invitation link expired (needs "Resend" action).

### 1.2 The Onboarding Flow (Staff Side)
*   **Email**: Received via system (e.g., SendGrid/Resend). Subject: "Invitation to join Synapse Spa".
*   **Landing Page**: "Welcome [Email], please set your password".
*   **First Login**:
    *   Prompt to update profile (Avatar, Display Name, Phone).
    *   *Self-Service Skills*: Technician can check off skills they have (subject to Manager approval).

## 2. Staff List UI Patterns (Master-Detail)

### 2.1 Card vs Table
*   **Recommendation**: **Hybrid**.
    *   **Table View (Default)**: Best for admin to quick-scan statuses, roles, and Last Seen.
    *   **Columns**: Avatar + Name, Role (Badge), Status (Dot Indicator), Skills (Count or Top 3 tags), Mobile.
*   **Visual Cues**:
    *   **Status Dot**: 🟢 Active, 🟡 Pending, 🔴 Suspended.
    *   **Role Badge**: Distinct colors for Manager vs Tech vs Receptionist.

### 2.2 Detail View (The "Staff Profile")
When clicking a row, open a detailed Sheet or Page (Master-Detail) containing:
1.  **Profile Header**: Large Avatar, Name, Role, Status Actions (Suspend/Resend Invite).
2.  **Tabs**:
    *   **General**: Contact info, Bio.
    *   **Skills & Services**: A "Matrix" view showing which services this staff can perform.
    *   **Working Hours**: Weekly template (e.g., Mon-Fri, 9am-6pm).
    *   **History**: Booking history, performance metrics (Phase 2).

## 3. Skill Management Pattern
*   **Challenge**: Spa services are granular (Facial Basic, Facial Advanced).
*   **UI Solution**: **Categorized Tag Selector**.
    *   Group skills by Category (e.g., "Face", "Body", "Machine").
    *   UI: Checkbox list or Multi-select with search.
    *   *Advanced*: Proficiency level (1-5 stars) for determining "Preferred Technician".

## 4. Mobile Responsiveness (Technician View)
*   Technicians mostly use mobile phones to check schedules.
*   **Mobile Experience**:
    *   Bottom Navigation.
    *   "My Schedule" as the home tab.
    *   "Upcoming Appointments" card list.

## 5. Security & RBAC Implementation
*   **Invitation Link**: Must be signed/hashed token with expiration (e.g., 48h).
*   **Pending State**: "Invited" staff cannot be assigned to bookings until they activate (or can be assigned but with a warning).

## 6. Implementation Strategy for Synapse
1.  **Backend**:
    *   `User` table (Auth) vs `Staff` table (Profile). Linked by ID.
    *   `Staff` table has `invitation_token`, `invitation_expires_at`.
2.  **Frontend**:
    *   Reuse `Resources` Master-Detail layout.
    *   Replace `Create Form` with `Invite Form`.
    *   Add `Resend Invite` button for pending users.
