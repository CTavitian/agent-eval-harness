import type { AgentAdapter, Suite, SuiteResult } from "./types.js";
import { scoreRubric } from "./scoring/rubric.js";

export async function runSuite(
  suite: Suite,
  adapter: AgentAdapter,
): Promise<SuiteResult> {
  const cases = [];

  for (const testCase of suite.cases) {
    const output = await adapter.complete(testCase.input, testCase);
    const { pass, failures } = scoreRubric(output, testCase.rubric);
    cases.push({ id: testCase.id, pass, output, failures });
  }

  const passed = cases.filter((c) => c.pass).length;
  return {
    suite: suite.name,
    adapter: adapter.name,
    passed,
    failed: cases.length - passed,
    cases,
    generatedAt: new Date().toISOString(),
  };
}
