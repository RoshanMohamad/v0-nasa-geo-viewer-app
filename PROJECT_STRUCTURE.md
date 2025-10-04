# Project Structure

## 📁 Directory Overview

```
v0-nasa-geo-viewer-app/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   ├── loading.tsx        # Loading state
│   └── page.tsx           # Main application page
│
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── select.tsx
│   │   ├── slider.tsx
│   │   └── tabs.tsx
│   ├── control-panel.tsx  # Asteroid configuration panel
│   ├── data-panel.tsx     # Data display component
│   ├── earth-globe.tsx    # 3D Earth visualization
│   ├── solar-system.tsx   # 3D solar system simulation
│   └── theme-provider.tsx # Dark/light theme provider
│
├── lib/                   # Utility libraries and helpers
│   ├── impact-calculator.ts  # Physics calculations for impacts
│   ├── nasa-neo-api.ts      # NASA API integration
│   └── utils.ts             # General utilities
│
├── public/               # Static assets
│   └── *.svg, *.png     # Images and icons
│
├── styles/              # Additional styles
│   └── globals.css
│
├── .env.example         # Environment variable template
├── components.json      # shadcn/ui configuration
├── next.config.mjs      # Next.js configuration
├── package.json         # Dependencies
├── postcss.config.mjs   # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## 🔑 Key Files

### Application Core
- **`app/page.tsx`**: Main application logic, state management, and UI layout
- **`components/solar-system.tsx`**: Three.js 3D solar system visualization
- **`components/control-panel.tsx`**: User controls for asteroid simulation

### Scientific Calculations
- **`lib/impact-calculator.ts`**: 
  - Kinetic energy calculations
  - Crater formation modeling
  - Damage radius estimation
  - Severity classification

### External Data
- **`lib/nasa-neo-api.ts`**:
  - Fetches real-time asteroid data from NASA
  - Processes Near-Earth Object (NEO) information
  - Provides historical comparison data

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI component library
- **Dark Mode**: Built-in theme support via `next-themes`

## 🔧 Configuration Files

- **`.env.local`** (create from `.env.example`): 
  - `NEXT_PUBLIC_NASA_API_KEY`: NASA API key for real asteroid data

## 🚀 Technology Stack

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **3D Graphics**: Three.js
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **API**: NASA NEO (Near-Earth Object) Web Service

## 📦 Key Dependencies

- `three`: 3D graphics library
- `next-themes`: Dark mode support
- `lucide-react`: Icon library
- `@radix-ui/*`: Accessible UI primitives
- `tailwindcss`: CSS framework

## 🔄 Data Flow

1. User configures asteroid parameters in `control-panel.tsx`
2. Parameters passed to `solar-system.tsx` for 3D visualization
3. Physics calculations performed in `impact-calculator.ts`
4. Real-time NASA data fetched via `nasa-neo-api.ts`
5. Results displayed in impact analysis cards

## 🎯 Component Responsibilities

### `page.tsx` (Main Controller)
- Application state management
- Event coordination
- Layout composition

### `solar-system.tsx` (3D Engine)
- Three.js scene setup
- Planet orbits and rendering
- Asteroid trajectory simulation
- Impact detection

### `control-panel.tsx` (User Input)
- Parameter configuration
- Preset selection
- NASA data integration
- Simulation controls

### `impact-calculator.ts` (Physics)
- Energy calculations
- Crater modeling
- Damage assessment
- Severity classification
