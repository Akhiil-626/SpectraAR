import React, { useState, useEffect } from 'react';
import { getMarkersByModule, Marker } from '@/data/markers';
import { getSlotStorageKey, getModuleById } from '@/data/modules';
import { MarkerSlot } from '@/components/marker/MarkerSlot';
import { FullscreenViewer } from '@/components/marker/FullscreenViewer';
import { KineticTextReveal } from '@/components/animated/KineticTextReveal';

const moduleConfig = getModuleById('pendulum');
const STORAGE_SLOT_0 = getSlotStorageKey('pendulum', 0);

export const PendulumPage: React.FC = () => {
  const pendulumMarkers = getMarkersByModule('pendulum');

  // Load persisted slot selection
  const [slot0Id, setSlot0Id] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SLOT_0);
      if (saved && pendulumMarkers.some((p) => p.id === saved)) return saved;
    } catch {
      // ignore
    }
    return pendulumMarkers[0]?.id || '';
  });

  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  useEffect(() => {
    if (slot0Id) {
      try {
        localStorage.setItem(STORAGE_SLOT_0, slot0Id);
      } catch {
        // ignore
      }
    }
  }, [slot0Id]);

  const slot0Marker = pendulumMarkers.find((p) => p.id === slot0Id) || null;
  const slotMarkers: (Marker | null)[] = [slot0Marker];

  return (
    <div className="w-full flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 flex flex-col">
      {/* Top Section */}
      <div className="mb-6 border-b border-border pb-4 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
          <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
            {moduleConfig.code}
          </span>
          <KineticTextReveal
            text={moduleConfig.name}
            className="font-sans font-bold text-3xl sm:text-4xl text-text-primary tracking-tight"
          />
        </div>

        <p className="font-mono text-xs text-text-muted">
          Select a marker, then scan it with the AR device.
        </p>
      </div>

      {/* SINGLE slot taking prominent area */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-2xl">
          <MarkerSlot
            slotLabel="Primary Pendulum Simulation Marker"
            markers={pendulumMarkers}
            selectedMarkerId={slot0Id}
            onSelectMarker={setSlot0Id}
            onOpenFullscreen={() => setFullscreenOpen(true)}
          />
        </div>
      </div>

      {/* Note: NO bottom adjustment bar on /pendulum as specified */}

      {/* Fullscreen Viewer */}
      <FullscreenViewer
        isOpen={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        markers={slotMarkers}
        initialSlotIndex={0}
      />
    </div>
  );
};
