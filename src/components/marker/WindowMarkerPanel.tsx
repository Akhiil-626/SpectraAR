import React, { useState, useEffect } from 'react';
import { GripHorizontal, Maximize2, ZoomIn } from 'lucide-react';
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

export interface WindowMarkerPanelProps {
  slotNumber: 1 | 2;
  slotLabel: string;
  markers: Marker[];
  selectedMarkerId: string | null;
  size: number;
  onSelectMarker: (markerId: string) => void;
  onOpenFullscreen: () => void;
  onSizeChange: (newSize: number) => void;
  onPointerDownTitle: (e: React.PointerEvent<HTMLDivElement>) => void;
  onKeyDownTitle: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
}

export const WindowMarkerPanel: React.FC<WindowMarkerPanelProps> = ({
  slotNumber,
  slotLabel,
  markers,
  selectedMarkerId,
  size,
  onSelectMarker,
  onOpenFullscreen,
  onSizeChange,
  onPointerDownTitle,
  onKeyDownTitle,
  isDragging = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const selectedMarker = markers.find((m) => m.id === selectedMarkerId) || null;

  useEffect(() => {
    setImageError(false);
  }, [selectedMarkerId]);

  const handleFullscreenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (document.fullscreenEnabled && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (_) {}
    onOpenFullscreen();
  };

  const panelWidth = Math.max(240, size);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        data-marker-slot="true"
        data-slot-number={slotNumber}
        className="flex flex-col rounded-[14px] border border-border bg-bg overflow-hidden select-none"
        style={{
          width: `${panelWidth}px`,
        }}
      >
        {/* 1. TITLE BAR (36px, the ONLY drag handle) */}
        <div
          role="group"
          tabIndex={0}
          aria-label={`Move slot ${slotNumber} window`}
          data-drag-handle="true"
          data-panel-title-bar="true"
          onPointerDown={onPointerDownTitle}
          onKeyDown={onKeyDownTitle}
          className={`h-[36px] min-h-[36px] max-h-[36px] px-2.5 sm:px-3 bg-[rgba(var(--color-fg-rgb)/0.08)] border-b border-border flex items-center justify-between gap-1.5 sm:gap-2 cursor-grab active:cursor-grabbing focus-visible:ring-1 focus-visible:ring-fg focus-visible:outline-none transition-colors ${
            isDragging ? 'cursor-grabbing is-dragging bg-[rgba(var(--color-fg-rgb)/0.14)]' : ''
          }`}
          style={{ height: '36px', minHeight: '36px', touchAction: 'none' }}
        >
          {/* Left: Grip icon + Slot label in mono */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pointer-events-none">
            <GripHorizontal className="h-4 w-4 text-text-muted shrink-0" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-text-primary whitespace-nowrap">
              SLOT {slotNumber}
            </span>
          </div>

          {/* Right: Dropdown + Fullscreen button */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 shrink min-w-0"
            data-no-drag="true"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="w-[110px] sm:w-[140px] shrink min-w-0">
              <Select
                value={selectedMarkerId || ''}
                onValueChange={(val) => onSelectMarker(val)}
              >
                <SelectTrigger
                  aria-label={`${slotLabel} marker selection`}
                  className="h-6 text-[11px] px-2 py-0 border-border/80 bg-surface/50 truncate focus:ring-1 focus:ring-accent"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {markers.map((marker) => (
                    <SelectItem key={marker.id} value={marker.id} className="text-xs">
                      <span className="font-semibold text-accent mr-1.5">{marker.id}</span>
                      <span className="truncate">{marker.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullscreenClick}
                  disabled={!selectedMarker}
                  aria-label={`Expand slot ${slotNumber} marker to fullscreen`}
                  className="h-6 w-6 p-0 shrink-0 rounded-md border border-border bg-surface text-text-primary hover:border-accent hover:text-accent flex items-center justify-center cursor-pointer"
                >
                  <Maximize2 className="h-3 w-3 text-accent" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Fullscreen [ESC]</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 2. THE MARKER: Pure white square (#FFFFFF) with white margin */}
        <div
          className="relative w-full aspect-square flex items-center justify-center rounded-none overflow-hidden p-4 sm:p-6 md:p-8 marker-canvas border-b border-[#0B1F3A]/20 mx-auto"
          style={{
            height: `${size}px`,
            maxHeight: `${size}px`,
          }}
          data-no-drag="true"
        >
          {selectedMarker ? (
            <div className="w-full h-full flex items-center justify-center pointer-events-none">
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
                <div className="w-full h-full border border-dashed border-[#0B1F3A]/30 p-3 sm:p-4 flex flex-col items-center justify-center text-center bg-[#0B1F3A]/5 text-[#0B1F3A]">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#0B1F3A]/60 mb-0.5">
                    MISSING MARKER IMAGE
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold mb-0.5 text-[#0B1F3A]">
                    {selectedMarker.id}
                  </span>
                  <span className="font-mono text-[11px] mb-2 text-[#0B1F3A]/80 line-clamp-1">
                    {selectedMarker.name}
                  </span>
                  <span className="font-mono text-[9px] sm:text-[10px] bg-[#0B1F3A]/10 px-2 py-0.5 rounded-sm border border-[#0B1F3A]/20 text-[#0B1F3A] break-all max-w-[220px]">
                    File: /public{selectedMarker.image}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4 text-[#0B1F3A]/60 pointer-events-none">
              <div className="w-10 h-10 rounded-lg border border-dashed border-[#0B1F3A]/20 flex items-center justify-center mb-1.5 font-mono text-xs text-[#0B1F3A]/60">
                AR
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#0B1F3A]/60">
                No marker selected
              </span>
            </div>
          )}
        </div>

        {/* 3. SLIM BOTTOM ROW (28px): ID & name + Size slider */}
        <div
          data-panel-bottom-row="true"
          className="h-[28px] min-h-[28px] max-h-[28px] px-3 bg-bg flex items-center justify-between gap-2 overflow-hidden border-t border-border"
          style={{ height: '28px', minHeight: '28px' }}
          data-no-drag="true"
        >
          {/* Left: TextMorph ID and Name in mono */}
          <div className="truncate min-w-0 shrink">
            {selectedMarker ? (
              <TextMorph
                idText={selectedMarker.id}
                nameText={selectedMarker.name}
              />
            ) : (
              <span className="font-mono text-[10px] text-text-muted italic">
                Waiting...
              </span>
            )}
          </div>

          {/* Right: Compact size slider */}
          <div
            className="flex items-center gap-1.5 shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <ZoomIn className="h-3 w-3 text-text-muted shrink-0" aria-hidden="true" />
            <div className="w-16 sm:w-20">
              <Slider
                value={[size]}
                min={200}
                max={640}
                step={10}
                onValueChange={(val) => onSizeChange(val[0])}
                aria-label={`Slot ${slotNumber} marker size`}
              />
            </div>
            <span className="font-mono text-[10px] text-text-muted w-9 text-right tabular-nums">
              {size}px
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
