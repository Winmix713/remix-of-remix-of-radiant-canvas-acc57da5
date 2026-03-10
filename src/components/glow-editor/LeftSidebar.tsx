import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Undo2, Redo2, Save, FolderOpen, Plus, Trash2, Eye, EyeOff,
  Layers, Sparkles, Shuffle, CopyPlus, Star, Search, Code,
  ChevronDown, GripVertical, Share2, Command, FolderPlus,
  Clipboard, ClipboardPaste, ChevronRight, Lock, Unlock,
  MoreHorizontal, Type, Image, Box, Component, Frame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import type { GlowState, GlowLayer, LayerGroup, CopiedLayerStyle } from "@/lib/glow-types";
import { BUILT_IN_PRESETS, PRESET_CATEGORIES } from "@/lib/glow-presets";
import { duplicateLayer, generateRandomGlow } from "@/lib/glow-utils";

// ── Section Card — glass container matching HTML reference ────────────────────
function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-[22px] overflow-hidden",
        className
      )}
      style={{
        background: `linear-gradient(155deg, rgba(255,255,255,0.042) 0%, rgba(255,255,255,0.012) 40%, transparent 100%), rgba(10,16,12,0.96)`,
        border: "1px solid rgba(168,255,80,0.09)",
        boxShadow: "0 18px 48px rgba(0,0,0,0.48), 0 4px 14px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.046)",
        backdropFilter: "blur(24px) saturate(160%)",
      }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[130px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 55% at 25% 0%, rgba(168,255,80,0.09), transparent 70%)" }}
      />
      {/* Inner border */}
      <div
        className="absolute inset-px pointer-events-none"
        style={{ borderRadius: 21, border: "1px solid rgba(255,255,255,0.022)" }}
      />
      <div className="relative z-[1] p-4 flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, label, count, children }: {
  icon: React.ReactNode; label: string; count?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 pb-[11px] border-b border-white/[0.07]">
      <div className="flex items-center gap-[7px] font-mono text-[9.5px] font-bold tracking-[0.14em] uppercase text-white/55">
        <span className="opacity-40 flex-shrink-0 w-3 h-3">{icon}</span>
        {label}
      </div>
      <div className="flex items-center gap-1">
        {count && (
          <span className="font-mono text-[9px] font-medium text-white/20 bg-white/[0.03] border border-white/[0.07] rounded-md px-[7px] py-[2px] whitespace-nowrap">
            {count}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

// ── Header Button ─────────────────────────────────────────────────────────────
function HdrBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-[26px] h-[26px] grid place-items-center rounded-lg bg-transparent border border-transparent text-white/20 cursor-pointer transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.07] hover:text-white/40"
    >
      {children}
    </button>
  );
}

// ── Mini Preset Preview ───────────────────────────────────────────────────────
function MiniPresetPreview({ colors }: { colors: string[] }) {
  return (
    <div
      className="relative h-[46px] rounded-[9px] overflow-hidden"
      style={{
        background: "rgba(5,9,6,0.85)",
        border: "1px solid rgba(255,255,255,0.055)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {colors.slice(0, 4).map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            background: c,
            width: "58%",
            height: "58%",
            top: `${8 + i * 10}%`,
            left: `${5 + i * 15}%`,
            filter: "blur(11px)",
            opacity: 0.84,
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.05), transparent 55%)" }}
      />
    </div>
  );
}

// ── Layer Item ────────────────────────────────────────────────────────────────
function LayerItem({
  layer, isSelected, onSelect, onToggleVis, onDuplicate, onRemove, onCopyStyle, onPasteStyle, copiedStyle,
  onDragStart, onDragEnd, onDragOver, onDrop, isDragOver, dragId,
}: {
  layer: GlowLayer; isSelected: boolean;
  onSelect: () => void; onToggleVis: (e: React.MouseEvent) => void;
  onDuplicate: () => void; onRemove: () => void;
  onCopyStyle: () => void; onPasteStyle: () => void; copiedStyle: boolean;
  onDragStart: (e: React.DragEvent) => void; onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean; dragId: string | null;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className={cn(
        "relative rounded-[11px] border transition-all duration-200 cursor-pointer select-none mb-[2px] group",
        isDragOver && dragId !== layer.id && "border-t-2 !border-t-[rgba(168,255,80,0.45)]",
      )}
      style={{ border: "1px solid transparent" }}
    >
      <div
        className={cn(
          "flex items-center gap-[3px] min-h-[36px] px-[6px] py-1 rounded-[10px] border border-transparent transition-all duration-200",
          isSelected
            ? "bg-[rgba(168,255,80,0.065)] border-[rgba(168,255,80,0.22)]"
            : "hover:bg-white/[0.06] hover:border-white/[0.07]",
        )}
        style={isSelected ? { boxShadow: "0 0 0 1px rgba(168,255,80,0.07), 0 4px 14px rgba(0,0,0,0.28)" } : {}}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div
            className="absolute left-[7px] top-[6px] bottom-[6px] w-[2px] rounded-full"
            style={{ background: "linear-gradient(to bottom, #c8ff88, #a8ff50)" }}
          />
        )}

        {/* Grip */}
        <div className="w-5 h-5 flex items-center justify-center text-white/20 cursor-grab rounded-[5px] flex-shrink-0 transition-all hover:text-white/40 hover:bg-white/[0.05]">
          <GripVertical className="w-[11px] h-[11px]" />
        </div>

        {/* Visibility */}
        <button
          onClick={onToggleVis}
          className={cn(
            "w-5 h-5 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-[5px] flex-shrink-0 transition-all hover:bg-white/[0.06]",
            layer.active ? "text-white/40 hover:text-white" : "text-white/20"
          )}
        >
          {layer.active ? <Eye className="w-[11px] h-[11px]" /> : <EyeOff className="w-[11px] h-[11px]" />}
        </button>

        {/* Color dot */}
        <div
          className="w-[17px] h-[17px] flex items-center justify-center rounded-[5px] flex-shrink-0"
        >
          <div
            className="w-3 h-3 rounded-full ring-1 ring-white/10"
            style={{ backgroundColor: layer.color }}
          />
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0 px-[3px]">
          <div className="text-[11.5px] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis tracking-[-0.01em]">
            {layer.name}
          </div>
          <div className="font-mono text-[9px] text-white/20 whitespace-nowrap overflow-hidden text-ellipsis mt-[1px]">
            {layer.blendMode} · {Math.round(layer.opacity * 100)}%
          </div>
        </div>

        {/* Clip mask indicator */}
        {layer.clipMask?.imageUrl && (
          <span className="text-[7px] px-1 py-0.5 rounded bg-[rgba(168,255,80,0.10)] text-[#a8ff50] font-bold uppercase tracking-wide">
            Mask
          </span>
        )}

        {/* Actions (on hover) */}
        <div className="flex items-center gap-[1px] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onCopyStyle(); }}
            className="w-[22px] h-[22px] flex items-center justify-center bg-transparent border-none cursor-pointer rounded-md transition-all text-white/20 hover:text-white hover:bg-white/[0.07]"
            title="Copy Style"
          >
            <Clipboard className="w-[11px] h-[11px]" />
          </button>
          {copiedStyle && (
            <button
              onClick={(e) => { e.stopPropagation(); onPasteStyle(); }}
              className="w-[22px] h-[22px] flex items-center justify-center bg-transparent border-none cursor-pointer rounded-md transition-all text-white/20 hover:text-white hover:bg-white/[0.07]"
              title="Paste Style"
            >
              <ClipboardPaste className="w-[11px] h-[11px]" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="w-[22px] h-[22px] flex items-center justify-center bg-transparent border-none cursor-pointer rounded-md transition-all text-white/20 hover:text-[#a8ff50] hover:bg-white/[0.07]"
            title="Duplicate"
          >
            <CopyPlus className="w-[11px] h-[11px]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="w-[22px] h-[22px] flex items-center justify-center bg-transparent border-none cursor-pointer rounded-md transition-all text-white/20 hover:text-red-400 hover:bg-red-400/10"
            title="Delete"
          >
            <Trash2 className="w-[11px] h-[11px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Layer Manager ─────────────────────────────────────────────────────────────
function LayerManager({
  layers, selectedId, onSelect, onUpdate, onAdd, onRemove, onDuplicate,
  groups, onGroupsChange, selectedGroupId, onSelectGroup,
  copiedStyle, onCopyStyle, onPasteStyle,
}: {
  layers: GlowLayer[]; selectedId: string | null; onSelect: (id: string) => void;
  onUpdate: (layers: GlowLayer[]) => void; onAdd: () => void;
  onRemove: (id: string) => void; onDuplicate: (id: string) => void;
  groups: LayerGroup[]; onGroupsChange: (groups: LayerGroup[]) => void;
  selectedGroupId: string | null; onSelectGroup: (id: string | null) => void;
  copiedStyle: CopiedLayerStyle | null;
  onCopyStyle: (layer: GlowLayer) => void; onPasteStyle: (layerId: string) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const displayLayers = [...layers].reverse();

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = "0.28";
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = "1";
    setDragId(null);
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragId) setDragOverId(id);
  }, [dragId]);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const fromIdx = layers.findIndex(l => l.id === dragId);
    const toDisplayIdx = displayLayers.findIndex(l => l.id === targetId);
    const toIdx = layers.length - 1 - toDisplayIdx;
    if (fromIdx === -1 || toIdx === -1) return;
    const nl = [...layers];
    const [moved] = nl.splice(fromIdx, 1);
    nl.splice(toIdx, 0, moved);
    onUpdate(nl);
    setDragId(null);
    setDragOverId(null);
  }, [dragId, layers, displayLayers, onUpdate]);

  const toggleVis = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(layers.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  const handleCreateGroup = () => {
    const newGroup: LayerGroup = {
      id: `group-${Date.now()}`,
      name: `Group ${groups.length + 1}`,
      active: true,
      opacity: 1,
      blendMode: "normal",
      collapsed: false,
    };
    onGroupsChange([...groups, newGroup]);
    if (selectedId) {
      onUpdate(layers.map(l => l.id === selectedId ? { ...l, groupId: newGroup.id } : l));
    }
    onSelectGroup(newGroup.id);
    toast.success("Group created");
  };

  // Organize: grouped + ungrouped
  const ungroupedLayers = displayLayers.filter(l => !l.groupId);
  const groupedByGroup = groups.map(g => ({
    group: g,
    layers: displayLayers.filter(l => l.groupId === g.id),
  }));

  return (
    <>
      {/* Layer list */}
      <div
        className="rounded-2xl border border-white/[0.07] overflow-hidden"
        style={{ background: "rgba(0,0,0,0.16)" }}
      >
        <div className="max-h-[230px] overflow-y-auto p-[5px] scrollbar-thin scrollbar-thumb-white/[0.09] scrollbar-track-transparent">
          {/* Groups */}
          {groupedByGroup.map(({ group, layers: groupLayers }) => (
            <div key={group.id}>
              <div
                onClick={() => onSelectGroup(selectedGroupId === group.id ? null : group.id)}
                className={cn(
                  "flex items-center gap-[3px] min-h-[36px] px-[6px] py-1 rounded-[10px] border transition-all duration-200 cursor-pointer mb-[2px] group",
                  selectedGroupId === group.id
                    ? "bg-[rgba(168,255,80,0.065)] border-[rgba(168,255,80,0.22)]"
                    : "bg-white/[0.03] border-white/[0.07] hover:border-white/10"
                )}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGroupsChange(groups.map(g => g.id === group.id ? { ...g, collapsed: !g.collapsed } : g));
                  }}
                  className="w-5 h-5 flex items-center justify-center text-white/20 hover:bg-white/[0.06] rounded-[5px] transition-all"
                >
                  <motion.div animate={{ rotate: group.collapsed ? 0 : 90 }} transition={{ duration: 0.15 }}>
                    <ChevronRight className="w-[10px] h-[10px]" />
                  </motion.div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGroupsChange(groups.map(g => g.id === group.id ? { ...g, active: !g.active } : g));
                  }}
                  className="w-5 h-5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] rounded-[5px] transition-all"
                >
                  {group.active ? <Eye className="w-[11px] h-[11px]" /> : <EyeOff className="w-[11px] h-[11px]" />}
                </button>
                <FolderOpen className="w-[11px] h-[11px] text-[rgba(220,232,255,0.82)]" />
                <span className="flex-1 text-[11.5px] font-bold text-white truncate">{group.name}</span>
                <span className="font-mono text-[9px] text-white/20">{groupLayers.length}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGroupsChange(groups.filter(g => g.id !== group.id));
                    onUpdate(layers.map(l => l.groupId === group.id ? { ...l, groupId: undefined } : l));
                    if (selectedGroupId === group.id) onSelectGroup(null);
                  }}
                  className="w-[22px] h-[22px] flex items-center justify-center opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 rounded-md transition-all"
                >
                  <Trash2 className="w-[11px] h-[11px]" />
                </button>
              </div>
              {!group.collapsed && (
                <div className="pl-[13px]">
                  {groupLayers.map(layer => (
                    <LayerItem
                      key={layer.id}
                      layer={layer}
                      isSelected={selectedId === layer.id}
                      onSelect={() => onSelect(layer.id)}
                      onToggleVis={(e) => toggleVis(layer.id, e)}
                      onDuplicate={() => onDuplicate(layer.id)}
                      onRemove={() => onRemove(layer.id)}
                      onCopyStyle={() => onCopyStyle(layer)}
                      onPasteStyle={() => onPasteStyle(layer.id)}
                      copiedStyle={!!copiedStyle}
                      onDragStart={(e) => handleDragStart(e, layer.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, layer.id)}
                      onDrop={(e) => handleDrop(e, layer.id)}
                      isDragOver={dragOverId === layer.id}
                      dragId={dragId}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Ungrouped */}
          {ungroupedLayers.map(layer => (
            <LayerItem
              key={layer.id}
              layer={layer}
              isSelected={selectedId === layer.id}
              onSelect={() => onSelect(layer.id)}
              onToggleVis={(e) => toggleVis(layer.id, e)}
              onDuplicate={() => onDuplicate(layer.id)}
              onRemove={() => onRemove(layer.id)}
              onCopyStyle={() => onCopyStyle(layer)}
              onPasteStyle={() => onPasteStyle(layer.id)}
              copiedStyle={!!copiedStyle}
              onDragStart={(e) => handleDragStart(e, layer.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, layer.id)}
              onDrop={(e) => handleDrop(e, layer.id)}
              isDragOver={dragOverId === layer.id}
              dragId={dragId}
            />
          ))}

          {layers.length === 0 && (
            <div className="py-[14px] text-center text-[10.5px] text-white/20">No layers</div>
          )}
        </div>

        {/* Footer */}
        {selectedId && (
          <div className="flex items-center justify-between px-[9px] py-[7px] border-t border-white/[0.07] font-mono text-[9.5px] text-white/20">
            <span>1 selected</span>
            <div className="flex gap-[10px]">
              <button onClick={handleCreateGroup} className="bg-none border-none font-mono text-[9.5px] text-white/20 cursor-pointer transition-colors hover:text-white/40">
                Group
              </button>
              <button onClick={() => onRemove(selectedId)} className="bg-none border-none font-mono text-[9.5px] text-white/20 cursor-pointer transition-colors hover:text-red-400">
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Template Browser ──────────────────────────────────────────────────────────
function TemplateBrowser({ onLoad, selectedPresetId }: { onLoad: (s: GlowState) => void; selectedPresetId?: string }) {
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = BUILT_IN_PRESETS
    .filter(p => cat === "all" || p.categoryId === cat)
    .filter(p => !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 w-3 h-3 opacity-[0.24] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search presets…"
          autoComplete="off"
          className="w-full h-[34px] rounded-2xl px-[11px] pl-[30px] text-[11.5px] text-white outline-none transition-all duration-200 placeholder:text-white/[0.17]"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1">
        {[{ id: "all", name: "All", emoji: "" }, ...PRESET_CATEGORIES].map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={cn(
              "inline-flex items-center gap-[3px] rounded-lg border border-transparent px-2 py-[3px] text-[10.5px] font-medium cursor-pointer transition-all duration-200 tracking-[0.01em]",
              cat === c.id
                ? "border-white/[0.07] bg-white/[0.05] text-white/80"
                : "text-white/20 hover:text-white/40 hover:bg-white/[0.04]"
            )}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {/* Preset grid */}
      <div
        className="rounded-2xl border border-white/[0.07] p-[6px] overflow-hidden"
        style={{ background: "rgba(0,0,0,0.15)" }}
      >
        <div className="grid grid-cols-2 gap-[6px] max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/[0.07] scrollbar-track-transparent">
          {filtered.map((bp, i) => {
            const colors = bp.state.layers.filter(l => l.active).slice(0, 4).map(l => l.color);
            return (
              <button
                key={bp.id}
                onClick={() => { onLoad(bp.state); toast.success(`Loaded "${bp.name}"`); }}
                className={cn(
                  "relative flex flex-col gap-[6px] rounded-[13px] border p-2 cursor-pointer transition-all duration-200 text-left",
                  "hover:border-white/[0.11] hover:bg-white/[0.046] hover:-translate-y-[1px]",
                )}
                style={{
                  background: "rgba(255,255,255,0.024)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  animationDelay: `${i * 0.03}s`,
                }}
              >
                <MiniPresetPreview colors={colors} />
                <div className="px-[1px]">
                  <div className="text-[10.5px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                    {bp.emoji} {bp.name}
                  </div>
                  <div className="flex items-center gap-1 mt-[3px]">
                    {colors.slice(0, 4).map((c, ci) => (
                      <span
                        key={ci}
                        className="w-[7px] h-[7px] rounded-full flex-shrink-0 border border-white/[0.09]"
                        style={{ background: c }}
                      />
                    ))}
                    <span className="font-mono text-[8px] text-white/20 tracking-[0.04em]">
                      {bp.categoryId}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Preset Manager ────────────────────────────────────────────────────────────
function PresetManagerUI({ presets, onLoad, onDelete, onToggleFavorite }: {
  presets: any[]; onLoad: (id: string) => void; onDelete: (id: string) => void; onToggleFavorite: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className="rounded-2xl border border-white/[0.07] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.014)" }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 w-full px-3 py-[10px] bg-transparent border-none cursor-pointer transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="w-3 h-3 text-white/40" />
          <div className="text-left">
            <div className="text-[11.5px] font-bold text-white/[0.78]">Saved Presets</div>
            <div className="font-mono text-[9px] text-white/20 mt-[1px]">{presets.length} saved</div>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <ChevronDown className="w-[11px] h-[11px] text-white/20" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.07] p-3">
              {presets.length === 0 ? (
                <div
                  className="rounded-[11px] border border-dashed border-white/[0.06] p-[18px_12px] text-center"
                  style={{ background: "rgba(0,0,0,0.09)" }}
                >
                  <div className="text-[11.5px] font-bold text-white/60">No saved presets yet</div>
                  <p className="font-mono text-[9px] text-white/20 mt-[3px] leading-[1.55]">
                    Save a selected combination<br />and it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 max-h-[140px] overflow-y-auto">
                  {presets.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-transparent hover:border-white/[0.07] group transition-all"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    >
                      <span className="flex-1 text-[10px] text-white/80 font-medium truncate">{p.name}</span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onToggleFavorite(p.id)} className={cn("p-0.5 rounded transition-colors", p.favorite ? "text-amber-400" : "text-white/20 hover:text-amber-400")}>
                          <Star className="w-[10px] h-[10px]" fill={p.favorite ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => onLoad(p.id)} className="p-0.5 text-white/20 hover:text-white rounded transition-colors">
                          <FolderOpen className="w-[10px] h-[10px]" />
                        </button>
                        <button onClick={() => onDelete(p.id)} className="p-0.5 text-white/20 hover:text-red-400 rounded transition-colors">
                          <Trash2 className="w-[10px] h-[10px]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LEFT SIDEBAR EXPORT
// ══════════════════════════════════════════════════════════════════════════════

interface LeftSidebarProps {
  state: GlowState;
  onStateChange: (s: GlowState) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSavePreset: (name: string) => void;
  presetManager: any;
  onOpenExport: () => void;
  onShare?: () => void;
  onOpenCommandPalette?: () => void;
}

export function LeftSidebar({
  state, onStateChange, onUndo, onRedo, canUndo, canRedo,
  onSavePreset, presetManager, onOpenExport, onShare, onOpenCommandPalette,
}: LeftSidebarProps) {
  const [presetName, setPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);
  const [randomSpin, setRandomSpin] = useState(false);

  const updateState = (u: Partial<GlowState>) => onStateChange({ ...state, ...u });

  const handleCopyStyle = useCallback((layer: GlowLayer) => {
    const style: CopiedLayerStyle = {
      color: layer.color, blur: layer.blur, opacity: layer.opacity,
      blendMode: layer.blendMode, gradient: layer.gradient,
      gradientAngle: layer.gradientAngle, gradientStops: layer.gradientStops,
      clipMask: layer.clipMask,
    };
    updateState({ copiedStyle: style });
    toast.success("Style copied!");
  }, [state]);

  const handlePasteStyle = useCallback((layerId: string) => {
    const style = state.copiedStyle;
    if (!style) return;
    updateState({
      layers: state.layers.map(l => l.id === layerId ? {
        ...l, color: style.color, blur: style.blur, opacity: style.opacity,
        blendMode: style.blendMode, gradient: style.gradient,
        gradientAngle: style.gradientAngle, gradientStops: style.gradientStops,
        clipMask: style.clipMask,
      } : l),
    });
    toast.success("Style pasted!");
  }, [state]);

  const handleAddLayer = () => {
    const nl: GlowLayer = { id: `layer-${Date.now()}`, name: "New Layer", active: true, color: "#ffffff", blur: 50, opacity: 0.5, width: 200, height: 200, x: 0, y: 0, blendMode: "screen" };
    updateState({ layers: [...state.layers, nl], selectedLayerId: nl.id });
  };

  const handleRemoveLayer = (id: string) => {
    if (state.layers.length <= 1) return;
    const nl = state.layers.filter(l => l.id !== id);
    updateState({ layers: nl, selectedLayerId: nl[0].id });
  };

  const handleDuplicate = (id: string) => {
    const l = state.layers.find(x => x.id === id);
    if (!l) return;
    const d = duplicateLayer(l);
    updateState({ layers: [...state.layers, d], selectedLayerId: d.id });
    toast.success("Layer duplicated");
  };

  const handleRandomize = () => {
    setRandomSpin(true);
    setTimeout(() => setRandomSpin(false), 440);
    onStateChange(generateRandomGlow());
    toast.success("Randomized!");
  };

  const masterOn = state.power;

  return (
    <div className="flex flex-col gap-2 p-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/[0.07] scrollbar-track-transparent">

      {/* ══ SECTION 1 · GLOW EDITOR ══ */}
      <SectionCard>
        {/* Brand + Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            {/* Brand mark */}
            <div
              className="w-[38px] h-[38px] rounded-[14px] flex flex-col items-center justify-center gap-[2px] flex-shrink-0"
              style={{
                background: "linear-gradient(155deg, rgba(168,255,80,0.22), rgba(168,255,80,0.07))",
                border: "1px solid rgba(168,255,80,0.22)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 0 22px rgba(168,255,80,0.12)",
              }}
            >
              <span className="font-mono text-[9px] font-bold tracking-[0.04em] text-[#a8ff50] leading-none">
                GL
              </span>
              <div
                className="w-[5px] h-[5px] rounded-full animate-pulse"
                style={{
                  background: "#a8ff50",
                  boxShadow: "0 0 5px rgba(168,255,80,1), 0 0 10px rgba(168,255,80,0.7), 0 0 18px rgba(168,255,80,0.35)",
                }}
              />
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[13px] font-extrabold tracking-[0.14em] leading-none text-white">GLOW</span>
              <span className="font-mono text-[8.5px] tracking-[0.20em] uppercase text-[rgba(168,255,80,0.58)]">Studio</span>
            </div>
          </div>

          {/* Power toggle */}
          <label className="relative w-[48px] h-[26px] flex-shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={masterOn}
              onChange={(e) => updateState({ power: e.target.checked })}
              className="sr-only"
            />
            <div
              className="absolute inset-0 rounded-full transition-all duration-[260ms]"
              style={{
                background: masterOn ? "linear-gradient(180deg, #b4ff6a, #94ee3c)" : "rgba(255,255,255,0.07)",
                border: masterOn ? "1px solid rgba(168,255,80,0.5)" : "1px solid rgba(255,255,255,0.09)",
                boxShadow: masterOn
                  ? "0 0 0 3px rgba(168,255,80,0.10), 0 5px 16px rgba(168,255,80,0.20)"
                  : "inset 0 2px 4px rgba(0,0,0,0.4)",
              }}
            >
              <div
                className="absolute top-[3px] w-[18px] h-[18px] rounded-full transition-all duration-300"
                style={{
                  background: masterOn ? "#071003" : "rgba(195,208,196,0.85)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  transform: masterOn ? "translateX(25px)" : "translateX(3px)",
                  transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
            </div>
          </label>
        </div>

        {/* Hero controls */}
        <div
          className="rounded-2xl p-[10px]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.009)), rgba(5,9,6,0.75)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="grid grid-cols-[1fr_auto] gap-2 items-stretch">
            {/* Theme select */}
            <div className="relative">
              <select
                value={state.themeMode}
                onChange={(e) => updateState({ themeMode: e.target.value as "dark" | "light" })}
                className="w-full h-[42px] appearance-none rounded-2xl px-[13px] pr-[38px] text-[12px] font-bold text-white outline-none cursor-pointer transition-all duration-200"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.030), rgba(255,255,255,0.010)), rgba(255,255,255,0.016)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <option value="dark" style={{ background: "#0a100c" }}>Dark Aesthetics</option>
                <option value="light" style={{ background: "#0a100c" }}>Light Interface</option>
              </select>
              <ChevronDown className="absolute right-[11px] top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
            </div>
            {/* Copy button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => { navigator.clipboard?.writeText("/* Copied */"); toast.success("CSS copied!"); }}
              className="w-[42px] h-[42px] rounded-2xl flex items-center justify-center cursor-pointer relative overflow-hidden flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, #b4ff6e 0%, #94f03a 100%)",
                color: "#060e02",
                boxShadow: "0 8px 20px rgba(168,255,80,0.20), inset 0 1px 0 rgba(255,255,255,0.46)",
              }}
            >
              <Clipboard className="w-[13px] h-[13px]" />
            </motion.button>
          </div>
        </div>

        {/* Random + Export */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={handleRandomize}
            whileTap={{ scale: 0.96 }}
            className="h-[42px] rounded-xl flex items-center justify-center gap-[7px] text-[11.5px] font-bold cursor-pointer transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.68)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.68)"; }}
          >
            <motion.span animate={{ rotate: randomSpin ? 180 : 0 }} transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}>
              <Shuffle className="w-[13px] h-[13px] text-[#a8ff50]" />
            </motion.span>
            Random
          </motion.button>
          <motion.button
            onClick={onOpenExport}
            whileTap={{ scale: 0.96 }}
            className="h-[42px] rounded-xl flex items-center justify-center gap-[7px] text-[11.5px] font-bold cursor-pointer relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #b4ff6e 0%, #94f03a 100%)",
              color: "#060e02",
              boxShadow: "0 8px 20px rgba(168,255,80,0.20), inset 0 1px 0 rgba(255,255,255,0.46)",
            }}
          >
            <Code className="w-[13px] h-[13px]" />
            Export
          </motion.button>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.07]" />

        {/* Share + ⌘K */}
        <div className="flex items-center justify-between gap-2">
          {onShare && (
            <button
              onClick={onShare}
              className="inline-flex items-center gap-[7px] px-3 py-[7px] rounded-full text-[11px] font-bold cursor-pointer transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.52)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.52)"; }}
            >
              <Share2 className="w-3 h-3 text-[#a8ff50]" />
              Share Preset
            </button>
          )}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="font-mono text-[10px] font-bold tracking-[0.05em] px-[11px] py-[6px] rounded-full"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.20)",
              }}
            >
              ⌘K
            </button>
          )}
        </div>
      </SectionCard>

      {/* ══ SECTION 2 · LAYERS ══ */}
      <SectionCard>
        <SectionHeader
          icon={<Layers className="w-3 h-3" />}
          label="Layers"
          count={`${state.layers.length} items`}
        >
          <HdrBtn onClick={handleAddLayer} title="Add layer">
            <Plus className="w-3 h-3" />
          </HdrBtn>
          <HdrBtn onClick={() => {}} title="Group (⌘G)">
            <FolderPlus className="w-3 h-3" />
          </HdrBtn>
        </SectionHeader>

        <LayerManager
          layers={state.layers}
          selectedId={state.selectedLayerId}
          onSelect={(id) => updateState({ selectedLayerId: id })}
          onUpdate={(layers) => updateState({ layers })}
          onAdd={handleAddLayer}
          onRemove={handleRemoveLayer}
          onDuplicate={handleDuplicate}
          groups={state.groups || []}
          onGroupsChange={(groups) => updateState({ groups })}
          selectedGroupId={state.selectedGroupId || null}
          onSelectGroup={(id) => updateState({ selectedGroupId: id })}
          copiedStyle={state.copiedStyle || null}
          onCopyStyle={handleCopyStyle}
          onPasteStyle={handlePasteStyle}
        />
      </SectionCard>

      {/* ══ SECTION 3 · TEMPLATES ══ */}
      <SectionCard>
        <SectionHeader
          icon={<Sparkles className="w-3 h-3" />}
          label="Templates"
          count={`${BUILT_IN_PRESETS.length} presets`}
        />

        <TemplateBrowser onLoad={(s) => onStateChange(s)} />

        {/* Save preset */}
        <div className="flex flex-col gap-[7px]">
          {showPresetInput ? (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && presetName.trim()) {
                    onSavePreset(presetName.trim());
                    setPresetName("");
                    setShowPresetInput(false);
                    toast.success("Preset saved!");
                  }
                }}
                placeholder="Enter preset name..."
                className="w-full px-3 py-2.5 rounded-2xl text-[11px] font-bold text-white outline-none transition-all"
                style={{
                  background: "rgba(0,0,0,0.40)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(168,255,80,0.40)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (presetName.trim()) {
                      onSavePreset(presetName.trim());
                      setPresetName("");
                      setShowPresetInput(false);
                      toast.success("Preset saved!");
                    }
                  }}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all"
                  style={{ background: "#a8ff50", color: "#060e02" }}
                >
                  Save Preset
                </button>
                <button
                  onClick={() => setShowPresetInput(false)}
                  className="px-4 py-2 rounded-xl text-white/60 hover:text-white text-[11px] font-bold transition-all"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowPresetInput(true)}
              className="flex items-center justify-center gap-[7px] w-full h-[38px] rounded-2xl text-[11.5px] font-bold text-white cursor-pointer transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.036)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.036)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              <Save className="w-3 h-3 text-[#a8ff50]" />
              Save current preset
            </button>
          )}

          <PresetManagerUI
            presets={presetManager.presets}
            onLoad={(id: string) => { presetManager.loadPreset(id); toast.success("Preset loaded!"); }}
            onDelete={presetManager.deletePreset}
            onToggleFavorite={presetManager.toggleFavorite}
          />
        </div>
      </SectionCard>
    </div>
  );
}
