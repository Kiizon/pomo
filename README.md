# Pomo - Pomodoro Timer with Supabase

A Next.js Pomodoro timer with Google OAuth authentication and session tracking via Supabase.

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **Anon Key** from: Project Settings > API

### 2. Configure Environment Variables
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Set Up Google OAuth

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Create a new OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback`

2. In Supabase Dashboard > Authentication > Providers:
   - Enable Google provider
   - Add your Google Client ID and Client Secret

3. In Supabase Dashboard > Authentication > URL Configuration:
   - **Site URL**: Your production URL (e.g., `https://yourdomain.com`)
   - **Redirect URLs**: Add both:
     - `http://localhost:3000` (for development)
     - Your production URL

### 5. Install Dependencies & Run

```bash
npm install
npm run dev
```
