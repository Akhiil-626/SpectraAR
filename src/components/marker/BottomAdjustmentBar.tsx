import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BottomAdjustmentBarProps {
  gap: number;
  minGap?: number;
  maxGap?: number;
  defaultGap?: number;
  onGapChange: (newGap: number) => void;
  onReset: () => void;
}

export const BottomAdjustmentBar: React.FC<BottomAdjustmentBarProps> = ({
  gap,
  minGap = 8,
  maxGap = 160,
  defaultGap = 32,
  onGapChange,
  onReset,
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <aside
        aria-label="Slot gap adjustment"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg py-2.5 px-4 sm:px-6 transition-colors"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Left: label and mono readout */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            <span className="font-mono text-xs uppercase tracking-wider text-text-muted hidden sm:inline">
              CAMERA VIEW ADJUSTMENT
            </span>
            <span className="font-mono text-xs text-accent font-semibold px-3 py-0.5 rounded-full bg-surface border border-border">
              Gap {gap} px
            </span>
          </div>

          {/* Center: slider */}
          <div className="flex-1 max-w-md mx-2">
            <Slider
              value={[gap]}
              min={minGap}
              max={maxGap}
              step={2}
              onValueChange={(val) => onGapChange(val[0])}
              aria-label="Gap between markers"
            />
          </div>

          {/* Right: Reset button with tooltip */}
          <div className="shrink-0 flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  disabled={gap === defaultGap}
                  aria-label="Reset gap to default"
                  className="h-7 px-2.5 text-[11px] flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3 w-3 text-text-muted" />
                  <span>RESET</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset gap to default ({defaultGap} px)</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};
