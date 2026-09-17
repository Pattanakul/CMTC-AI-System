import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const JSZip = require("jszip");

const pptxPath = process.argv[2];
const data = await fs.readFile(pptxPath);
const zip = await JSZip.loadAsync(data);

const slideNames = Object.keys(zip.files)
  .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
  .sort((a, b) => Number(a.match(/slide(\d+)/)[1]) - Number(b.match(/slide(\d+)/)[1]));

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

for (const slideName of slideNames) {
  const xml = await zip.file(slideName).async("string");
  const parts = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((match) => decodeXml(match[1]));
  console.log(`\n--- ${path.basename(slideName, ".xml")} ---`);
  console.log(parts.join("\n"));
}
