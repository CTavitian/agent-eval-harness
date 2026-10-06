import type { Rubric } from "../types.js";

export function scoreRubric(
  output: string,
  rubric: Rubric,
): { pass: boolean; failures: string[] } {
  const failures: string[] = [];
  const lower = output.toLowerCase();

  for (const needle of rubric.mustInclude ?? []) {
    if (!lower.includes(needle.toLowerCase())) {
      failures.push(`missing required text: ${needle}`);
    }
  }

  for (const needle of rubric.mustNotInclude ?? []) {
    if (lower.includes(needle.toLowerCase())) {
      failures.push(`contains forbidden text: ${needle}`);
    }
  }

  if (rubric.minLength != null && output.length < rubric.minLength) {
    failures.push(`output shorter than ${rubric.minLength}`);
  }

  if (rubric.maxLength != null && output.length > rubric.maxLength) {
    failures.push(`output longer than ${rubric.maxLength}`);
  }

  if (rubric.jsonKeys?.length) {
    try {
      const parsed = JSON.parse(output) as Record<string, unknown>;
      for (const key of rubric.jsonKeys) {
        if (!(key in parsed)) {
          failures.push(`JSON missing key: ${key}`);
        }
      }
    } catch {
      failures.push("output is not valid JSON");
    }
  }

  return { pass: failures.length === 0, failures };
}
