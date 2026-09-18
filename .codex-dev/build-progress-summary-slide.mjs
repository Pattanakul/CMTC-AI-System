import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "D:\\cmtc\\CMTC-AI-System";
const SKILL_DIR = "C:\\Users\\ACER\\.codex\\plugins\\cache\\openai-primary-runtime\\presentations\\26.909.61513\\skills\\presentations";
const TMP_DIR = path.join(workspaceDir, ".codex-dev", "progress-summary-slide-build");
const FINAL_PPTX = path.join(workspaceDir, "นำเสนอ", "CMTC_AI_Knowledge_Management_System_สรุปผลการดำเนินงาน.pptx");
const RUNTIME_PYTHON = "C:\\Users\\ACER\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
process.env.RUNTIME_NODE_MODULES = "C:\\Users\\ACER\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
process.env.RUNTIME_BIN_DIR = "C:\\Users\\ACER\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\bin\\override";

const { resolvePresentationFont, finalizePresentation } = await import(
  pathToFileURL(path.join(SKILL_DIR, "container_tools", "artifact_tool_utils.mjs")).href,
);

await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

const family = resolvePresentationFont({ fontFamily: "Tahoma" });
const red = "#ff3434";
const dark = "#2d3642";
const muted = "#4f5c6b";
const border = "#dfe5ec";

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
    color: dark,
    autoFit: "shrinkText",
    ...style,
  };
  return box;
}

function addDotGrid(slide, left, top, cols, rows, color = red) {
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      slide.shapes.add({
        geometry: "ellipse",
        position: { left: left + c * 16, top: top + r * 16, width: 3.5, height: 3.5 },
        fill: color,
        line: { style: "solid", fill: "none", width: 0 },
      });
    }
  }
}

const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const slide = presentation.slides.add();
slide.background.fill = "#ffffff";

slide.shapes.add({
  geometry: "arc",
  position: { left: 348, top: -216, width: 660, height: 540, rotation: 0 },
  fill: "#fff3f3",
  line: { style: "solid", fill: "none", width: 0 },
});
slide.shapes.add({
  geometry: "arc",
  position: { left: 350, top: 190, width: 610, height: 560, rotation: 0 },
  fill: "#fff7f7",
  line: { style: "solid", fill: "none", width: 0 },
});

addDotGrid(slide, 606, 8, 10, 6);
addDotGrid(slide, 6, 358, 7, 6);
addDotGrid(slide, 404, 662, 10, 5);

addText(slide, "สรุปผลการดำเนินงาน", { left: 64, top: 76, width: 720, height: 72 }, {
  fontSize: 48,
  bold: true,
  color: red,
});

const table = slide.tables.add({
  rows: 5,
  columns: 3,
  left: 80,
  top: 176,
  width: 1118,
  height: 342,
  columnTracks: [
    { mode: "fr", value: 1.42 },
    { mode: "fr", value: 2.18 },
    { mode: "fr", value: 0.68 },
  ],
  values: [
    ["สิ่งที่ทำ", "ผลที่ได้จริง", "สถานะ"],
    [
      "1. ระบบเว็บสำหรับจัดการข้อมูล",
      "ทำหน้า Dashboard, จัดการบทความ, จัดการหมวดหมู่, จัดการผู้ใช้ และหน้าใช้งานสำหรับเจ้าหน้าที่",
      "สำเร็จ",
    ],
    [
      "2. ระบบเอกสารและองค์ความรู้",
      "เพิ่มการอัปโหลดเอกสาร จัดเก็บข้อมูล ค้นหา และแสดงรายละเอียดเอกสารในระบบ",
      "สำเร็จ",
    ],
    [
      "3. ระบบ AI Chat และค้นหา",
      "เพิ่มผู้ช่วย AI, ค้นหาด้วยความหมาย, ช่วยจัดหมวดหมู่ และตอบคำถามจากข้อมูลในระบบ",
      "สำเร็จ",
    ],
    [
      "4. ความปลอดภัย รายงาน และเชื่อมต่อระบบอื่น",
      "เพิ่ม Login, สิทธิ์ผู้ใช้ 4 ระดับ, RLS, รายงาน Analytics, Export CSV และ webhook สำหรับ n8n",
      "สำเร็จ",
    ],
  ],
});

table.borders.assign({ style: "solid", fill: border, width: 1 });
table.styleOptions = { headerRow: true, bandedRows: false };

for (let c = 0; c < 3; c += 1) {
  const cell = table.getCell(0, c);
  cell.fill = "#f8fafc";
  cell.text.style = { typeface: family, fontSize: 16, bold: true, color: dark, autoFit: "shrinkText" };
}

for (let r = 1; r < 5; r += 1) {
  for (let c = 0; c < 3; c += 1) {
    const cell = table.getCell(r, c);
    cell.fill = "#ffffff";
    cell.text.style = {
      typeface: family,
      fontSize: c === 2 ? 17 : 16,
      color: c === 2 ? red : c === 0 ? dark : muted,
      bold: c === 0 || c === 2,
      autoFit: "shrinkText",
    };
  }
}

addText(
  slide,
  "สรุปง่าย ๆ: โครงงานทำระบบหลักครบแล้ว ใช้งานได้ทั้งจัดการข้อมูล เอกสาร AI สิทธิ์ผู้ใช้ และรายงาน",
  { left: 80, top: 546, width: 1110, height: 50 },
  { fontSize: 27, bold: true, color: red },
);

addText(
  slide,
  "ประโยคพูด: งานที่ทำเสร็จคือระบบเว็บจัดการองค์ความรู้ของวิทยาลัย มีระบบค้นหา เอกสาร AI และส่วนผู้ดูแลครบตามเป้าหมายหลัก",
  { left: 80, top: 604, width: 1080, height: 52 },
  { fontSize: 22, bold: true, color: dark },
);

slide.speakerNotes.textFrame.setText(
  [
    "อ้างอิงจาก README.md และโครงสร้างโปรเจกต์ CMTC AI Knowledge Management System",
    "สรุปผลดำเนินงานหลัก: Authentication/RBAC/RLS, Knowledge Management, Documents, AI Chat/Search, n8n Webhooks, Analytics และ Export CSV",
    "เวอร์ชันนี้ใช้คำง่ายสำหรับนำเสนอหน้าห้อง",
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
