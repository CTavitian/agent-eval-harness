import type { SuiteResult } from "../types.js";

/** Markdown suitable for $GITHUB_STEP_SUMMARY. */
export function toGitHubSummary(result: SuiteResult): string {
  const rows = result.cases
    .map((c) => {
      const status = c.pass ? "pass" : "fail";
      const detail = c.pass ? "" : c.failures.join("; ");
      return `| ${c.id} | ${status} | ${detail} |`;
    })
    .join("\n");

  return `## Agent eval: ${result.suite}

| Case | Result | Detail |
| --- | --- | --- |
${rows}

Adapter: \`${result.adapter}\` · passed ${result.passed} · failed ${result.failed}
`;
}
