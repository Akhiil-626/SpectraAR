import React, { useLayoutEffect, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/lib/theme';
import { Layout } from '@/components/layout/Layout';
import { LandingPage } from '@/pages/LandingPage';

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

export const prefetchChemistry = () => import('@/pages/ChemistryPage');
export const prefetchPhysics = () => import('@/pages/PhysicsPage');
export const prefetchOptics = () => import('@/pages/OpticsPage');
const prefetchModules = () => {
  prefetchChemistry();
  prefetchPhysics();
  prefetchOptics();
};

// Preload seed marker images when idle to eliminate decode latency and layout shifts
const preloadSeedMarkers = () => {
  const seeds = [
    '/markers/CHE_01_NAOH.png',
    '/markers/CHE_02_HCL.png',
    '/markers/PHY_01_PROJECTILE.png',
    '/markers/OPT_01_CONVEX_LENS.png',
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
              <Route path="/chemistry" element={<ChemistryPage />} />
              <Route path="/physics" element={<PhysicsPage />} />
              <Route path="/optics" element={<OpticsPage />} />
              {/* Strict routing: no other routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
};
