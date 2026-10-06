#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAdapter } from "../adapters/index.js";
import { applyGoldens, type GoldenMode } from "../goldens.js";
import { loadSuite } from "../loadSuite.js";
import { toGitHubSummary } from "../reporters/github.js";
import { toJUnitXml } from "../reporters/junit.js";
import { runSuite } from "../runSuite.js";

function usage(): never {
  console.log(`Usage: agent-eval --suite <file> [options]

Options:
  --adapter mock|openai     default: mock
  --out <report.json>       default: reports/latest.json
  --junit <file.xml>        write JUnit XML
  --github-summary <file>   write GitHub Actions step summary markdown
  --golden <dir>            compare outputs to golden files in dir
  --update-goldens          write outputs into --golden dir (implies compare off)
  --help
`);
  process.exit(1);
}

function argValue(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  if (i === -1) return undefined;
  return args[i + 1];
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) usage();

  const suitePath = argValue(args, "--suite");
  if (!suitePath) usage();

  const adapterName = argValue(args, "--adapter") ?? "mock";
  const outPath = argValue(args, "--out") ?? "reports/latest.json";
  const junitPath = argValue(args, "--junit");
  const summaryPath = argValue(args, "--github-summary");
  const goldenDir = argValue(args, "--golden");
  const updateGoldens = args.includes("--update-goldens");

  let goldenMode: GoldenMode = "off";
  if (updateGoldens) {
    if (!goldenDir) {
      console.error("--update-goldens requires --golden <dir>");
      process.exit(1);
    }
    goldenMode = "update";
  } else if (goldenDir) {
    goldenMode = "compare";
  }

  const suite = await loadSuite(path.resolve(suitePath));
  const adapter = getAdapter(adapterName);
  const result = await runSuite(suite, adapter);

  const goldenOutcomes = await applyGoldens(result.cases, goldenDir ?? "", goldenMode);
  if (goldenMode === "compare") {
    for (const g of goldenOutcomes) {
      const target = result.cases.find((c) => c.id === g.id);
      if (!target) continue;
      if (!g.pass) {
        target.pass = false;
        target.failures.push(...g.failures);
      }
    }
    result.passed = result.cases.filter((c) => c.pass).length;
    result.failed = result.cases.length - result.passed;
  }

  await mkdir(path.dirname(path.resolve(outPath)), { recursive: true });
  await writeFile(path.resolve(outPath), JSON.stringify(result, null, 2) + "\n", "utf8");

  if (junitPath) {
    await mkdir(path.dirname(path.resolve(junitPath)), { recursive: true });
    await writeFile(path.resolve(junitPath), toJUnitXml(result), "utf8");
  }

  if (summaryPath) {
    await mkdir(path.dirname(path.resolve(summaryPath)), { recursive: true });
    await writeFile(path.resolve(summaryPath), toGitHubSummary(result), "utf8");
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, toGitHubSummary(result), {
      encoding: "utf8",
      flag: "a",
    });
  }

  console.log(`Suite: ${result.suite}`);
  console.log(`Adapter: ${result.adapter}`);
  console.log(`Passed: ${result.passed}`);
  console.log(`Failed: ${result.failed}`);
  if (goldenMode !== "off") {
    console.log(`Goldens: ${goldenMode}${goldenDir ? ` (${goldenDir})` : ""}`);
  }
  for (const c of result.cases) {
    const mark = c.pass ? "PASS" : "FAIL";
    console.log(`  [${mark}] ${c.id}`);
    if (!c.pass) {
      for (const f of c.failures) console.log(`         - ${f}`);
    }
  }
  console.log(`Report: ${path.resolve(outPath)}`);
  if (junitPath) console.log(`JUnit: ${path.resolve(junitPath)}`);

  if (result.failed > 0) process.exit(2);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
