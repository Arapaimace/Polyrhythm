# Polyrhythm
Interactive polyrhythm website

## Tech Stack
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Chakra UI** - Component library
- **Emotion** - CSS-in-JS styling

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- Yarn (version 1.22 or higher)

### Installation
1. Navigate to the project directory:
   ```bash
   cd poly
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Development
Start the development server:
```bash
yarn dev
```

The application will be available at `http://localhost:3000`

### Building for Production
```bash
yarn build
```

### Preview Production Build
```bash
yarn preview
```

### Linting
```bash
yarn lint
```

## Project Structure
```
poly/
├── src/
│   ├── components/          # Reusable components
│   │   └── ExampleComponent.tsx
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## Features
- ✅ React 18 with TypeScript
- ✅ Vite for fast development and building
- ✅ Chakra UI for beautiful, accessible components
- ✅ Hot module replacement
- ✅ ESLint configuration
- ✅ Responsive design ready

## Next Steps
1. Start building your polyrhythm components in `src/components/`
2. Add routing with React Router if needed
3. Integrate audio libraries for polyrhythm functionality
4. Add state management (Context API, Redux, Zustand, etc.)
5. Set up testing with Vitest or Jest

## Available Scripts
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
