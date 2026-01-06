# Deploy to Vercel + Supabase

This app is a Vite + React SPA that talks directly to Supabase from the browser using the public (anon/publishable) API key. No server is required for the Supabase features used here. The `backend/` folder is only for optional local uploads/FFmpeg processing and is not deployed to Vercel.

## 1) Supabase project setup

- Get your project URL and publishable (anon) key from Project Settings → API.
- In Authentication → URL Configuration, set:
  - Site URL: your production domain (e.g. `https://YOUR-APP.vercel.app`)
  - Redirect URLs: add both your production domain and `http://localhost:5173`

Tables expected by the app:

- `profiles(id uuid primary key, name text, email text unique, avatar text, role text, password_hint text)`
- `projects(id uuid primary key, name text, description text, members text[] default '{}', status text, last_activity timestamptz)`
- `messages(id uuid primary key default gen_random_uuid(), project_id text, user_id text, content text, timestamp timestamptz, type text)`
- `announcements(id uuid primary key default gen_random_uuid(), project_id text, author_id text, content text, timestamp timestamptz, reactions jsonb)`

Recommended RLS policies (adjust as needed):

```sql
-- Enable RLS
alter table profiles enable row level security;
alter table projects enable row level security;
alter table messages enable row level security;
alter table announcements enable row level security;

-- Profiles: users can read all, update their own
create policy "profiles_read" on profiles for select using (true);
create policy "profiles_self_update" on profiles for update using (auth.uid() = id);

-- Projects: allow read to all authenticated; allow insert to authenticated
create policy "projects_read" on projects for select using (auth.role() = 'authenticated');
create policy "projects_insert" on projects for insert with check (auth.role() = 'authenticated');

-- Messages: read project messages; insert own
create policy "messages_read" on messages for select using (auth.role() = 'authenticated');
create policy "messages_insert" on messages for insert with check (auth.uid() = user_id::uuid);

-- Announcements: read all; insert authenticated
create policy "announcements_read" on announcements for select using (auth.role() = 'authenticated');
create policy "announcements_insert" on announcements for insert with check (auth.role() = 'authenticated');
```

If your `user_id` columns are plain text not UUID, adjust the casts accordingly.

## 2) Add environment variables on Vercel

In Vercel → Project → Settings → Environment Variables, add the following for **Production**, **Preview**, and **Development**:

- `VITE_SUPABASE_URL` = `https://YOUR-PROJECT-REF.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = your publishable anon key
- `VITE_SITE_URL` = your production URL (e.g. `https://YOUR-APP.vercel.app`)

Optional (local backend only):
- `VITE_BACKEND_URL` = `http://localhost:8080`

Note: Do not expose the Supabase service role key in the browser. If you need admin operations, store `SUPABASE_SERVICE_ROLE_KEY` only in server-side functions or a separate backend.

## 3) Deploy

- Import the repo in Vercel. Framework preset: Vite. The default `npm run build` and `dist/` output work.
- After the first deploy, verify authentication emails open at your Vercel domain.

## 4) Local development

- Copy `.env.example` → `.env` and fill values
- `npm install`
- `npm run dev`

## 5) Troubleshooting

- If you see "Supabase credentials are missing", ensure the three `VITE_*` vars are present and the app was redeployed.
- If messages/announcements are not saving, confirm RLS policies and that you are logged in.
- For Realtime updates, ensure Database → Replication is enabled for the `messages` and `announcements` tables (or Realtime is turned on in Table editor).
