import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { Suite } from "./types.js";

export async function loadSuite(filePath: string): Promise<Suite> {
  const raw = await readFile(filePath, "utf8");
  const ext = path.extname(filePath).toLowerCase();
  const data = ext === ".json" ? JSON.parse(raw) : parseYaml(raw);

  if (!data || typeof data !== "object" || !Array.isArray((data as Suite).cases)) {
    throw new Error(`Suite must be an object with a cases array: ${filePath}`);
  }

  return data as Suite;
}
