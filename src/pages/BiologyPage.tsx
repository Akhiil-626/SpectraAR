import React, { useState, useEffect } from 'react';
import { getMarkersByModule, Marker } from '@/data/markers';
import { getSlotStorageKey, getModuleById } from '@/data/modules';
import { DraggableTwoSlotStage } from '@/components/marker/DraggableTwoSlotStage';
import { FullscreenViewer } from '@/components/marker/FullscreenViewer';
import { KineticTextReveal } from '@/components/animated/KineticTextReveal';

const moduleConfig = getModuleById('biology');
const STORAGE_SLOT_0 = getSlotStorageKey('biology', 0);
const STORAGE_SLOT_1 = getSlotStorageKey('biology', 1);

export const BiologyPage: React.FC = () => {
  const bioMarkers = getMarkersByModule('biology');

  // Load persisted slot selections
  const [slot0Id, setSlot0Id] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SLOT_0);
      if (saved && bioMarkers.some((b) => b.id === saved)) return saved;
    } catch {
      // ignore
    }
    return bioMarkers[0]?.id || '';
  });

  const [slot1Id, setSlot1Id] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SLOT_1);
      if (saved && bioMarkers.some((b) => b.id === saved)) return saved;
    } catch {
      // ignore
    }
    return bioMarkers[1]?.id || '';
  });

  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenSlotIndex, setFullscreenSlotIndex] = useState(0);

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

  const slot0Marker = bioMarkers.find((b) => b.id === slot0Id) || null;
  const slot1Marker = bioMarkers.find((b) => b.id === slot1Id) || null;
  const slotMarkers: (Marker | null)[] = [slot0Marker, slot1Marker];

  const handleOpenFullscreen = (index: number) => {
    setFullscreenSlotIndex(index);
    setFullscreenOpen(true);
  };

  return (
    <div className="w-full flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
      {/* Top Section */}
      <div className="mb-4 border-b border-border pb-4 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
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

      {/* Draggable Two-Slot Bounded Stage */}
      <DraggableTwoSlotStage
        moduleId="biology"
        markers={bioMarkers}
        slot0Id={slot0Id}
        slot1Id={slot1Id}
        onSelectSlot0={setSlot0Id}
        onSelectSlot1={setSlot1Id}
        onOpenFullscreen={handleOpenFullscreen}
        slot0Label="Specimen A"
        slot1Label="Specimen B"
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
