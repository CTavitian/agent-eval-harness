import type { SuiteResult } from "../types.js";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** JUnit XML so CI can gate on eval failures. */
export function toJUnitXml(result: SuiteResult): string {
  const cases = result.cases
    .map((c) => {
      if (c.pass) {
        return `    <testcase name="${esc(c.id)}" classname="${esc(result.suite)}"/>`;
      }
      const msg = esc(c.failures.join("; ") || "failed");
      return `    <testcase name="${esc(c.id)}" classname="${esc(result.suite)}">
      <failure message="${msg}">${esc(c.failures.join("\n"))}</failure>
    </testcase>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="${esc(result.suite)}" tests="${result.cases.length}" failures="${result.failed}" errors="0">
${cases}
</testsuite>
`;
}
