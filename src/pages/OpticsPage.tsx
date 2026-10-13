import React, { useState, useEffect, useRef } from 'react';
import { getMarkersByModule, Marker } from '@/data/markers';
import { MarkerSlot } from '@/components/marker/MarkerSlot';
import { BottomAdjustmentBar } from '@/components/marker/BottomAdjustmentBar';
import { FullscreenViewer } from '@/components/marker/FullscreenViewer';
import { KineticTextReveal } from '@/components/animated/KineticTextReveal';

const DEFAULT_GAP = 32;
const STORAGE_SLOT_0 = 'spectraar-slot-optics-0';
const STORAGE_SLOT_1 = 'spectraar-slot-optics-1';

export const OpticsPage: React.FC = () => {
  const lenses = getMarkersByModule('optics');

  // Load persisted slot selections
  const [slot0Id, setSlot0Id] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SLOT_0);
      if (saved && lenses.some((l) => l.id === saved)) return saved;
    } catch {
      // ignore
    }
    return lenses[0]?.id || '';
  });

  const [slot1Id, setSlot1Id] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SLOT_1);
      if (saved && lenses.some((l) => l.id === saved)) return saved;
    } catch {
      // ignore
    }
    return lenses[1]?.id || '';
  });

  const [gap, setGap] = useState<number>(DEFAULT_GAP);
  const [maxGap, setMaxGap] = useState<number>(140);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenSlotIndex, setFullscreenSlotIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Persist selections
  useEffect(() => {
    if (slot0Id) {
      try {
        localStorage.setItem(STORAGE_SLOT_0, slot0Id);
      } catch {
        // ignore
      }
    }
  }, [slot0Id]);

  useEffect(() => {
    if (slot1Id) {
      try {
        localStorage.setItem(STORAGE_SLOT_1, slot1Id);
      } catch {
        // ignore
      }
    }
  }, [slot1Id]);

  // Compute container bounds to clamp gap and prevent viewport overflow or overlap
  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        // Two slots require min ~280px each = 560px total
        const available = Math.max(8, width - 560);
        const calculatedMax = Math.min(160, Math.max(16, available));
        setMaxGap(calculatedMax);
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  const clampedGap = Math.min(gap, maxGap);

  const slot0Marker = lenses.find((l) => l.id === slot0Id) || null;
  const slot1Marker = lenses.find((l) => l.id === slot1Id) || null;
  const slotMarkers: (Marker | null)[] = [slot0Marker, slot1Marker];

  const handleOpenFullscreen = (index: number) => {
    setFullscreenSlotIndex(index);
    setFullscreenOpen(true);
  };

  return (
    <div className="w-full flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 flex flex-col">
      {/* Top Section */}
      <div className="mb-6 border-b border-border pb-4 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
          <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
            OPT
          </span>
          <KineticTextReveal
            text="Ray Optics"
            className="font-sans font-bold text-3xl sm:text-4xl text-text-primary tracking-tight"
          />
        </div>

        <p className="font-mono text-xs text-text-muted">
          Select a marker, then scan it with the AR device.
        </p>
      </div>

      {/* Two slots side-by-side with dynamic clamped gap */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col md:flex-row items-stretch justify-center w-full transition-[gap] duration-75"
        style={{ gap: `${clampedGap}px` }}
      >
        <MarkerSlot
          slotLabel="Slot 1 — Optical Element 1"
          markers={lenses}
          selectedMarkerId={slot0Id}
          onSelectMarker={setSlot0Id}
          onOpenFullscreen={() => handleOpenFullscreen(0)}
        />

        <MarkerSlot
          slotLabel="Slot 2 — Optical Element 2"
          markers={lenses}
          selectedMarkerId={slot1Id}
          onSelectMarker={setSlot1Id}
          onOpenFullscreen={() => handleOpenFullscreen(1)}
        />
      </div>

      {/* Fixed bottom adjustment bar */}
      <BottomAdjustmentBar
        gap={clampedGap}
        minGap={8}
        maxGap={maxGap}
        defaultGap={DEFAULT_GAP}
        onGapChange={(newGap) => setGap(newGap)}
        onReset={() => setGap(DEFAULT_GAP)}
      />

      {/* Fullscreen Viewer */}
      <FullscreenViewer
        isOpen={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        markers={slotMarkers}
        initialSlotIndex={fullscreenSlotIndex}
      />
    </div>
  );
};
