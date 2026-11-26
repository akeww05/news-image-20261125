// main.ts — entry point for news-image-20261125.
// Copies the renderer output (entry.png) into the output directory.
// Node stdlib only. No network, no downloaded assets.

import * as fs from "node:fs";
import * as path from "node:path";

const outDir: string = process.env.MAKEFUN_OUTPUT_DIR || "out";
const src: string = path.join(process.cwd(), "entry.png");
const dest: string = path.join(outDir, "entry.png");

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(src, dest);
const size: number = fs.statSync(dest).size;
console.log("copied entry.png to " + dest + " (" + size + " bytes)");
