import type { AgentAdapter } from "../types.js";
import { createMockAdapter } from "./mock.js";
import { createOpenAICompatibleAdapter } from "./openai-compatible.js";

export function getAdapter(name: string): AgentAdapter {
  switch (name) {
    case "mock":
      return createMockAdapter();
    case "openai":
    case "openai-compatible":
      return createOpenAICompatibleAdapter();
    default:
      throw new Error(`Unknown adapter: ${name}`);
  }
}

export { createMockAdapter, createOpenAICompatibleAdapter };
