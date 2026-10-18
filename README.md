# Sainly Studio — Admin Web Dashboard 💻

The official web-based administrative dashboard for **Sainly Studio**, built with Vue 3, Vite, Vuetify 3, Pinia, and TypeScript. It provides a full-featured interface to manage client inquiries, portfolio projects, media uploads, and studio settings.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Building](#building)
- [Deployment](#deployment)
  - [Deploy to Vercel (Recommended)](#deploy-to-vercel-recommended)
  - [Deploy to Netlify / Cloudflare Pages / Static Host](#deploy-to-netlify--cloudflare-pages--static-host)
  - [Deploy with Docker / Nginx](#deploy-with-docker--nginx)
- [Available Scripts](#available-scripts)

---

## Features

- **Inquiries Management:** View contact form submissions with real-time status updates and direct replies.
- **Project Showcase Management:** Create, update, reorder, and remove portfolio projects and cover images.
- **Site Configuration:** Manage branding, WhatsApp contact number, emails, and availability banners.
- **Vuetify Material Design:** Responsive dark/light theme, modern charts, and data tables.
- **Security & Authentication:** Secure token storage and protected admin routes.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.x, v20.x, or v22.x recommended)
- `npm` (v9+) or `pnpm` (v8+)

---

## Installation

1. Navigate to the `sainly-admin` directory:
   ```bash
   cd sainly-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   *(Note: The `postinstall` script automatically compiles custom icon bundles via `npm run build:icons`)*

---

## Environment Variables

Copy the example environment file to `.env`:

```bash
cp .env.example .env
```

### Configuration Options:

| Variable | Description | Default / Example |
|---|---|---|
| `VITE_API_URL` | Base path for API requests. Keep `/api` when using dev proxy or Vercel rewrites | `/api` |
| `VITE_ASSET_URL` | Base URL for uploaded images/media (`/uploads/`). Leave blank for same-origin | `""` or `https://sainlystudio.vercel.app` |
| `VITE_PROXY_TARGET` | Backend target URL for Vite local proxy during development | `http://localhost:5000` |

---

## Local Development

Start the Vite development server:

```bash
npm run dev
```

- Local URL: `http://localhost:5173` (or port shown in console).
- Vite dev server automatically proxies `/api` and `/uploads` requests to `VITE_PROXY_TARGET` (`http://localhost:5000`), so ensure the backend server is running in `sainlystudio`.

---

## Building

### Production Build
```bash
npm run build
```
Generates production-optimized static files in the `dist/` directory.

### Staging Build
```bash
npm run build:staging
```
Builds with staging configurations.

### Type Checking & Linting
```bash
npm run type-check   # Validate TypeScript types via vue-tsc
npm run lint         # Check and auto-fix ESLint issues
```

---

## Deployment

### Deploy to Vercel (Recommended)

`sainly-admin` is pre-configured for Vercel in [`vercel.json`](./vercel.json):
- Automatically chooses `npm run build` or `npm run build:staging` based on `$VERCEL_ENV`.
- Automatically proxies `/api/*` and `/uploads/*` to `https://sainlystudio.vercel.app`.
- Configures Single Page Application (SPA) routing fallback to `/index.html`.

#### Steps to Deploy:
1. Install Vercel CLI (or connect Git repository in the Vercel Web Dashboard):
   ```bash
   npm install -g vercel
   ```
2. Deploy from the `sainly-admin` folder:
   ```bash
   cd sainly-admin
   vercel
   ```
3. For production release:
   ```bash
   vercel --prod
   ```

---

### Deploy to Netlify / Cloudflare Pages / Static Host

1. **Build Command:** `npm run build`
2. **Publish Directory:** `dist`
3. **SPA Redirect Rules:**
   - For **Netlify**: Ensure `_redirects` file exists in `public/` containing:
     ```text
     /api/*  https://sainlystudio.vercel.app/api/:splat  200
     /*      /index.html                                 200
     ```
   - For **Cloudflare Pages**: Add a `_redirects` file in `public/` or configure Single Page App fallback to `/index.html`.

---

### Deploy with Docker / Nginx

When serving behind Nginx, add the fallback route and proxy:

```nginx
server {
    listen 80;
    server_name admin.sainlystudio.com;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass https://sainlystudio.vercel.app/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Start local development server with HMR |
| `npm run build` | `vite build --mode production` | Production build into `dist/` |
| `npm run build:staging` | `vite build --mode staging` | Staging build |
| `npm run preview` | `vite preview` | Locally preview production build |
| `npm run type-check` | `vue-tsc --noEmit` | Type checking without emitting code |
| `npm run lint` | `eslint . --fix` | Lint and auto-fix JavaScript/Vue/TypeScript |

