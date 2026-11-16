

# Poly

Interactive polyrhythm metronome. Allows for custom keybinds for realtime input and feedback along with uploading of scores to parse specified measures for polyrhythms.


> [!NOTE]
> While you can freely upload scores and parse them, the rendering and extraction of polyrhythms is not perfect. For now, the algorithm works best with simpler measures where there are not several voices interacting with one another. Rendering also only is possible in treble clef due to the limitations of musicxml, meaning bass clef notes will be instead shown as very low treble clef notes. Both of these issues are a WIP, and I hope to fix them in the near future.



## **FOR DEV**

Frontend: React w/ TypeScript, ChakraUI, dev & build on Vite, deployed on Vercel  
Backend: Supabase - PostgreSQL, Python (FastAPI, Partitura)

## Prerequisites

- Yarn (can be installed via npm $\rightarrow$ `npm install --global yarn`)
- partitura (can be isntalled via pip $\rightarrow$ `pip install partitura`)

## Available Scripts

### Frontend
- `yarn dev` - Start development server $\leftarrow$ use this for now (from the /client directory)
- `yarn build` - Build for production (build managed by Vercel so don't have to use)
- `yarn preview` - Preview production build (preview managed by Vercel so don't have to use, instead clone dev branch and view that deployment)
- `yarn lint` - Run ESLint

### Backend
- `fastapi dev` - Start the backend server (from the base directory)


Use LibreScore to get mscz w/ Partitura library, convert to musicxml (in MuseScore)
Use `.env` for db access, contact for dev access


Developed by Adarsh Venkateswaran
