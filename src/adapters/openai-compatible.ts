import type { AgentAdapter, TestCase } from "../types.js";

/**
 * Optional live adapter. Requires AGENT_API_KEY.
 * AGENT_API_BASE defaults to https://api.openai.com/v1
 */
export function createOpenAICompatibleAdapter(): AgentAdapter {
  const apiKey = process.env.AGENT_API_KEY;
  const base = (process.env.AGENT_API_BASE ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AGENT_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("AGENT_API_KEY is required for the openai adapter");
  }

  return {
    name: "openai-compatible",
    async complete(input: string, _testCase: TestCase): Promise<string> {
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "You are an ops triage assistant. Reply with compact JSON keys: category, urgency, summary, action.",
            },
            { role: "user", content: input },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`Agent API error ${res.status}: ${await res.text()}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return data.choices?.[0]?.message?.content ?? "";
    },
  };
}
