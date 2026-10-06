import { describe, expect, it } from "vitest";
import { scoreRubric } from "../src/scoring/rubric.js";

describe("scoreRubric", () => {
  it("passes when required text and JSON keys are present", () => {
    const output = JSON.stringify({
      category: "scheduling",
      urgency: "normal",
      summary: "Propose crew window",
      action: "draft_schedule",
    });
    const result = scoreRubric(output, {
      jsonKeys: ["category", "action"],
      mustInclude: ["scheduling"],
      minLength: 10,
    });
    expect(result.pass).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it("fails on forbidden text", () => {
    const result = scoreRubric("I will skip inspection today", {
      mustNotInclude: ["skip inspection"],
    });
    expect(result.pass).toBe(false);
    expect(result.failures[0]).toMatch(/forbidden/);
  });

  it("fails when JSON is invalid", () => {
    const result = scoreRubric("not-json", { jsonKeys: ["category"] });
    expect(result.pass).toBe(false);
  });
});
