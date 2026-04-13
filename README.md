

# Poly

Interactive polyrhythm metronome metronome.

Frontend: React w/ TypeScript, ChakraUI, dev & build on Vite, deployed on Vercel  
Backend: Supabase - PostgreSQL, Python (FastAPI, Partitura)

## Prerequisites

- Yarn
- partitura (pip)

## Available Scripts

### Frontend
- `yarn dev` - Start development server $\leftarrow$ use this for now
- `yarn build` - Build for production (build managed by Vercel so don't have to use)
- `yarn preview` - Preview production build (preview managed by Vercel so don't have to use, instead clone dev branch and view that deployment)
- `yarn lint` - Run ESLint

### Backend
- `fastapi dev` - Start the backend server



## FOR DEV
Use LibreScore to get mscz w/ Partitura library, convert to musicxml (in MuseScore)
Use `.env` for db access, contact for dev access
