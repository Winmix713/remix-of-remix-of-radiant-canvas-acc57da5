import { describe, expect, it } from "vitest";
import { glowStateToDocument } from "@/editor/adapters/glow-compat";
import { documentToIntermediateRepresentation } from "@/editor/export/intermediate-repr";
import { exportForFormat } from "@/lib/glow-export";
import { INITIAL_STATE } from "@/lib/glow-types";

describe("export pipeline", () => {
  it("converts a glow document to intermediate representation", () => {
    const document = glowStateToDocument(INITIAL_STATE, { name: "Test Export" });
    const ir = documentToIntermediateRepresentation(document);

    expect(ir.name).toBe("Test Export");
    expect(ir.layers.length).toBeGreaterThan(0);
  });

  it("exports tailwind through the IR pipeline", () => {
    const output = exportForFormat(INITIAL_STATE, "tailwind");
    expect(output).toContain("Canvas Studio export");
    expect(output).toContain("translate(-50%, -50%)");
  });

  it("exports react through the IR pipeline", () => {
    const output = exportForFormat(INITIAL_STATE, "react");
    expect(output).toContain("CanvasStudioEffect");
    expect(output).toContain("const layers = [");
  });
});
