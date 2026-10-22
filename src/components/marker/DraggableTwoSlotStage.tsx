import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Marker } from '@/data/markers';
import { ModuleId } from '@/data/modules';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { WindowMarkerPanel } from './WindowMarkerPanel';

interface Position {
  x: number;
  y: number;
}

interface StoredLayout {
  fracX1: number;
  fracY1: number;
  size1: number;
  fracX2: number;
  fracY2: number;
  size2: number;
}

const MIN_GAP = 0;
const SNAP_THRESHOLD = 12;
const DEFAULT_SIZE = 360;
const MIN_PANEL_WIDTH = 240;

function getPanelDims(size: number) {
  return {
    width: Math.max(MIN_PANEL_WIDTH, size),
    height: size + 64, // 36px title bar + size px marker + 28px bottom row
  };
}

function rectsOverlap(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number,
  gap: number = MIN_GAP
): boolean {
  return (
    x1 < x2 + w2 + gap &&
    x1 + w1 + gap > x2 &&
    y1 < y2 + h2 + gap &&
    y1 + h1 + gap > y2
  );
}

function computeShortestGap(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
): number {
  let dx = 0;
  if (x1 + w1 <= x2) {
    dx = x2 - (x1 + w1);
  } else if (x2 + w2 <= x1) {
    dx = x1 - (x2 + w2);
  }

  let dy = 0;
  if (y1 + h1 <= y2) {
    dy = y2 - (y1 + h1);
  } else if (y2 + h2 <= y1) {
    dy = y1 - (y2 + h2);
  }

  if (dx === 0 && dy === 0) return 0;
  if (dx === 0) return Math.round(dy);
  if (dy === 0) return Math.round(dx);
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

// Minimum penetration collision resolution
function resolveCollision(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  stageW: number,
  stageH: number
): { x: number; y: number } {
  if (!rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh, MIN_GAP)) {
    return { x: ax, y: ay };
  }

  // Penetrations along 4 directions
  const leftPen = ax + aw - bx + MIN_GAP;
  const rightPen = bx + bw - ax + MIN_GAP;
  const topPen = ay + ah - by + MIN_GAP;
  const bottomPen = by + bh - ay + MIN_GAP;

  const candidates: { x: number; y: number; dist: number }[] = [];

  // Push Left
  const cLeftX = bx - aw - MIN_GAP;
  if (cLeftX >= 0) {
    candidates.push({ x: cLeftX, y: ay, dist: leftPen });
  }

  // Push Right
  const cRightX = bx + bw + MIN_GAP;
  if (cRightX + aw <= stageW) {
    candidates.push({ x: cRightX, y: ay, dist: rightPen });
  }

  // Push Top
  const cTopY = by - ah - MIN_GAP;
  if (cTopY >= 0) {
    candidates.push({ x: ax, y: cTopY, dist: topPen });
  }

  // Push Bottom
  const cBottomY = by + bh + MIN_GAP;
  if (cBottomY + ah <= stageH) {
    candidates.push({ x: ax, y: cBottomY, dist: bottomPen });
  }

  candidates.sort((a, b) => a.dist - b.dist);

  for (const c of candidates) {
    const clampedX = Math.max(0, Math.min(stageW - aw, c.x));
    const clampedY = Math.max(0, Math.min(stageH - ah, c.y));
    if (!rectsOverlap(clampedX, clampedY, aw, ah, bx, by, bw, bh, MIN_GAP)) {
      return { x: clampedX, y: clampedY };
    }
  }

  // Fallback to least penetration clamped
  const fallbackX = Math.max(0, Math.min(stageW - aw, ax));
  const fallbackY = Math.max(0, Math.min(stageH - ah, ay));
  return { x: fallbackX, y: fallbackY };
}

// Edge snap flush (gap 0) within 12px
function applyEdgeSnap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  stageW: number,
  stageH: number
): { x: number; y: number } {
  let x = ax;
  let y = ay;

  // 1. Stage bounds snap
  if (Math.abs(x) <= SNAP_THRESHOLD) x = 0;
  if (Math.abs(stageW - aw - x) <= SNAP_THRESHOLD) x = stageW - aw;
  if (Math.abs(y) <= SNAP_THRESHOLD) y = 0;
  if (Math.abs(stageH - ah - y) <= SNAP_THRESHOLD) y = stageH - ah;

  // 2. Relative to other panel
  const yOverlapOrAlign = y < by + bh && y + ah > by;
  const xOverlapOrAlign = x < bx + bw && x + aw > bx;

  if (yOverlapOrAlign) {
    // Snap A's right to B's left
    if (Math.abs(x + aw - bx) <= SNAP_THRESHOLD) {
      x = bx - aw;
    }
    // Snap A's left to B's right
    else if (Math.abs(x - (bx + bw)) <= SNAP_THRESHOLD) {
      x = bx + bw;
    }
  }

  if (xOverlapOrAlign) {
    // Snap A's bottom to B's top
    if (Math.abs(y + ah - by) <= SNAP_THRESHOLD) {
      y = by - ah;
    }
    // Snap A's top to B's bottom
    else if (Math.abs(y - (by + bh)) <= SNAP_THRESHOLD) {
      y = by + bh;
    }
  }

  // 3. Edge alignment snap
  if (Math.abs(y - by) <= SNAP_THRESHOLD) y = by;
  else if (Math.abs(y + ah - (by + bh)) <= SNAP_THRESHOLD) y = by + bh - ah;

  if (Math.abs(x - bx) <= SNAP_THRESHOLD) x = bx;
  else if (Math.abs(x + aw - (bx + bw)) <= SNAP_THRESHOLD) x = bx + bw - aw;

  // Re-clamp to stage
  x = Math.max(0, Math.min(stageW - aw, x));
  y = Math.max(0, Math.min(stageH - ah, y));

  // If snapping introduced overlap, resolve collision again
  if (rectsOverlap(x, y, aw, ah, bx, by, bw, bh, MIN_GAP)) {
    return resolveCollision(x, y, aw, ah, bx, by, bw, bh, stageW, stageH);
  }

  return { x, y };
}

export interface DraggableTwoSlotStageProps {
  moduleId: ModuleId;
  markers: Marker[];
  slot0Id: string | null;
  slot1Id: string | null;
  onSelectSlot0: (id: string) => void;
  onSelectSlot1: (id: string) => void;
  onOpenFullscreen: (slotIndex: number) => void;
  slot0Label?: string;
  slot1Label?: string;
}

export const DraggableTwoSlotStage: React.FC<DraggableTwoSlotStageProps> = ({
  moduleId,
  markers,
  slot0Id,
  slot1Id,
  onSelectSlot0,
  onSelectSlot1,
  onOpenFullscreen,
  slot0Label = 'Slot 1',
  slot1Label = 'Slot 2',
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const panel1Ref = useRef<HTMLDivElement>(null);
  const panel2Ref = useRef<HTMLDivElement>(null);
  const gapReadoutRef = useRef<HTMLSpanElement>(null);

  const [size1, setSize1] = useState(DEFAULT_SIZE);
  const [size2, setSize2] = useState(DEFAULT_SIZE);
  const [pos1, setPos1] = useState<Position>({ x: 24, y: 24 });
  const [pos2, setPos2] = useState<Position>({ x: 410, y: 24 });
  const [activeDraggingSlot, setActiveDraggingSlot] = useState<1 | 2 | null>(null);
  const [liveGap, setLiveGap] = useState(24);
  const [isInitialized, setIsInitialized] = useState(false);

  // Position refs for rAF updates without React re-render per move
  const pos1Ref = useRef<Position>({ x: 24, y: 24 });
  const pos2Ref = useRef<Position>({ x: 410, y: 24 });
  const size1Ref = useRef(DEFAULT_SIZE);
  const size2Ref = useRef(DEFAULT_SIZE);

  pos1Ref.current = pos1;
  pos2Ref.current = pos2;
  size1Ref.current = size1;
  size2Ref.current = size2;

  const storageKey = `spectraar-layout-${moduleId}`;

  // Default arrangement calculation
  const computeDefaultLayout = useCallback(
    (stageW: number, stageH: number) => {
      const isMobileStacked = stageW < 640;
      let s1 = DEFAULT_SIZE;
      let s2 = DEFAULT_SIZE;

      if (isMobileStacked) {
        const availWidth = Math.max(MIN_PANEL_WIDTH, stageW - 32);
        s1 = Math.min(DEFAULT_SIZE, availWidth);
        s2 = Math.min(DEFAULT_SIZE, availWidth);

        const d1 = getPanelDims(s1);
        const d2 = getPanelDims(s2);

        const x1 = Math.max(8, Math.round((stageW - d1.width) / 2));
        const y1 = 16;
        const x2 = Math.max(8, Math.round((stageW - d2.width) / 2));
        const y2 = y1 + d1.height + 24;

        return { x1, y1, s1, x2, y2, s2 };
      }

      // Side by side on desktop / tablet
      let d1 = getPanelDims(s1);
      let d2 = getPanelDims(s2);
      const totalW = d1.width + 24 + d2.width;

      if (totalW > stageW - 32) {
        const maxFitting = Math.max(200, Math.floor((stageW - 32 - 24) / 2));
        s1 = maxFitting;
        s2 = maxFitting;
        d1 = getPanelDims(s1);
        d2 = getPanelDims(s2);
      }

      const fittingTotalW = d1.width + 24 + d2.width;
      const x1 = Math.max(16, Math.round((stageW - fittingTotalW) / 2));
      const y1 = Math.max(16, Math.round((stageH - d1.height) / 2));
      const x2 = x1 + d1.width + 24;
      const y2 = Math.max(16, Math.round((stageH - d2.height) / 2));

      return { x1, y1, s1, x2, y2, s2 };
    },
    []
  );

  // Initialize and handle resize
  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const initOrUpdateLayout = () => {
      const rect = stageEl.getBoundingClientRect();
      const stageW = rect.width;
      const stageH = rect.height;
      if (stageW <= 0 || stageH <= 0) return;

      let stored: StoredLayout | null = null;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) stored = JSON.parse(raw);
      } catch {
        // ignore
      }

      if (stored) {
        const s1 = stored.size1;
        const s2 = stored.size2;
        const d1 = getPanelDims(s1);
        const d2 = getPanelDims(s2);

        let x1 = Math.max(0, Math.min(stageW - d1.width, Math.round(stored.fracX1 * stageW)));
        let y1 = Math.max(0, Math.min(stageH - d1.height, Math.round(stored.fracY1 * stageH)));
        let x2 = Math.max(0, Math.min(stageW - d2.width, Math.round(stored.fracX2 * stageW)));
        let y2 = Math.max(0, Math.min(stageH - d2.height, Math.round(stored.fracY2 * stageH)));

        // Re-resolve collision if stage resized
        if (rectsOverlap(x1, y1, d1.width, d1.height, x2, y2, d2.width, d2.height, MIN_GAP)) {
          const resolved = resolveCollision(x2, y2, d2.width, d2.height, x1, y1, d1.width, d1.height, stageW, stageH);
          x2 = resolved.x;
          y2 = resolved.y;
        }

        setSize1(s1);
        setSize2(s2);
        setPos1({ x: x1, y: y1 });
        setPos2({ x: x2, y: y2 });
        pos1Ref.current = { x: x1, y: y1 };
        pos2Ref.current = { x: x2, y: y2 };

        const gap = computeShortestGap(x1, y1, d1.width, d1.height, x2, y2, d2.width, d2.height);
        setLiveGap(gap);
      } else {
        const def = computeDefaultLayout(stageW, stageH);
        setSize1(def.s1);
        setSize2(def.s2);
        setPos1({ x: def.x1, y: def.y1 });
        setPos2({ x: def.x2, y: def.y2 });
        pos1Ref.current = { x: def.x1, y: def.y1 };
        pos2Ref.current = { x: def.x2, y: def.y2 };

        const d1 = getPanelDims(def.s1);
        const d2 = getPanelDims(def.s2);
        const gap = computeShortestGap(def.x1, def.y1, d1.width, d1.height, def.x2, def.y2, d2.width, d2.height);
        setLiveGap(gap);
      }
      setIsInitialized(true);
    };

    initOrUpdateLayout();

    const ro = new ResizeObserver(() => {
      initOrUpdateLayout();
    });
    ro.observe(stageEl);
    return () => ro.disconnect();
  }, [storageKey, computeDefaultLayout]);

  // Save layout helper
  const saveLayoutToStorage = useCallback(
    (p1: Position, s1: number, p2: Position, s2: number) => {
      const stageEl = stageRef.current;
      if (!stageEl) return;
      const stageW = stageEl.clientWidth || 1;
      const stageH = stageEl.clientHeight || 1;

      const layout: StoredLayout = {
        fracX1: p1.x / stageW,
        fracY1: p1.y / stageH,
        size1: s1,
        fracX2: p2.x / stageW,
        fracY2: p2.y / stageH,
        size2: s2,
      };

      try {
        localStorage.setItem(storageKey, JSON.stringify(layout));
      } catch {
        // ignore
      }
    },
    [storageKey]
  );

  // HIGH PERFORMANCE DRAG ENGINE
  const dragContextRef = useRef<{
    activeSlot: 1 | 2;
    startX: number;
    startY: number;
    startPos1: Position;
    startPos2: Position;
    stageW: number;
    stageH: number;
    rafId: number | null;
    latestMove: { x: number; y: number } | null;
  } | null>(null);

  const startDrag = useCallback(
    (slotNumber: 1 | 2, e: React.PointerEvent<HTMLDivElement>) => {
      // Don't drag if clicking buttons, select, or marked with data-no-drag
      const target = e.target as HTMLElement;
      if (target.closest('button, [role="combobox"], select, [data-no-drag="true"]')) {
        return;
      }

      const stageEl = stageRef.current;
      if (!stageEl) return;

      const stageRect = stageEl.getBoundingClientRect();
      const handleEl = e.currentTarget;
      try {
        handleEl.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      document.body.classList.add('is-dragging-panel');
      setActiveDraggingSlot(slotNumber);

      dragContextRef.current = {
        activeSlot: slotNumber,
        startX: e.clientX,
        startY: e.clientY,
        startPos1: { ...pos1Ref.current },
        startPos2: { ...pos2Ref.current },
        stageW: stageRect.width,
        stageH: stageRect.height,
        rafId: null,
        latestMove: { x: e.clientX, y: e.clientY },
      };

      const handlePointerMove = (moveEvt: PointerEvent) => {
        const ctx = dragContextRef.current;
        if (!ctx) return;
        ctx.latestMove = { x: moveEvt.clientX, y: moveEvt.clientY };

        if (ctx.rafId !== null) return;

        ctx.rafId = requestAnimationFrame(() => {
          if (!dragContextRef.current) return;
          const { activeSlot, startX, startY, startPos1, startPos2, stageW, stageH, latestMove } =
            dragContextRef.current;
          dragContextRef.current.rafId = null;

          if (!latestMove) return;

          const dx = latestMove.x - startX;
          const dy = latestMove.y - startY;

          const d1 = getPanelDims(size1Ref.current);
          const d2 = getPanelDims(size2Ref.current);

          let curPos1 = { ...startPos1 };
          let curPos2 = { ...startPos2 };

          if (activeSlot === 1) {
            let nextX = Math.max(0, Math.min(stageW - d1.width, startPos1.x + dx));
            let nextY = Math.max(0, Math.min(stageH - d1.height, startPos1.y + dy));

            // Collision with Panel 2
            const resolved = resolveCollision(
              nextX,
              nextY,
              d1.width,
              d1.height,
              curPos2.x,
              curPos2.y,
              d2.width,
              d2.height,
              stageW,
              stageH
            );

            // Edge snap
            const snapped = applyEdgeSnap(
              resolved.x,
              resolved.y,
              d1.width,
              d1.height,
              curPos2.x,
              curPos2.y,
              d2.width,
              d2.height,
              stageW,
              stageH
            );

            curPos1 = snapped;
            pos1Ref.current = curPos1;

            if (panel1Ref.current) {
              panel1Ref.current.style.transform = `translate3d(${curPos1.x}px, ${curPos1.y}px, 0)`;
            }
          } else {
            let nextX = Math.max(0, Math.min(stageW - d2.width, startPos2.x + dx));
            let nextY = Math.max(0, Math.min(stageH - d2.height, startPos2.y + dy));

            // Collision with Panel 1
            const resolved = resolveCollision(
              nextX,
              nextY,
              d2.width,
              d2.height,
              curPos1.x,
              curPos1.y,
              d1.width,
              d1.height,
              stageW,
              stageH
            );

            // Edge snap
            const snapped = applyEdgeSnap(
              resolved.x,
              resolved.y,
              d2.width,
              d2.height,
              curPos1.x,
              curPos1.y,
              d1.width,
              d1.height,
              stageW,
              stageH
            );

            curPos2 = snapped;
            pos2Ref.current = curPos2;

            if (panel2Ref.current) {
              panel2Ref.current.style.transform = `translate3d(${curPos2.x}px, ${curPos2.y}px, 0)`;
            }
          }

          // Live gap update directly to DOM node (no React re-render per move!)
          const gap = computeShortestGap(
            curPos1.x,
            curPos1.y,
            d1.width,
            d1.height,
            curPos2.x,
            curPos2.y,
            d2.width,
            d2.height
          );
          if (gapReadoutRef.current) {
            gapReadoutRef.current.innerText = `Gap ${gap} px`;
          }
        });
      };

      const handlePointerUp = (upEvt: PointerEvent) => {
        try {
          handleEl.releasePointerCapture(upEvt.pointerId);
        } catch {
          // ignore
        }

        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);

        document.body.classList.remove('is-dragging-panel');
        setActiveDraggingSlot(null);

        if (dragContextRef.current?.rafId) {
          cancelAnimationFrame(dragContextRef.current.rafId);
        }
        dragContextRef.current = null;

        // Commit final positions to React state
        const finalP1 = { ...pos1Ref.current };
        const finalP2 = { ...pos2Ref.current };
        setPos1(finalP1);
        setPos2(finalP2);

        const d1 = getPanelDims(size1Ref.current);
        const d2 = getPanelDims(size2Ref.current);
        const finalGap = computeShortestGap(
          finalP1.x,
          finalP1.y,
          d1.width,
          d1.height,
          finalP2.x,
          finalP2.y,
          d2.width,
          d2.height
        );
        setLiveGap(finalGap);

        saveLayoutToStorage(finalP1, size1Ref.current, finalP2, size2Ref.current);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    },
    [saveLayoutToStorage]
  );

  // Keyboard navigation on Title Bar (8px step, Shift: 32px step)
  const handleKeyboardMove = useCallback(
    (slotNumber: 1 | 2, e: React.KeyboardEvent<HTMLDivElement>) => {
      const isShift = e.shiftKey;
      const step = isShift ? 32 : 8;

      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;

      e.preventDefault();

      const stageEl = stageRef.current;
      if (!stageEl) return;
      const stageW = stageEl.clientWidth;
      const stageH = stageEl.clientHeight;

      const d1 = getPanelDims(size1Ref.current);
      const d2 = getPanelDims(size2Ref.current);

      if (slotNumber === 1) {
        let nextX = Math.max(0, Math.min(stageW - d1.width, pos1Ref.current.x + dx));
        let nextY = Math.max(0, Math.min(stageH - d1.height, pos1Ref.current.y + dy));

        const resolved = resolveCollision(
          nextX,
          nextY,
          d1.width,
          d1.height,
          pos2Ref.current.x,
          pos2Ref.current.y,
          d2.width,
          d2.height,
          stageW,
          stageH
        );

        pos1Ref.current = resolved;
        setPos1(resolved);
        if (panel1Ref.current) {
          panel1Ref.current.style.transform = `translate3d(${resolved.x}px, ${resolved.y}px, 0)`;
        }
      } else {
        let nextX = Math.max(0, Math.min(stageW - d2.width, pos2Ref.current.x + dx));
        let nextY = Math.max(0, Math.min(stageH - d2.height, pos2Ref.current.y + dy));

        const resolved = resolveCollision(
          nextX,
          nextY,
          d2.width,
          d2.height,
          pos1Ref.current.x,
          pos1Ref.current.y,
          d1.width,
          d1.height,
          stageW,
          stageH
        );

        pos2Ref.current = resolved;
        setPos2(resolved);
        if (panel2Ref.current) {
          panel2Ref.current.style.transform = `translate3d(${resolved.x}px, ${resolved.y}px, 0)`;
        }
      }

      const gap = computeShortestGap(
        pos1Ref.current.x,
        pos1Ref.current.y,
        d1.width,
        d1.height,
        pos2Ref.current.x,
        pos2Ref.current.y,
        d2.width,
        d2.height
      );
      setLiveGap(gap);
      if (gapReadoutRef.current) {
        gapReadoutRef.current.innerText = `Gap ${gap} px`;
      }

      saveLayoutToStorage(pos1Ref.current, size1Ref.current, pos2Ref.current, size2Ref.current);
    },
    [saveLayoutToStorage]
  );

  // Resize handler for Size Slider
  const handleSizeChange = useCallback(
    (slotNumber: 1 | 2, targetSize: number) => {
      const stageEl = stageRef.current;
      if (!stageEl) return;
      const stageW = stageEl.clientWidth;
      const stageH = stageEl.clientHeight;

      if (slotNumber === 1) {
        const d2 = getPanelDims(size2Ref.current);
        let s1 = Math.max(200, Math.min(640, targetSize));
        let d1 = getPanelDims(s1);

        // Cap to fit stage
        if (d1.width > stageW) {
          s1 = Math.max(200, stageW);
          d1 = getPanelDims(s1);
        }
        if (d1.height > stageH) {
          s1 = Math.max(200, stageH - 64);
          d1 = getPanelDims(s1);
        }

        let curX = Math.max(0, Math.min(stageW - d1.width, pos1Ref.current.x));
        let curY = Math.max(0, Math.min(stageH - d1.height, pos1Ref.current.y));

        // If colliding with panel 2, try to nudge
        if (rectsOverlap(curX, curY, d1.width, d1.height, pos2Ref.current.x, pos2Ref.current.y, d2.width, d2.height, MIN_GAP)) {
          const resolved = resolveCollision(
            curX,
            curY,
            d1.width,
            d1.height,
            pos2Ref.current.x,
            pos2Ref.current.y,
            d2.width,
            d2.height,
            stageW,
            stageH
          );

          if (rectsOverlap(resolved.x, resolved.y, d1.width, d1.height, pos2Ref.current.x, pos2Ref.current.y, d2.width, d2.height, MIN_GAP)) {
            // Cannot fit at this size without overlap: find largest size that fits
            let testSize = s1 - 10;
            while (testSize >= 200) {
              const testD = getPanelDims(testSize);
              const testResolved = resolveCollision(
                curX,
                curY,
                testD.width,
                testD.height,
                pos2Ref.current.x,
                pos2Ref.current.y,
                d2.width,
                d2.height,
                stageW,
                stageH
              );
              if (!rectsOverlap(testResolved.x, testResolved.y, testD.width, testD.height, pos2Ref.current.x, pos2Ref.current.y, d2.width, d2.height, MIN_GAP)) {
                s1 = testSize;
                d1 = testD;
                curX = testResolved.x;
                curY = testResolved.y;
                break;
              }
              testSize -= 10;
            }
          } else {
            curX = resolved.x;
            curY = resolved.y;
          }
        }

        setSize1(s1);
        size1Ref.current = s1;
        setPos1({ x: curX, y: curY });
        pos1Ref.current = { x: curX, y: curY };

        if (panel1Ref.current) {
          panel1Ref.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
        }

        const gap = computeShortestGap(curX, curY, d1.width, d1.height, pos2Ref.current.x, pos2Ref.current.y, d2.width, d2.height);
        setLiveGap(gap);
        if (gapReadoutRef.current) {
          gapReadoutRef.current.innerText = `Gap ${gap} px`;
        }

        saveLayoutToStorage({ x: curX, y: curY }, s1, pos2Ref.current, size2Ref.current);
      } else {
        const d1 = getPanelDims(size1Ref.current);
        let s2 = Math.max(200, Math.min(640, targetSize));
        let d2 = getPanelDims(s2);

        // Cap to fit stage
        if (d2.width > stageW) {
          s2 = Math.max(200, stageW);
          d2 = getPanelDims(s2);
        }
        if (d2.height > stageH) {
          s2 = Math.max(200, stageH - 64);
          d2 = getPanelDims(s2);
        }

        let curX = Math.max(0, Math.min(stageW - d2.width, pos2Ref.current.x));
        let curY = Math.max(0, Math.min(stageH - d2.height, pos2Ref.current.y));

        // If colliding with panel 1, try to nudge
        if (rectsOverlap(curX, curY, d2.width, d2.height, pos1Ref.current.x, pos1Ref.current.y, d1.width, d1.height, MIN_GAP)) {
          const resolved = resolveCollision(
            curX,
            curY,
            d2.width,
            d2.height,
            pos1Ref.current.x,
            pos1Ref.current.y,
            d1.width,
            d1.height,
            stageW,
            stageH
          );

          if (rectsOverlap(resolved.x, resolved.y, d2.width, d2.height, pos1Ref.current.x, pos1Ref.current.y, d1.width, d1.height, MIN_GAP)) {
            // Cannot fit at this size without overlap: find largest size that fits
            let testSize = s2 - 10;
            while (testSize >= 200) {
              const testD = getPanelDims(testSize);
              const testResolved = resolveCollision(
                curX,
                curY,
                testD.width,
                testD.height,
                pos1Ref.current.x,
                pos1Ref.current.y,
                d1.width,
                d1.height,
                stageW,
                stageH
              );
              if (!rectsOverlap(testResolved.x, testResolved.y, testD.width, testD.height, pos1Ref.current.x, pos1Ref.current.y, d1.width, d1.height, MIN_GAP)) {
                s2 = testSize;
                d2 = testD;
                curX = testResolved.x;
                curY = testResolved.y;
                break;
              }
              testSize -= 10;
            }
          } else {
            curX = resolved.x;
            curY = resolved.y;
          }
        }

        setSize2(s2);
        size2Ref.current = s2;
        setPos2({ x: curX, y: curY });
        pos2Ref.current = { x: curX, y: curY };

        if (panel2Ref.current) {
          panel2Ref.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
        }

        const gap = computeShortestGap(pos1Ref.current.x, pos1Ref.current.y, d1.width, d1.height, curX, curY, d2.width, d2.height);
        setLiveGap(gap);
        if (gapReadoutRef.current) {
          gapReadoutRef.current.innerText = `Gap ${gap} px`;
        }

        saveLayoutToStorage(pos1Ref.current, size1Ref.current, { x: curX, y: curY }, s2);
      }
    },
    [saveLayoutToStorage]
  );

  // Reset layout handler with 200ms ease transition
  const handleResetLayout = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }

    const stageEl = stageRef.current;
    if (!stageEl) return;
    const stageW = stageEl.clientWidth;
    const stageH = stageEl.clientHeight;

    const def = computeDefaultLayout(stageW, stageH);

    // Apply 200ms ease CSS transition during reset
    if (panel1Ref.current) {
      panel1Ref.current.style.transition = 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), width 200ms ease, height 200ms ease';
      panel1Ref.current.style.transform = `translate3d(${def.x1}px, ${def.y1}px, 0)`;
    }
    if (panel2Ref.current) {
      panel2Ref.current.style.transition = 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), width 200ms ease, height 200ms ease';
      panel2Ref.current.style.transform = `translate3d(${def.x2}px, ${def.y2}px, 0)`;
    }

    setSize1(def.s1);
    setSize2(def.s2);
    setPos1({ x: def.x1, y: def.y1 });
    setPos2({ x: def.x2, y: def.y2 });
    pos1Ref.current = { x: def.x1, y: def.y1 };
    pos2Ref.current = { x: def.x2, y: def.y2 };
    size1Ref.current = def.s1;
    size2Ref.current = def.s2;

    const d1 = getPanelDims(def.s1);
    const d2 = getPanelDims(def.s2);
    const gap = computeShortestGap(def.x1, def.y1, d1.width, d1.height, def.x2, def.y2, d2.width, d2.height);
    setLiveGap(gap);
    if (gapReadoutRef.current) {
      gapReadoutRef.current.innerText = `Gap ${gap} px`;
    }

    setTimeout(() => {
      if (panel1Ref.current) panel1Ref.current.style.transition = '';
      if (panel2Ref.current) panel2Ref.current.style.transition = '';
    }, 220);
  }, [storageKey, computeDefaultLayout]);

  return (
    <div className="w-full flex-1 flex flex-col pb-20">
      {/* BOUNDED STAGE: Area below header spanning full content width, min-height 480px, 1px dashed border at foreground 20% */}
      <div
        ref={stageRef}
        data-stage="bounded-stage"
        className="relative w-full flex-1 min-h-[480px] h-[calc(100vh-190px)] rounded-[18px] border border-dashed border-[rgba(var(--color-fg-rgb)/0.2)] overflow-hidden transition-colors"
        style={{
          minHeight: 'min(520px, 90vh)',
        }}
      >
        {isInitialized && (
          <>
            {/* Slot 1 Floating Panel */}
            <div
              ref={panel1Ref}
              data-panel-slot="1"
              className="absolute left-0 top-0 will-change-transform z-10"
              style={{
                transform: `translate3d(${pos1.x}px, ${pos1.y}px, 0)`,
              }}
            >
              <WindowMarkerPanel
                slotNumber={1}
                slotLabel={slot0Label}
                markers={markers}
                selectedMarkerId={slot0Id}
                size={size1}
                onSelectMarker={onSelectSlot0}
                onOpenFullscreen={() => onOpenFullscreen(0)}
                onSizeChange={(s) => handleSizeChange(1, s)}
                onPointerDownTitle={(e) => startDrag(1, e)}
                onKeyDownTitle={(e) => handleKeyboardMove(1, e)}
                isDragging={activeDraggingSlot === 1}
              />
            </div>

            {/* Slot 2 Floating Panel */}
            <div
              ref={panel2Ref}
              data-panel-slot="2"
              className="absolute left-0 top-0 will-change-transform z-10"
              style={{
                transform: `translate3d(${pos2.x}px, ${pos2.y}px, 0)`,
              }}
            >
              <WindowMarkerPanel
                slotNumber={2}
                slotLabel={slot1Label}
                markers={markers}
                selectedMarkerId={slot1Id}
                size={size2}
                onSelectMarker={onSelectSlot1}
                onOpenFullscreen={() => onOpenFullscreen(1)}
                onSizeChange={(s) => handleSizeChange(2, s)}
                onPointerDownTitle={(e) => startDrag(2, e)}
                onKeyDownTitle={(e) => handleKeyboardMove(2, e)}
                isDragging={activeDraggingSlot === 2}
              />
            </div>
          </>
        )}
      </div>

      {/* FIXED SLIM BOTTOM TOOLBAR: replaces old gap slider */}
      <aside
        aria-label="Window layout adjustment"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg py-2.5 px-4 sm:px-6 transition-colors"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Left: label and live mono readout */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            <span className="font-mono text-xs uppercase tracking-wider text-text-muted hidden sm:inline">
              CAMERA VIEW ADJUSTMENT
            </span>
            <span
              ref={gapReadoutRef}
              className="font-mono text-xs text-accent font-semibold px-3 py-0.5 rounded-full bg-surface border border-border tabular-nums"
            >
              Gap {liveGap} px
            </span>
          </div>

          {/* Right: Reset layout button */}
          <div className="shrink-0 flex items-center gap-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetLayout}
                    aria-label="Reset window panels layout to default"
                    className="h-7 px-2.5 text-[11px] flex items-center gap-1.5 cursor-pointer font-mono"
                  >
                    <RotateCcw className="h-3 w-3 text-text-muted" />
                    <span>RESET LAYOUT</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset marker windows to default layout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </aside>
    </div>
  );
};
