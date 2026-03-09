import type {
  CanvasBackground,
  DemoDocument,
  EditorDocument,
  EditorNode,
  SavedPreset,
} from "@/store/types";
import type {
  GlowLayer,
  GlowState,
  LayerGroup,
} from "@/lib/glow-types";
import { BUILT_IN_PRESETS } from "@/lib/glow-presets";

const ROOT_NODE_ID = "root-canvas";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const createRootNode = (): EditorNode => ({
  id: ROOT_NODE_ID,
  type: "group",
  name: "Canvas",
  parentId: null,
  childIds: [],
  style: {},
  props: { role: "canvas-root" },
  visible: true,
  locked: false,
  metadata: {
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
});

const toEffectNode = (layer: GlowLayer): EditorNode => ({
  id: layer.id,
  type: "effect-layer",
  name: layer.name,
  parentId: layer.groupId ?? ROOT_NODE_ID,
  childIds: [],
  style: {
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,
    color: layer.color,
    opacity: layer.opacity,
    blur: layer.blur,
    blendMode: layer.blendMode,
    gradient: layer.gradient,
    gradientAngle: layer.gradientAngle,
    gradientStops: layer.gradientStops,
    clipMask: layer.clipMask,
  },
  props: {
    legacyGlowLayer: true,
  },
  animation: layer.layerAnimation,
  visible: layer.active,
  locked: false,
  metadata: {
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
});

const toGroupNode = (group: LayerGroup): EditorNode => ({
  id: group.id,
  type: "group",
  name: group.name,
  parentId: ROOT_NODE_ID,
  childIds: [],
  style: {
    opacity: group.opacity,
    blendMode: group.blendMode,
  },
  props: {
    collapsed: group.collapsed,
    legacyGlowGroup: true,
  },
  visible: group.active,
  locked: false,
  metadata: {
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
});

export function glowStateToDocument(state: GlowState, options?: { name?: string; id?: string }): EditorDocument {
  const createdAt = Date.now();
  const rootNode = createRootNode();
  const groupNodes = (state.groups ?? []).map(toGroupNode);
  const effectNodes = state.layers.map(toEffectNode);

  const nodes: Record<string, EditorNode> = {
    [ROOT_NODE_ID]: rootNode,
  };

  for (const groupNode of groupNodes) {
    nodes[groupNode.id] = groupNode;
  }

  for (const effectNode of effectNodes) {
    nodes[effectNode.id] = effectNode;
  }

  rootNode.childIds = [
    ...groupNodes.map((node) => node.id),
    ...effectNodes.filter((node) => node.parentId === ROOT_NODE_ID).map((node) => node.id),
  ];

  for (const groupNode of groupNodes) {
    groupNode.childIds = effectNodes.filter((node) => node.parentId === groupNode.id).map((node) => node.id);
  }

  return {
    id: options?.id ?? `doc-${createdAt}`,
    name: options?.name ?? "Canvas Studio Document",
    nodes,
    rootNodeIds: [ROOT_NODE_ID],
    settings: {
      canvasBackground: (state.canvasBackground ?? "dark") as CanvasBackground,
      gridVisible: false,
      dimensionsVisible: false,
      rulersVisible: false,
      globalScale: state.globalScale,
      globalOpacity: state.globalOpacity,
      noiseEnabled: state.noiseEnabled,
      noiseIntensity: state.noiseIntensity,
      power: state.power,
      themeMode: state.themeMode,
      animation: clone(state.animation),
    },
    metadata: {
      createdAt,
      updatedAt: createdAt,
      version: 1,
    },
  };
}

export function documentToGlowState(document: EditorDocument, selectedNodeId?: string | null, cssOverride: string | null = null): GlowState {
  const allNodes = Object.values(document.nodes);
  const groups = allNodes
    .filter((node) => node.type === "group" && node.id !== ROOT_NODE_ID)
    .map<LayerGroup>((node) => ({
      id: node.id,
      name: node.name,
      active: node.visible,
      opacity: node.style.opacity ?? 1,
      blendMode: node.style.blendMode ?? "normal",
      collapsed: Boolean(node.props.collapsed),
    }));

  const layers = allNodes
    .filter((node) => node.type === "effect-layer")
    .map<GlowLayer>((node) => ({
      id: node.id,
      name: node.name,
      active: node.visible,
      color: node.style.color ?? node.style.backgroundColor ?? "#ffffff",
      blur: node.style.blur ?? 0,
      opacity: node.style.opacity ?? 1,
      width: node.style.width ?? 200,
      height: node.style.height ?? 200,
      x: node.style.x ?? 0,
      y: node.style.y ?? 0,
      blendMode: node.style.blendMode ?? "screen",
      groupId: node.parentId && node.parentId !== ROOT_NODE_ID ? node.parentId : undefined,
      clipMask: node.style.clipMask,
      gradient: node.style.gradient,
      gradientAngle: node.style.gradientAngle,
      gradientStops: node.style.gradientStops,
      layerAnimation: node.animation,
    }));

  return {
    power: document.settings.power,
    themeMode: document.settings.themeMode,
    globalScale: document.settings.globalScale,
    globalOpacity: document.settings.globalOpacity,
    noiseEnabled: document.settings.noiseEnabled,
    noiseIntensity: document.settings.noiseIntensity,
    layers,
    selectedLayerId: selectedNodeId && document.nodes[selectedNodeId]?.type === "effect-layer"
      ? selectedNodeId
      : layers[0]?.id ?? null,
    animation: clone(document.settings.animation),
    canvasBackground: document.settings.canvasBackground,
    groups,
    selectedGroupId: selectedNodeId && document.nodes[selectedNodeId]?.type === "group" && selectedNodeId !== ROOT_NODE_ID
      ? selectedNodeId
      : null,
    copiedStyle: null,
  };
}

export function presetToSavedPreset(preset: { id: string; name: string; state: GlowState; favorite?: boolean; timestamp?: number; category?: string; description?: string; }): SavedPreset {
  return {
    id: preset.id,
    name: preset.name,
    description: preset.description,
    timestamp: preset.timestamp ?? Date.now(),
    favorite: preset.favorite ?? false,
    category: preset.category,
    document: glowStateToDocument(preset.state, { id: `preset-${preset.id}`, name: preset.name }),
  };
}

export function getBuiltInPresetDocuments(): Record<string, SavedPreset> {
  return Object.fromEntries(
    BUILT_IN_PRESETS.map((preset) => [preset.id, presetToSavedPreset(preset)])
  );
}

export function getDemoDocuments(): DemoDocument[] {
  const demos = BUILT_IN_PRESETS.slice(0, 3);
  const fallback = BUILT_IN_PRESETS[0];

  const heroGlow = demos[1] ?? fallback;
  const cardGlow = demos[2] ?? fallback;

  return [
    {
      id: "demo-neon-glow",
      name: "Neon Glow",
      description: "The original multi-layer glow experience, preserved as the hero demo mode.",
      category: "Effects",
      document: glowStateToDocument(BUILT_IN_PRESETS[0].state, { id: "demo-neon-glow", name: "Neon Glow" }),
    },
    {
      id: "demo-landing-hero",
      name: "Landing Hero",
      description: "A marketing-ready hero composition using effect layers as ambient lighting.",
      category: "Marketing",
      document: glowStateToDocument(heroGlow.state, { id: "demo-landing-hero", name: "Landing Hero" }),
    },
    {
      id: "demo-card-component",
      name: "Card Component",
      description: "A polished component demo showing Canvas Studio as a reusable design system tool.",
      category: "Components",
      document: glowStateToDocument(cardGlow.state, { id: "demo-card-component", name: "Card Component" }),
    },
  ];
}
