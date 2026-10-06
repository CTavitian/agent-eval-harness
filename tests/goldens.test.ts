import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyGoldens } from "../src/goldens.js";

describe("goldens", () => {
  it("updates and then compares", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "goldens-"));
    const cases = [
      { id: "a", pass: true, output: '{"ok":true}', failures: [] },
    ];
    await applyGoldens(cases, dir, "update");
    const written = await readFile(path.join(dir, "a.txt"), "utf8");
    expect(written).toBe('{"ok":true}');

    const pass = await applyGoldens(cases, dir, "compare");
    expect(pass[0]?.pass).toBe(true);

    const fail = await applyGoldens(
      [{ id: "a", pass: true, output: "changed", failures: [] }],
      dir,
      "compare",
    );
    expect(fail[0]?.pass).toBe(false);
  });
});
