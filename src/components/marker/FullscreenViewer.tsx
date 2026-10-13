import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Marker } from '@/data/markers';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface FullscreenViewerProps {
  isOpen: boolean;
  onClose: () => void;
  markers: (Marker | null)[];
  initialSlotIndex?: number;
}

export const FullscreenViewer: React.FC<FullscreenViewerProps> = ({
  isOpen,
  onClose,
  markers,
  initialSlotIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlotIndex);
  const [imageError, setImageError] = useState(false);
  const location = useLocation();

  const handleExit = useCallback(() => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (_) {}
    onClose();
  }, [onClose]);

  useEffect(() => {
    setCurrentIndex(initialSlotIndex);
  }, [initialSlotIndex, isOpen]);

  const activeMarker = markers[currentIndex];

  useEffect(() => {
    setImageError(false);
  }, [activeMarker]);

  // Reset fullscreen on route change
  const initialPath = useRef(location.pathname);
  useEffect(() => {
    if (isOpen && initialPath.current !== location.pathname) {
      handleExit();
    }
    initialPath.current = location.pathname;
  }, [location.pathname, isOpen, handleExit]);

  // Reset fullscreen on window blur
  useEffect(() => {
    if (!isOpen) return;
    const handleBlur = () => {
      handleExit();
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isOpen, handleExit]);

  // Listen to fullscreenchange (e.g. user pressed Esc in browser native fullscreen)
  useEffect(() => {
    if (!isOpen) return;
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onClose();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
        return;
      }
      if (e.key === 'ArrowLeft' && markers.length > 1) {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : markers.length - 1));
      } else if (e.key === 'ArrowRight' && markers.length > 1) {
        setCurrentIndex((prev) => (prev < markers.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, markers.length, handleExit]);

  const hasMultipleSlots = markers.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleExit()}>
      <DialogContent
        fullScreen
        data-fullscreen-marker="true"
        className="flex flex-col items-center justify-center select-none overflow-hidden"
        style={{ backgroundColor: '#0B1F3A' }}
      >
        <DialogTitle className="sr-only">
          Fullscreen Marker View
        </DialogTitle>
        <DialogDescription className="sr-only">
          View high contrast marker for mobile camera scanning
        </DialogDescription>

        {/* Faint 48px grid background behind the marker: solid vector lines, no gradients */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="fullscreen-navy-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="rgba(244, 235, 208, 0.06)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fullscreen-navy-grid)" />
        </svg>

        {/* Top control bar: cream text and borders on navy (contrast >= 4.5:1) */}
        <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-[#F4EBD0] font-mono text-xs z-20 pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-wider text-[#F4EBD0]">SPECTRA-AR FULLSCREEN</span>
            {hasMultipleSlots && (
              <span className="bg-[#F4EBD0]/10 px-3 py-0.5 rounded-full border border-[#F4EBD0]/20 text-[#F4EBD0]">
                SLOT {currentIndex + 1} OF {markers.length}
              </span>
            )}
          </div>

          <button
            onClick={handleExit}
            aria-label="Close fullscreen"
            className="pointer-events-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#F4EBD0]/30 bg-[#F4EBD0]/10 text-[#F4EBD0] hover:bg-[#F4EBD0]/20 hover:border-[#F4EBD0]/50 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span className="font-mono text-[11px] tracking-wide">EXIT [ESC]</span>
          </button>
        </div>

        {/* Navigation arrows for two-slot modules */}
        {hasMultipleSlots && (
          <>
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : markers.length - 1))
              }
              aria-label="Previous slot marker"
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-[#F4EBD0]/30 bg-[#F4EBD0]/10 text-[#F4EBD0] hover:bg-[#F4EBD0]/20 hover:border-[#F4EBD0]/50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev < markers.length - 1 ? prev + 1 : 0))
              }
              aria-label="Next slot marker"
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-[#F4EBD0]/30 bg-[#F4EBD0]/10 text-[#F4EBD0] hover:bg-[#F4EBD0]/20 hover:border-[#F4EBD0]/50 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Main marker display area: white marker square sits with maximum contrast in the center */}
        <div
          className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 sm:p-16 md:p-24 max-w-5xl max-h-[85vh] cursor-pointer"
          onClick={handleExit}
        >
          {activeMarker ? (
            <div
              className="w-full h-full flex flex-col items-center justify-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full max-w-[560px] aspect-square flex items-center justify-center p-6 sm:p-10 bg-white rounded-lg shadow-none">
                {!imageError ? (
                  <img
                    src={activeMarker.image}
                    alt={activeMarker.name}
                    onError={() => setImageError(true)}
                    className="max-w-full max-h-full object-contain filter-none"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <div className="w-full h-full border border-dashed border-[#0B1F3A]/30 p-6 flex flex-col items-center justify-center text-center bg-[#0B1F3A]/5 text-[#0B1F3A]">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#0B1F3A]/60 mb-2">
                      MISSING MARKER IMAGE
                    </span>
                    <div className="font-mono text-2xl font-bold mb-2 text-[#0B1F3A]">
                      {activeMarker.id}
                    </div>
                    <div className="font-mono text-sm mb-4 text-[#0B1F3A]/80">
                      {activeMarker.name}
                    </div>
                    <div className="font-mono text-xs bg-[#0B1F3A]/10 px-3 py-1.5 rounded-sm border border-[#0B1F3A]/20 text-[#0B1F3A] break-all max-w-md">
                      Target File: /public{activeMarker.image}
                    </div>
                  </div>
                )}
              </div>

              {/* Marker ID and name below */}
              <div className="mt-4 font-mono text-center text-[#F4EBD0]">
                <span className="text-xs uppercase bg-[#F4EBD0]/10 border border-[#F4EBD0]/20 px-2 py-0.5 rounded-sm mr-2 font-semibold text-[#F4EBD0]">
                  {activeMarker.id}
                </span>
                <span className="text-sm font-medium text-[#F4EBD0]">{activeMarker.name}</span>
              </div>
            </div>
          ) : (
            <div className="font-mono text-sm text-[#F4EBD0]/70 border border-dashed border-[#F4EBD0]/30 p-12 text-center bg-[#F4EBD0]/5 rounded-lg">
              No marker selected in Slot {currentIndex + 1}
            </div>
          )}
        </div>

        {/* Tap hint at bottom */}
        <div className="absolute bottom-4 text-center font-mono text-[11px] text-[#F4EBD0]/70 z-20">
          TAP ANYWHERE OR PRESS ESC TO EXIT FULLSCREEN
        </div>
      </DialogContent>
    </Dialog>
  );
};
