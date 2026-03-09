import type { EditorNode } from "@/store/types";
import type { PropertyGroupSchema } from "@/editor/core/property-schema";
import { PropertyField } from "./PropertyField";

interface PropertyGroupProps {
  group: PropertyGroupSchema;
  node: EditorNode;
  getValue: (path: string) => unknown;
  onChange: (path: string, value: unknown) => void;
}

export function PropertyGroup({ group, node, getValue, onChange }: PropertyGroupProps) {
  if (group.condition && !group.condition(node)) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-3">
      <header>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
          {group.label}
        </h3>
      </header>
      <div className="space-y-3">
        {group.fields.map((field) => (
          <PropertyField
            key={field.key}
            field={field}
            value={getValue(field.key)}
            onChange={(value) => onChange(field.key, value)}
          />
        ))}
      </div>
    </section>
  );
}
