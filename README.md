<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1h4FLDhL4PeeysSWsgdB2jYvX7zSvNTYF

## Environment Setup

Create a `.env` file in the project root and set:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
VITE_SITE_URL=http://localhost:5173
VITE_BACKEND_URL=http://localhost:8080
```

Restart the dev server after changes.

Note: If port 8080 is busy, the backend will automatically retry on the next available port (e.g., 8081). Update `VITE_BACKEND_URL` to match the actual backend port, or set `PORT=8080` in `.env` to force a specific port.

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   `npm install`
2. Start the app:
   `npm run dev`

## Build & Preview

1. Build:
   `npm run build`
2. Preview production build:
   `npm run preview`

## Extension Integration (Local)

Load your local extension and verify the SCHMER_* protocol:

- In Chrome, open `chrome://extensions`, enable Developer mode, click "Load unpacked", and select:
  `C:\\Users\\proka\\Downloads\\extension\\screen-recorder-v1.0.0`
- Host permissions: ensure your manifest allows your app host(s), e.g. `http://localhost/*`, `https://localhost/*`, and your deployed domain(s).
- Messaging: app pages send `window.postMessage({ type: 'SCHMER_*', payload }, '*')`; the content script forwards to the service worker and replies via `postMessage`.
- Start flow: page sends `SCHMER_START_RECORDING` with `{ projectId, tool, options }`. If `options.toolUrl` is provided, the service worker opens it.
- Stop flow: page sends `SCHMER_STOP_RECORDING`. The extension replies with `SCHMER_RECORDING_READY` containing `{ blob, filename, projectId, tool }`.
- Upload: the frontend posts the Blob to `VITE_BACKEND_URL/upload`; fallback is a local download if upload isn't configured.

Backend for uploads:

```powershell
cd backend
npm run start
```

Frontend dev:

```powershell
npm run dev
```
