import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "D:\\cmtc\\CMTC-AI-System";
const SKILL_DIR = "C:\\Users\\ACER\\.codex\\plugins\\cache\\openai-primary-runtime\\presentations\\26.909.61513\\skills\\presentations";
const TMP_DIR = path.join(workspaceDir, ".codex-dev", "issues-simple-slide-build");
const FINAL_PPTX = path.join(workspaceDir, "นำเสนอ", "CMTC_AI_Knowledge_Management_System_ปัญหา_การแก้ไข_แบบง่าย.pptx");
const RUNTIME_PYTHON = "C:\\Users\\ACER\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
process.env.RUNTIME_NODE_MODULES = "C:\\Users\\ACER\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
process.env.RUNTIME_BIN_DIR = "C:\\Users\\ACER\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\bin\\override";

const { resolvePresentationFont, finalizePresentation } = await import(
  pathToFileURL(path.join(SKILL_DIR, "container_tools", "artifact_tool_utils.mjs")).href,
);

await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

const family = resolvePresentationFont({ fontFamily: "Tahoma" });
const white = "#ffffff";
const dark = "#27313f";
const muted = "#4c5968";
const border = "#dfe6ee";

function addText(slide, text, position, style = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    typeface: family,
    fontSize: 24,
    color: white,
    autoFit: "shrinkText",
    ...style,
  };
  return box;
}

function addDotGrid(slide, left, top, cols, rows) {
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      slide.shapes.add({
        geometry: "ellipse",
        position: { left: left + c * 16, top: top + r * 16, width: 3.5, height: 3.5 },
        fill: white,
        line: { style: "solid", fill: "none", width: 0 },
      });
    }
  }
}

const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const slide = presentation.slides.add();
slide.background.fill = {
  type: "gradient",
  stops: [
    { color: "#ff3038", offset: 0 },
    { color: "#ff684e", offset: 52000 },
    { color: "#ff9d55", offset: 100000 },
  ],
};

slide.shapes.add({
  geometry: "arc",
  position: { left: 1114, top: -60, width: 360, height: 780 },
  fill: "#ffc08a",
  line: { style: "solid", fill: "none", width: 0 },
});
slide.shapes.add({
  geometry: "arc",
  position: { left: 118, top: -184, width: 754, height: 820 },
  fill: "#ff8a66",
  line: { style: "solid", fill: "none", width: 0 },
});
slide.shapes.add({
  geometry: "ellipse",
  position: { left: 55, top: 310, width: 300, height: 300 },
  fill: "#ff6f64",
  line: { style: "solid", fill: "none", width: 0 },
});

addDotGrid(slide, 605, 8, 10, 6);
addDotGrid(slide, 8, 208, 7, 6);
addDotGrid(slide, 1188, 628, 7, 6);

addText(slide, "ปัญหาที่พบและการแก้ไข", { left: 48, top: 62, width: 820, height: 76 }, {
  fontSize: 46,
  bold: true,
});

const table = slide.tables.add({
  rows: 5,
  columns: 4,
  left: 64,
  top: 150,
  width: 1152,
  height: 350,
  columnTracks: [
    { mode: "fr", value: 1.08 },
    { mode: "fr", value: 1.1 },
    { mode: "fr", value: 1.28 },
    { mode: "fr", value: 1.14 },
  ],
  values: [
    ["ปัญหา", "เกิดจากอะไร", "แก้ยังไง", "ผลตอนนี้"],
    [
      "1. ตอน build ระบบไม่ผ่าน",
      "ระบบต้องโหลดฟอนต์จากอินเทอร์เน็ต",
      "เปิดให้ build ดึงฟอนต์ได้",
      "Build ผ่านแล้ว แต่ตอน deploy ต้องตั้งค่าให้ดึงฟอนต์ได้",
    ],
    [
      "2. ตรวจโค้ดแล้วยังมี error",
      "บางไฟล์ยังเขียน type ไม่ชัด",
      "ต้องแก้ any และลบโค้ดที่ไม่ใช้",
      "ระบบรันได้ แต่ควรแก้ lint ก่อนส่งงานจริง",
    ],
    [
      "3. สิทธิ์ผู้ใช้และเอกสารค่อนข้างซับซ้อน",
      "มีหลาย role และเอกสารแยกตามแผนก",
      "เพิ่มกฎในฐานข้อมูลให้แยกสิทธิ์ชัดขึ้น",
      "ใช้งานได้ดีขึ้น แต่ควรทดสอบด้วยบัญชีจริงทุก role",
    ],
    [
      "4. AI และ n8n ต้องใช้บริการภายนอก",
      "ต้องมี API key และข้อมูลจริงในระบบ",
      "แยก key ไว้ฝั่ง server และทำ endpoint รองรับ",
      "สาธิต flow ได้ แต่คำตอบ AI ขึ้นกับข้อมูลและ quota",
    ],
  ],
});

table.borders.assign({ style: "solid", fill: border, width: 1 });
table.styleOptions = { headerRow: true, bandedRows: false };

for (let c = 0; c < 4; c += 1) {
  const cell = table.getCell(0, c);
  cell.fill = "#f8fafc";
  cell.text.style = { typeface: family, fontSize: 17, bold: true, color: dark, autoFit: "shrinkText" };
}

for (let r = 1; r < 5; r += 1) {
  for (let c = 0; c < 4; c += 1) {
    const cell = table.getCell(r, c);
    cell.fill = white;
    cell.text.style = {
      typeface: family,
      fontSize: 16,
      color: c === 0 ? dark : muted,
      bold: c === 0,
      autoFit: "shrinkText",
    };
  }
}

addText(
  slide,
  "สรุปง่าย ๆ: ระบบใช้งานหลักได้แล้ว แต่ก่อนส่งจริงควรแก้ lint ให้ผ่าน และทดสอบกับผู้ใช้จริงอีกครั้ง",
  { left: 64, top: 538, width: 1115, height: 58 },
  { fontSize: 29, bold: true },
);

addText(
  slide,
  "ประโยคพูด: ระหว่างพัฒนาเจอปัญหาหลัก 4 เรื่อง เราแก้จนระบบ build และใช้งานหลักได้แล้ว เหลือปรับคุณภาพโค้ดและทดสอบผู้ใช้จริงให้ครบ",
  { left: 64, top: 608, width: 1085, height: 48 },
  { fontSize: 23, bold: true },
);

slide.speakerNotes.textFrame.setText(
  [
    "เวอร์ชันนี้ทำให้ใช้พูดง่ายที่สุดสำหรับนำเสนอหน้าห้อง",
    "ข้อมูลยังอ้างอิงจากผลตรวจโปรเจกต์เดิม: build ผ่าน, type-check ผ่าน, lint ยังต้องแก้, และระบบมี AI/n8n/Supabase ที่ต้องใช้ key กับข้อมูลจริง",
  ].join("\n"),
);

const candidatePath = path.join(TMP_DIR, "candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
const preview = await presentation.export({ slide, format: "png", scale: 1 });
await fs.writeFile(path.join(TMP_DIR, "slide-1.png"), new Uint8Array(await preview.arrayBuffer()));

const result = await finalizePresentation({
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools", "inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools", "inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu",
    "12192000,6858000",
    "--validate-heading-fit",
    "--require-native-table-slide",
    "1",
  ],
  explicitTotalSlideCount: 1,
  requiredNativeTableOwnerSlides: [1],
  fontPolicy: {
    basis: "design",
    families: [family],
    scriptFonts: { cs: family },
  },
  verifyArtifactToolImport: true,
  receiptPath: path.join(TMP_DIR, "validation.json"),
});

console.log(JSON.stringify({ finalPath: result.finalPath, receiptPath: result.receiptPath }, null, 2));
