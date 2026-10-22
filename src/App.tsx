import React, { useLayoutEffect, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/lib/theme';
import { Layout } from '@/components/layout/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { MODULES, ModuleId } from '@/data/modules';

// Lazy-load module routes with prefetch helpers to eliminate transition stutter
const ChemistryPage = React.lazy(() =>
  import('@/pages/ChemistryPage').then((m) => ({ default: m.ChemistryPage }))
);
const PhysicsPage = React.lazy(() =>
  import('@/pages/PhysicsPage').then((m) => ({ default: m.PhysicsPage }))
);
const OpticsPage = React.lazy(() =>
  import('@/pages/OpticsPage').then((m) => ({ default: m.OpticsPage }))
);
const PendulumPage = React.lazy(() =>
  import('@/pages/PendulumPage').then((m) => ({ default: m.PendulumPage }))
);
const BiologyPage = React.lazy(() =>
  import('@/pages/BiologyPage').then((m) => ({ default: m.BiologyPage }))
);
const MagnetismPage = React.lazy(() =>
  import('@/pages/MagnetismPage').then((m) => ({ default: m.MagnetismPage }))
);

const MODULE_COMPONENTS: Record<ModuleId, React.LazyExoticComponent<React.FC>> = {
  chemistry: ChemistryPage,
  physics: PhysicsPage,
  optics: OpticsPage,
  pendulum: PendulumPage,
  biology: BiologyPage,
  magnetism: MagnetismPage,
};

const prefetchMap: Record<ModuleId, () => Promise<unknown>> = {
  chemistry: () => import('@/pages/ChemistryPage'),
  physics: () => import('@/pages/PhysicsPage'),
  optics: () => import('@/pages/OpticsPage'),
  pendulum: () => import('@/pages/PendulumPage'),
  biology: () => import('@/pages/BiologyPage'),
  magnetism: () => import('@/pages/MagnetismPage'),
};

export const prefetchModule = (id: ModuleId) => prefetchMap[id]?.();

const prefetchModules = () => {
  MODULES.forEach((m) => prefetchModule(m.id));
};

// Preload seed marker images when idle to eliminate decode latency and layout shifts
const preloadSeedMarkers = () => {
  const seeds = [
    '/markers/chemistry/Na.jpeg',
    '/markers/chemistry/Cl.jpeg',
    '/markers/physics/kinematics.jpeg',
    '/markers/optics/lens.jpeg',
  ];
  seeds.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

// Scroll to top on route change before paint
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  useEffect(() => {
    // When idle on initial page load, prefetch modules and seed marker images
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        prefetchModules();
        preloadSeedMarkers();
      });
    } else {
      const t = setTimeout(() => {
        prefetchModules();
        preloadSeedMarkers();
      }, 500);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={null}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              {MODULES.map((mod) => {
                const Component = MODULE_COMPONENTS[mod.id];
                return (
                  <Route
                    key={mod.id}
                    path={mod.path}
                    element={<Component />}
                  />
                );
              })}
              {/* Unknown routes show a plain "Not found" page with a link home */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
};
