import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CaseResult } from "./types.js";

export type GoldenMode = "off" | "compare" | "update";

export type GoldenOutcome = {
  id: string;
  pass: boolean;
  failures: string[];
};

function goldenPath(dir: string, caseId: string): string {
  const safe = caseId.replace(/[^a-zA-Z0-9._-]/g, "_");
  return path.join(dir, `${safe}.txt`);
}

/** Compare or update golden files for case outputs. */
export async function applyGoldens(
  cases: CaseResult[],
  dir: string,
  mode: GoldenMode,
): Promise<GoldenOutcome[]> {
  if (mode === "off") return [];

  await mkdir(dir, { recursive: true });
  const outcomes: GoldenOutcome[] = [];

  for (const c of cases) {
    const file = goldenPath(dir, c.id);
    if (mode === "update") {
      await writeFile(file, c.output, "utf8");
      outcomes.push({ id: c.id, pass: true, failures: [] });
      continue;
    }

    // compare
    let expected: string;
    try {
      expected = await readFile(file, "utf8");
    } catch {
      outcomes.push({
        id: c.id,
        pass: false,
        failures: [`missing golden file: ${file}`],
      });
      continue;
    }

    if (expected === c.output) {
      outcomes.push({ id: c.id, pass: true, failures: [] });
    } else {
      outcomes.push({
        id: c.id,
        pass: false,
        failures: [`golden mismatch: ${file}`],
      });
    }
  }

  return outcomes;
}
