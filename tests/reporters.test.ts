import { describe, expect, it } from "vitest";
import { toGitHubSummary } from "../src/reporters/github.js";
import { toJUnitXml } from "../src/reporters/junit.js";
import type { SuiteResult } from "../src/types.js";

const sample: SuiteResult = {
  suite: "demo",
  adapter: "mock",
  passed: 1,
  failed: 1,
  generatedAt: "2026-01-01T00:00:00.000Z",
  cases: [
    { id: "ok", pass: true, output: "{}", failures: [] },
    { id: "bad", pass: false, output: "x", failures: ["missing required text: scheduling"] },
  ],
};

describe("reporters", () => {
  it("emits JUnit with a failure element", () => {
    const xml = toJUnitXml(sample);
    expect(xml).toContain("<testsuite");
    expect(xml).toContain('name="bad"');
    expect(xml).toContain("<failure");
  });

  it("emits a GitHub summary table", () => {
    const md = toGitHubSummary(sample);
    expect(md).toContain("| bad | fail |");
    expect(md).toContain("passed 1");
  });
});
