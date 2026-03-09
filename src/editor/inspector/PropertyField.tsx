import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumberInput } from "@/components/shared/NumberInput";
import type { PropertyFieldSchema } from "@/editor/core/property-schema";

interface PropertyFieldProps {
  field: PropertyFieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function PropertyField({ field, value, onChange }: PropertyFieldProps) {
  switch (field.type) {
    case "color":
      return (
        <label className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground font-medium">{field.label}</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={typeof value === "string" ? value : "#ffffff"}
              onChange={(event) => onChange(event.target.value)}
              className="h-8 w-10 rounded border border-editor-border bg-transparent"
            />
            <span className="text-[10px] font-mono text-editor-text-dim uppercase min-w-[64px] text-right">
              {typeof value === "string" ? value : "#ffffff"}
            </span>
          </div>
        </label>
      );
    case "number":
      return (
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground font-medium">{field.label}</span>
          <NumberInput
            value={typeof value === "number" ? value : Number(value ?? 0)}
            onChange={onChange as (value: number) => void}
            min={field.min}
            max={field.max}
            step={field.step}
            unit={field.unit}
          />
        </div>
      );
    case "toggle":
      return (
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground font-medium">{field.label}</span>
          <Switch checked={Boolean(value)} onCheckedChange={onChange as (value: boolean) => void} />
        </div>
      );
    case "select":
      return (
        <div className="space-y-1.5 text-xs">
          <span className="text-muted-foreground font-medium">{field.label}</span>
          <Select value={String(value ?? "")} onValueChange={onChange as (value: string) => void}>
            <SelectTrigger className="h-9 text-xs bg-editor-surface border-editor-border">
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "text":
    default:
      return (
        <label className="space-y-1.5 block text-xs">
          <span className="text-muted-foreground font-medium">{field.label}</span>
          <input
            type="text"
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            className="w-full h-9 rounded-md border border-editor-border bg-editor-surface px-3 text-xs text-foreground outline-none focus:border-editor-border-hover"
          />
        </label>
      );
  }
}
