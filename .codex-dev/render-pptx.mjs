import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [pptxPath, outputDir] = process.argv.slice(2);
if (!pptxPath || !outputDir) {
  throw new Error("Usage: node render-pptx.mjs <deck.pptx> <output-dir>");
}

const moduleRoot = "C:/Users/ACER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const artifactToolPath = path.join(moduleRoot, "@oai/artifact-tool/dist/artifact_tool.mjs");
const { FileBlob, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);

await fs.mkdir(outputDir, { recursive: true });
const presentation = await PresentationFile.importPptx(await FileBlob.load(pptxPath));
let index = 1;
for (const slide of presentation.slides.items) {
  const preview = await presentation.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(
    path.join(outputDir, `slide-${String(index).padStart(2, "0")}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
  index += 1;
}

console.log(`Rendered ${index - 1} slides to ${outputDir}`);
