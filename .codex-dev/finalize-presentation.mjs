import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [candidatePath, finalPath] = process.argv.slice(2);
if (!candidatePath || !finalPath) {
  throw new Error("Usage: node finalize-presentation.mjs <candidate.pptx> <final.pptx>");
}

const workspaceDir = "D:/cmtc/CMTC-AI-System";
const skillDir = "C:/Users/ACER/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.61513/skills/presentations";
const pythonExecutable = "C:/Users/ACER/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
process.env.RUNTIME_NODE_MODULES = "C:/Users/ACER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
process.env.RUNTIME_NODE = "C:/Users/ACER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe";
process.env.RUNTIME_BIN_DIR = "C:/Users/ACER/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override";
const { finalizePresentation } = await import(pathToFileURL(
  path.join(skillDir, "container_tools/artifact_tool_utils.mjs"),
).href);

const stagingDir = path.join(workspaceDir, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
await fs.mkdir(path.dirname(finalPath), { recursive: true });

const requirements = {
  explicitTotalSlideCount: 11,
  requiredNativeTableOwnerSlides: [3, 6, 7, 8, 9],
  requiredNativeChartOwnerSlides: [],
};

await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable,
  integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
    "--require-native-table-slide", "3",
    "--require-native-table-slide", "6",
    "--require-native-table-slide", "7",
    "--require-native-table-slide", "8",
    "--require-native-table-slide", "9",
  ],
  requiredNativeTableOwnerSlides: requirements.requiredNativeTableOwnerSlides,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, `${path.basename(finalPath)}.validation.json`),
});

console.log(`Finalized ${finalPath}`);
