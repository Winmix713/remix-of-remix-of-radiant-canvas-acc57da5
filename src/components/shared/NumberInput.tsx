/**
 * Shared NumberInput Component
 * Unified number input field used across the editor
 */

import React from "react";
import { cn } from "@/lib/utils";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  className?: string;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, min, max, step = 1, unit = "", className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-0.5 bg-editor-surface rounded-lg px-2.5 py-1.5 border border-editor-border",
          "focus-within:border-editor-border-hover transition-colors",
          className
        )}
      >
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) {
              const clamped = Math.max(min ?? v, Math.min(max ?? v, v));
              onChange(clamped);
            }
          }}
          min={min}
          max={max}
          step={step}
          className="w-12 bg-transparent border-none outline-none text-xs text-right text-foreground font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          {...props}
        />
        {unit && <span className="text-[9px] text-editor-text-dim ml-0.5">{unit}</span>}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";
