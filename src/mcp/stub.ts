/**
 * Minimal MCP-shaped tool stub.
 * Not a full MCP server. Shows how scoring can be exposed as a tool
 * without opening arbitrary shell or filesystem writes.
 */
import { scoreRubric } from "../scoring/rubric.js";
import type { Rubric } from "../types.js";

export const scoreToolDefinition = {
  name: "score_agent_output",
  description: "Score an agent output against a rubric. Read-only.",
  inputSchema: {
    type: "object",
    properties: {
      output: { type: "string" },
      rubric: { type: "object" },
    },
    required: ["output", "rubric"],
  },
} as const;

export function handleScoreTool(args: {
  output: string;
  rubric: Rubric;
}): { pass: boolean; failures: string[] } {
  return scoreRubric(args.output, args.rubric);
}
