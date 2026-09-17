import path from "node:path";
import { pathToFileURL } from "node:url";

const sourcePath = process.argv[2];
const moduleRoot = "C:/Users/ACER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const artifactToolPath = path.join(moduleRoot, "@oai/artifact-tool/dist/artifact_tool.mjs");
const { FileBlob, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);

const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
const snapshot = await presentation.inspect({
  kind: "slide,textbox,shape,image,table,chart,notes,layout",
  maxChars: 20000,
});

console.log(snapshot.ndjson);
