import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const [sourcePath, outDir] = process.argv.slice(2);
if (!sourcePath || !outDir) {
  throw new Error("Usage: node inspect_deck.mjs <source.pptx> <out-dir>");
}

await fs.mkdir(outDir, { recursive: true });
const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
const snapshot = await presentation.inspect({
  kind: "deck,slide,textbox,shape,image,table,chart,notes,layout",
  include: "id,slide,name,title,text,textPreview,textChars,textLines,bbox,bboxUnit,rows,cols,isPlaceholder",
  maxChars: 50000,
});
await fs.writeFile(path.join(outDir, "deck-inspect.ndjson"), snapshot.ndjson, "utf8");

const montage = await presentation.export({ format: "png", montage: true, scale: 1 });
await fs.writeFile(path.join(outDir, "montage.png"), new Uint8Array(await montage.arrayBuffer()));

const slideCount = presentation.slides.length ?? presentation.slides.items?.length ?? 0;
for (let i = 0; i < slideCount; i += 1) {
  const slide = presentation.slides.getItem(i);
  const preview = await slide.export({ format: "png", scale: 1 });
  await fs.writeFile(path.join(outDir, `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await preview.arrayBuffer()));
}
