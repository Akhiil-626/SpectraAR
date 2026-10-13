# SpectraAR

> **High-Precision AR Tracking Marker Display System for Secondary School Science Simulations**

SpectraAR is a dedicated web companion platform engineered for STEM classrooms and science laboratory environments. It displays high-contrast, mathematically calibrated fiducial tracking markers on student devices (laptops, monitors, tablets) for instant recognition and 3D simulation rendering by mobile augmented reality (AR) applications (e.g., Unity AR Foundation, ARKit, and ARCore).

Instead of relying on fragile, damaged, or glare-prone paper printouts, SpectraAR provides educators and students with real-time digital marker management, multi-target spatial calibration, dynamic sizing, and immersive fullscreen viewing.

---

## 🌟 Key Features

### 🔬 Curriculum Modules
- **Chemistry (`/chemistry`)**: Dual-slot marker workbench designed for multi-target juxtaposition (e.g., Sodium $\text{Na}$, Chlorine $\text{Cl}$, Oxygen $\text{O}_2$) to simulate molecular interactions, chemical bonding, and crystal lattices when scanned side-by-side.
- **Physics (`/physics`)**: Dedicated high-contrast single-slot viewport for mechanics, velocity, and kinematics target recognition.
- **Ray Optics (`/optics`)**: Multi-slot optical bench layout for convex and concave lenses with calibrated spatial separation for real-time focal point and ray refraction simulations.

### 🎯 Calibration & Precision Controls
- **High-Contrast Marker Cards**: Each marker is enclosed within an isolated pure-white matte card to ensure maximum optical contrast and reliable keypoint tracking across various screen types and lighting conditions.
- **Individual Scale Sliders**: Per-slot scaling control (50% to 130%) to adapt tracking target size based on camera distance, device resolution, and room acoustics.
- **Dynamic Inter-Marker Gap Bar**: Fixed bottom calibration bar allowing real-time inter-marker distance adjustment (8px to 160px) to establish precise physical baselines for multi-marker experiments.
- **Distraction-Free Fullscreen Viewer**: 1-click modal expansion with native Fullscreen API integration for maximum screen coverage and glare reduction.
- **Session Persistence**: Automatic `localStorage` caching remembers marker selections across browser reloads.

### 🎨 Editorial Design System & Motion
- **Strict Two-Tone Palette**: Deep Navy (`#0B1F3A`) and warm Cream (`#F4EBD0`) with subtle translucent glass layers, eliminating visual clutter during laboratory experiments.
- **Organic Liquid Ink Wordmark**: Vector typography dynamically masked with SVG procedural turbulence and edge displacement filters (`feTurbulence`, `feDisplacementMap`, `feGaussianBlur`, `feComponentTransfer`).
- **Dynamic Spring Cursor Trail**: Zero-lag accent cursor with fluid velocity-based easing and trail scaling on fine-pointer devices.
- **Responsive & Accessible**: Seamless fluid scaling from mobile phones (390px) up to large lab displays (1440px+), complete with `prefers-reduced-motion` compliance.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/) (Select, Slider, Dialog, Tooltip, Separator)
- **Animation & Gestures**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)

---

## 📁 Project Structure

```
SpectraAR/
├── public/
│   └── markers/              # High-resolution AR tracking images
│       ├── chemistry/        # Element and molecule targets (Na, Cl, O2...)
│       ├── physics/          # Mechanics & Kinematics targets
│       └── optics/           # Optical lenses & focal markers
├── src/
│   ├── components/
│   │   ├── animated/         # Kinetic text, morphing, and text swap components
│   │   ├── cursor/           # Custom canvas-based trailing line cursor
│   │   ├── hero/             # Organic ink-masked vector wordmark
│   │   ├── layout/           # Header, navigation, footer, and shell
│   │   ├── marker/           # MarkerSlot, BottomAdjustmentBar, FullscreenViewer
│   │   └── ui/               # Radix UI styled primitives
│   ├── data/
│   │   └── markers.ts        # Central marker registry and module catalogs
│   ├── lib/
│   │   ├── theme.tsx         # Dark / Light theme provider and hooks
│   │   └── utils.ts          # Class merging and layout utilities
│   ├── pages/
│   │   ├── ChemistryPage.tsx # Chemistry dual-marker workbench
│   │   ├── PhysicsPage.tsx   # Physics single-marker workbench
│   │   ├── OpticsPage.tsx    # Ray Optics multi-marker workbench
│   │   └── LandingPage.tsx   # Editorial landing page and curriculum overview
│   ├── App.tsx               # Route definitions and code-splitting prefetchers
│   └── main.tsx              # Application entry point
├── package.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm`, `pnpm`, or `yarn`

### Installation
Clone the repository and install dependencies:

```bash
npm install
```

### Development Server
Run the local Vite development server:

```bash
npm run dev
```

The dev server runs with `host: true` on port `5173`. You can access it locally at `http://localhost:5173` or point mobile AR devices to your local IP address (e.g., `http://192.168.x.x:5173`) over Wi-Fi.

### Production Build
To create a production-ready optimized build:

```bash
npm run build
```

To preview the built production bundle:

```bash
npm run preview
```

---

## ➕ Adding a New Marker

Adding new AR markers is fully automated via the central data registry:

1. **Place the marker image** into the appropriate public directory:
   - Chemistry: `public/markers/chemistry/<filename>.png` (or `.jpeg`)
   - Physics: `public/markers/physics/<filename>.png`
   - Ray Optics: `public/markers/optics/<filename>.png`

2. **Register the marker** with a single entry in [`src/data/markers.ts`](src/data/markers.ts):
   ```typescript
   {
     id: 'CHE-09',
     module: 'chemistry',
     name: 'Ethanol (C2H5OH)',
     image: '/markers/chemistry/ethanol.png'
   },
   ```

The newly registered marker will automatically appear in module statistics, slot dropdowns, and fullscreen viewers across the entire app.

---

## 📱 Mobile AR Scanning Tips

For optimal camera recognition with the SpectraAR mobile simulation app:
- **Screen Glare**: Adjust monitor angle or dim direct overhead classroom lights to prevent glare washouts.
- **Scanning Distance**: Hold mobile AR camera approximately 30–50 cm away from the screen.
- **Marker Sizing**: Use individual slot sliders to scale targets up if scanning from a distance or down if fitting multiple markers into the camera's field of view.
- **Fullscreen**: Activate the fullscreen button on any slot for a distraction-free display during demonstrations.

---

## 📄 License

This project is private and maintained for science curriculum augmented reality demonstrations.
