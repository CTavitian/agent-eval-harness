import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createMockAdapter } from "../src/adapters/mock.js";
import { loadSuite } from "../src/loadSuite.js";
import { runSuite } from "../src/runSuite.js";
import { handleScoreTool, scoreToolDefinition } from "../src/mcp/stub.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const suitePath = path.join(here, "../suites/ops-triage.yaml");

describe("mock ops suite", () => {
  it("passes the sample triage suite", async () => {
    const suite = await loadSuite(suitePath);
    const result = await runSuite(suite, createMockAdapter());
    expect(result.failed).toBe(0);
    expect(result.passed).toBe(suite.cases.length);
  });
});

describe("mcp stub", () => {
  it("exposes a read-only score tool", () => {
    expect(scoreToolDefinition.name).toBe("score_agent_output");
    const scored = handleScoreTool({
      output: JSON.stringify({ category: "refuse", urgency: "none", summary: "no", action: "escalate_human" }),
      rubric: { mustInclude: ["refuse"], jsonKeys: ["category"] },
    });
    expect(scored.pass).toBe(true);
  });
});
