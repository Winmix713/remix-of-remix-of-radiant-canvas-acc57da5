import type { EditorNode } from "@/store/types";
import { getPropertySchemaForNode } from "@/editor/core/property-schema";
import { PropertyGroup } from "./PropertyGroup";

interface PropertyPanelProps {
  node?: EditorNode | null;
  onChange: (path: string, value: unknown) => void;
}

const getValueAtPath = (obj: Record<string, unknown>, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

export function PropertyPanel({ node, onChange }: PropertyPanelProps) {
  const schema = getPropertySchemaForNode(node);

  if (!node || !schema) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-xs text-white/40">
        Select an effect layer to inspect and edit its properties.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schema.groups.map((group) => (
        <PropertyGroup
          key={group.id}
          group={group}
          node={node}
          getValue={(path) => getValueAtPath(node as unknown as Record<string, unknown>, path)}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
