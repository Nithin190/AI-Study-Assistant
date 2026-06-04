# Landing Page

Marketing site for AI Study Assistant. Separate Next.js app, doesn't touch the Streamlit code.

## Run locally

```bash
cd landing
npm install
npm run dev      # http://localhost:3000
```

The "Open app" buttons link to `http://localhost:8501` (your Streamlit instance). Update those URLs for production deployment.

## Build for production

```bash
npm run build
npm start
```

## Deploy

Easiest options:
- **Vercel** — `vercel deploy` (works zero-config with Next.js)
- **Netlify** — connect repo, set publish dir to `landing/.next`
- **Static export** — add `output: "export"` to `next.config.js`, then `npm run build` → upload `out/` anywhere

## Tech

- Next.js 14 (Pages Router for simplicity — no React Server Components complexity)
- Tailwind CSS
- Framer Motion for entrance animations
- lucide-react for icons
- Custom fonts: Geist (body), Instrument Serif (display), JetBrains Mono (code)
