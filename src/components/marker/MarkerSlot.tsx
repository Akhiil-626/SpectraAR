import React, { useState, useEffect } from 'react';
import { Maximize2, ZoomIn } from 'lucide-react';
import { Marker } from '@/data/markers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TextMorph } from '@/components/animated/TextMorph';

interface MarkerSlotProps {
  slotLabel: string;
  markers: Marker[];
  selectedMarkerId: string | null;
  onSelectMarker: (markerId: string) => void;
  onOpenFullscreen: () => void;
}

export const MarkerSlot: React.FC<MarkerSlotProps> = ({
  slotLabel,
  markers,
  selectedMarkerId,
  onSelectMarker,
  onOpenFullscreen,
}) => {
  const [scale, setScale] = useState(100); // 50% - 130%
  const [imageError, setImageError] = useState(false);

  const selectedMarker = markers.find((m) => m.id === selectedMarkerId) || null;

  // Reset image error when marker changes
  useEffect(() => {
    setImageError(false);
  }, [selectedMarkerId]);

  const handleFullscreenClick = () => {
    try {
      if (document.fullscreenEnabled && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (_) {}
    onOpenFullscreen();
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        data-marker-slot="true"
        className="flex-1 flex flex-col min-w-[280px] max-w-full rounded-[14px] border border-border bg-surface p-4 sm:p-5 transition-all"
      >
        {/* Top Header & Dropdown */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent inline-block" />
              <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
                {slotLabel}
              </span>
            </div>

            {/* Quick controls: size and fullscreen */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-bg">
                <ZoomIn className="h-3.5 w-3.5 text-text-muted" />
                <div className="w-16">
                  <Slider
                    value={[scale]}
                    min={50}
                    max={130}
                    step={5}
                    onValueChange={(val) => setScale(val[0])}
                    aria-label="Marker scale"
                  />
                </div>
                <span className="font-mono text-[10px] text-text-muted w-7 text-right">
                  {scale}%
                </span>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFullscreenClick}
                    disabled={!selectedMarker}
                    aria-label="Expand marker to fullscreen"
                    className="flex items-center gap-1.5 h-7 px-2"
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-accent" />
                    <span className="hidden sm:inline">FULLSCREEN</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Expand marker to full screen on pure white background
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Dropdown with shadcn Select */}
          <Select
            value={selectedMarkerId || ''}
            onValueChange={(val) => onSelectMarker(val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a marker" />
            </SelectTrigger>
            <SelectContent>
              {markers.map((marker) => (
                <SelectItem key={marker.id} value={marker.id}>
                  <span className="font-semibold text-accent mr-2">
                    {marker.id}
                  </span>
                  <span>{marker.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile-only scale slider row */}
        <div className="flex sm:hidden items-center justify-between gap-2 px-3 py-1.5 mb-3 rounded-full border border-border bg-bg">
          <span className="font-mono text-[11px] text-text-muted">SCALE</span>
          <div className="w-32">
            <Slider
              value={[scale]}
              min={50}
              max={130}
              step={5}
              onValueChange={(val) => setScale(val[0])}
              aria-label="Marker scale"
            />
          </div>
          <span className="font-mono text-[11px] text-text-muted w-8 text-right">
            {scale}%
          </span>
        </div>

        {/* PURE WHITE SQUARE (#FFFFFF) with generous white margin for scanning - SQUARE CORNERS */}
        <div className="relative w-full max-h-[min(50vh,500px)] aspect-square flex items-center justify-center rounded-none overflow-hidden p-6 sm:p-8 md:p-10 marker-canvas border border-[#0B1F3A]/20 mx-auto">
          {selectedMarker ? (
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
              style={{ transform: `scale(${scale / 100})` }}
            >
              {!imageError ? (
                <img
                  src={selectedMarker.image}
                  alt={selectedMarker.name}
                  onError={() => setImageError(true)}
                  className="max-w-full max-h-full object-contain select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                /* Plain bordered placeholder for missing image */
                <div className="w-full h-full border border-dashed border-[#0B1F3A]/30 p-4 flex flex-col items-center justify-center text-center bg-[#0B1F3A]/5 text-[#0B1F3A]">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#0B1F3A]/60 mb-1">
                    MISSING MARKER IMAGE
                  </span>
                  <span className="font-mono text-lg sm:text-xl font-bold mb-1 text-[#0B1F3A]">
                    {selectedMarker.id}
                  </span>
                  <span className="font-mono text-xs mb-3 text-[#0B1F3A]/80 line-clamp-1">
                    {selectedMarker.name}
                  </span>
                  <span className="font-mono text-[10px] sm:text-xs bg-[#0B1F3A]/10 px-2 py-1 rounded-sm border border-[#0B1F3A]/20 text-[#0B1F3A] break-all max-w-[260px]">
                    File: /public{selectedMarker.image}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center text-center p-6 text-[#0B1F3A]/60">
              <div className="w-12 h-12 rounded-xl border border-dashed border-[#0B1F3A]/20 flex items-center justify-center mb-2 font-mono text-xs text-[#0B1F3A]/60">
                AR
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#0B1F3A]/60">
                No marker selected
              </span>
              <span className="font-sans text-[11px] text-[#0B1F3A]/40 mt-1">
                Choose an item from the dropdown above
              </span>
            </div>
          )}
        </div>

        {/* Marker ID and name below the image in small mono text with TextMorph */}
        <div className="mt-3 min-h-[28px] flex items-center justify-between">
          {selectedMarker ? (
            <TextMorph
              idText={selectedMarker.id}
              nameText={selectedMarker.name}
            />
          ) : (
            <span className="font-mono text-xs text-text-muted italic">
              Waiting for selection...
            </span>
          )}

          <span className="font-mono text-[10px] text-text-muted uppercase">
            6DoF PHONE AR
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
};
