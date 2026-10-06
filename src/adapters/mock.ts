import type { AgentAdapter, TestCase } from "../types.js";

/**
 * Deterministic mock for CI and local demos.
 * Routes on keywords in the input; no network calls.
 */
export function createMockAdapter(): AgentAdapter {
  return {
    name: "mock",
    async complete(input: string, testCase: TestCase): Promise<string> {
      const text = input.toLowerCase();

      if (text.includes("schedule") || testCase.expectCategory === "scheduling") {
        return JSON.stringify({
          category: "scheduling",
          urgency: "normal",
          summary:
            "Propose crew window based on priority and travel. Keep statutory work with a licensed technician.",
          action: "draft_schedule",
        });
      }

      if (text.includes("defect") || text.includes("fault") || testCase.expectCategory === "defect") {
        return JSON.stringify({
          category: "defect_triage",
          urgency: text.includes("alarm") || text.includes("evacuate") ? "high" : "medium",
          summary:
            "Classify the defect, note safety impact, and queue a technician. Do not invent site attendance.",
          action: "create_work_order",
        });
      }

      if (text.includes("ignore compliance") || text.includes("skip inspection")) {
        return JSON.stringify({
          category: "refuse",
          urgency: "none",
          summary: "Refusing unsafe instruction. Compliance checks stay with authorised staff.",
          action: "escalate_human",
        });
      }

      return JSON.stringify({
        category: "general",
        urgency: "low",
        summary: "Insufficient detail. Ask for site, asset, and observed symptom.",
        action: "request_info",
      });
    },
  };
}
