import { beforeEach, describe, expect, it } from "vitest";
import { useEditorStore } from "@/store/editor-store";
import { getDemoDocuments } from "@/editor/adapters/glow-compat";

const resetStore = () => {
  const demo = getDemoDocuments()[0];
  useEditorStore.setState((state) => ({
    ...state,
    document: demo.document,
    history: { past: [], future: [] },
    activeDemoDocumentId: demo.id,
  }));
};

describe("editor store", () => {
  beforeEach(() => {
    resetStore();
  });

  it("loads seeded demo documents", () => {
    const store = useEditorStore.getState();
    expect(store.demoDocuments).toHaveLength(3);
  });

  it("creates a node and records history", () => {
    const store = useEditorStore.getState();
    const nodeId = store.createNode("effect-layer", "root-canvas", {
      name: "Test Layer",
      style: { color: "#ffffff", width: 100, height: 100 },
    });

    const next = useEditorStore.getState();
    expect(next.document.nodes[nodeId]).toBeDefined();
    expect(next.history.past.length).toBe(1);
  });

  it("updates node style transactionally", () => {
    const store = useEditorStore.getState();
    const nodeId = Object.values(store.document.nodes).find((node) => node.type === "effect-layer")?.id;
    expect(nodeId).toBeTruthy();

    store.updateNodeStyle(nodeId!, { x: 123 }, { label: "Move node" });
    const next = useEditorStore.getState();
    expect(next.document.nodes[nodeId!].style.x).toBe(123);
    expect(next.history.past.at(-1)?.label).toBe("Move node");
  });

  it("undo restores pre-mutation snapshot", () => {
    const store = useEditorStore.getState();
    const nodeId = Object.values(store.document.nodes).find((node) => node.type === "effect-layer")?.id;
    const originalX = store.document.nodes[nodeId!].style.x;

    store.updateNodeStyle(nodeId!, { x: 321 }, { label: "Move node" });
    useEditorStore.getState().undo();

    const next = useEditorStore.getState();
    expect(next.document.nodes[nodeId!].style.x).toBe(originalX);
  });

  it("redo reapplies reverted mutation", () => {
    const store = useEditorStore.getState();
    const nodeId = Object.values(store.document.nodes).find((node) => node.type === "effect-layer")?.id;

    store.updateNodeStyle(nodeId!, { x: 222 }, { label: "Move node" });
    useEditorStore.getState().undo();
    useEditorStore.getState().redo();

    const next = useEditorStore.getState();
    expect(next.document.nodes[nodeId!].style.x).toBe(222);
  });
});
