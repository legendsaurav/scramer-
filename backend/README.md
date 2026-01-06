# Backend Service

A minimal Node/Express backend to support the frontend and prepare for global hosting (e.g., Render).

## Quick start

1. Copy envs:
   ```bash
   cp .env.example .env
   ```
2. Install & run:
   ```bash
   npm install
   npm run dev
   ```
3. Health check: open http://localhost:8080/health

Port note:

- If `8080` is already in use locally, the server will retry on the next port (e.g., `8081`).
- Set `PORT` in `.env` to choose a specific port, and ensure the frontend `VITE_BACKEND_URL` points to the same host/port.

## Production build
```bash
npm run build
npm run start
```

## Hosting (Render)
- This folder includes `render.yaml` with a Node web service definition.
- If deploying the whole repo, Render expects `render.yaml` at the repository root. You can keep it here for reference and configure the service via the Render dashboard, or move it to the root later.

## Notes
- Requires Node.js 18+.
- Adjust `PORT` in `.env` as needed.
