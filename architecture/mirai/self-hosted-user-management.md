# Self-Hosted Docker Supabase Auth & Multi-User Admin (`architecture/mirai/self-hosted-user-management.md`)

## 1. Description

The **Self-Hosted Docker Supabase Auth & Multi-User Admin** specification documents the multi-user architecture and administrative portal for self-hosted instances (e.g. running via Docker, Unraid, TrueNAS, Portainer, or private VPS).

In self-hosted deployments, instance administrators can connect their own **Supabase** backend (or self-hosted Supabase Docker container). This unlocks multi-user account authentication, an initial Super Admin setup wizard, user management administration, and cross-device synchronization of battery saves (`.sav`), emulator save states, playtime history, and favorites.

> **CRITICAL NOTE ON STORAGE**: ROM binaries are **never** stored inside Supabase database tables or Supabase Storage buckets. Supabase is strictly used for authentication, user profiles, relational metadata, and small compressed save files (`.sav` / `.state`). Large game binaries remain on local storage or user-provided cloud buckets (BYOS).

---

## 2. Detailed List of What It Will Do

### Core Capabilities
- **First-Run Super Admin Setup Wizard**:
  - On a fresh self-hosted installation, the app detects whether a Super Admin exists.
  - If no admin exists, it presents a guided onboarding screen to create the primary Super Admin account and configure instance policies (Open Registration vs Invite-Only).
- **Multi-User Account Authentication**:
  - Login / Sign-up via Email Magic Links, Password, or OAuth (GitHub / Discord).
  - Multi-profile switching with personalized themes, avatar studio, favorites, and playtime analytics.
- **Admin Management Portal**:
  - Accessible only to users with the `super_admin` or `admin` role.
  - Manage users: view registered accounts, assign roles (`super_admin`, `admin`, `member`, `guest`), enable/disable accounts, or reset sessions.
  - Server & Storage Diagnostics: View active database connections, total save states synced, and active storage allocations.
- **Cloud Save & Sync Engine**:
  - Automatically pushes compressed `.sav` battery RAM and `.state` emulator snapshots to the Supabase backend upon exiting a game.
  - Pulls latest save states on game start across mobile, desktop, and TV clients.

---

## 3. Detailed Logic Behind It

### Architecture Overview

```mermaid
graph TD
    A[Self-Hosted Docker Node Server] --> B[Supabase Backend (Docker / Cloud)]
    
    subgraph Supabase Services
        C[Supabase Auth (GoTrue)]
        D[PostgreSQL Database]
        E[Supabase Storage: /saves bucket]
    end
    
    B --> C
    B --> D
    B --> E
    
    F[Browser Client: Super Admin] -->|Manage Users & Roles| G[Admin Dashboard Modal]
    G -->|RPC: set_user_role / list_users| D
    
    H[Browser Client: User] -->|Play Game & Save| I[EmulatorJS]
    I -->|Commit .sav / .state| E
    I -->|Sync Playtime & Favorites| D
```

### Database Schema & Row-Level Security (RLS)

1. **Profiles Table (`public.profiles`)**:
   ```sql
   create table public.profiles (
     id uuid references auth.users on delete cascade primary key,
     username text unique not null,
     display_name text,
     avatar_config jsonb default '{}'::jsonb,
     role text default 'member' check (role in ('super_admin', 'admin', 'member', 'guest')),
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

2. **Game Saves Table (`public.game_saves`)**:
   ```sql
   create table public.game_saves (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references public.profiles(id) on delete cascade not null,
     game_id text not null,
     system_key text not null,
     save_type text check (save_type in ('sram', 'state')),
     storage_path text not null,
     checksum text not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
     unique(user_id, game_id, save_type)
   );
   ```

3. **Row-Level Security Policies**:
   - Users can only read and write their own save states and profile data (`auth.uid() = user_id`).
   - `super_admin` role has administrative rights to read user lists and update user statuses via PostgreSQL security definer functions.

4. **Environment Configuration for Docker**:
   ```bash
   # docker-compose.yml environment variables
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (optional, server-side only for admin actions)
   ```

---

## 4. Detailed Guide of How to Set It Up

1. **Configure Supabase Client (`src/services/supabaseClient.js`)**:
   - Initialize `@supabase/supabase-js` using environment variables or user-configured endpoint in settings.
2. **Implement Admin Portal UI**:
   - Create `src/components/admin/AdminPortalModal.jsx` with user table, role toggles, and system metrics.
3. **First-Run Setup Flow**:
   - If initial connection reveals zero registered profiles, display `src/components/admin/FirstRunAdminWizard.jsx`.
4. **Integrate with `useProfileManager.js` and `EmulatorModal.jsx`**:
   - Replace or augment local profile state with authenticated Supabase session.
   - Sync `.sav` and `.state` files to Supabase Storage bucket upon session termination.
