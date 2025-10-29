# Event Networking Web App

A modern React web application built with Vite, TypeScript, and a comprehensive tech stack for the Event Networking platform.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite with optimized configuration
- **UI Library**: Shadcn UI + Tailwind CSS v4
- **State Management**: 
  - TanStack Query (server state)
  - Zustand (client state)
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Icons**: Lucide React

## Features

- ⚡ Fast development with Vite HMR
- 🎨 Modern UI with Shadcn components
- 📱 Responsive design with Tailwind CSS
- 🔄 Efficient server state management
- 🛣️ Client-side routing with code splitting
- 📝 Type-safe forms with validation
- 🎯 Optimized production builds

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Backend API running (see backend README)

### Development

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL (defaults to http://localhost:8000)
```

3. Start development server:
```bash
npm run dev
```

### Production Deployment

1. Configure production environment:
```bash
# Update .env.production with your deployed backend URL
VITE_API_URL=https://your-backend-url.com
```

2. Build for production:
```bash
npm run build
```

3. Preview production build:
```bash
npm run preview
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Other Commands

```bash
npm run lint          # Run ESLint
npm run lighthouse    # Run Lighthouse performance tests
npm run stress:test   # Run stress tests
npm run load:test     # Run load tests
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # Shadcn UI components
├── lib/                # Utility functions and configurations
│   ├── query-client.ts # TanStack Query configuration
│   ├── router.tsx      # React Router configuration
│   └── utils.ts        # General utilities
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Configuration

- **Vite**: Optimized for fast builds and HMR
- **TypeScript**: Strict mode enabled with path mapping
- **Tailwind**: Modern v4 with Vite plugin
- **ESLint**: React and TypeScript rules configured