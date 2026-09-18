import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "D:\\cmtc\\CMTC-AI-System";
const SKILL_DIR = "C:\\Users\\ACER\\.codex\\plugins\\cache\\openai-primary-runtime\\presentations\\26.909.61513\\skills\\presentations";
const TMP_DIR = path.join(workspaceDir, ".codex-dev", "issues-limitations-slide-build");
const FINAL_PPTX = path.join(workspaceDir, "นำเสนอ", "CMTC_AI_Knowledge_Management_System_ปัญหา_การแก้ไข_ข้อจำกัด.pptx");
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
const headerFill = "#f8fafc";

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

function addDotGrid(slide, left, top, cols, rows, color = "#ffffff") {
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
slide.background.fill = {
  type: "gradient",
  stops: [
    { color: "#ff2f36", offset: 0 },
    { color: "#ff664f", offset: 52000 },
    { color: "#ff9c55", offset: 100000 },
  ],
};

slide.shapes.add({
  geometry: "arc",
  position: { left: 1114, top: -60, width: 360, height: 780, rotation: 0 },
  fill: "#ffc08a",
  line: { style: "solid", fill: "none", width: 0 },
});
slide.shapes.add({
  geometry: "arc",
  position: { left: 118, top: -184, width: 754, height: 820, rotation: 0 },
  fill: "#ff8a66",
  line: { style: "solid", fill: "none", width: 0 },
});
slide.shapes.add({
  geometry: "ellipse",
  position: { left: 55, top: 310, width: 300, height: 300 },
  fill: "#ff6f64",
  line: { style: "solid", fill: "none", width: 0 },
});

addDotGrid(slide, 605, 8, 10, 6, "#ffffff");
addDotGrid(slide, 8, 208, 7, 6, "#ffffff");
addDotGrid(slide, 1188, 628, 7, 6, "#ffffff");

addText(slide, "ปัญหาที่พบ การแก้ไข และข้อจำกัด", { left: 48, top: 62, width: 880, height: 76 }, {
  fontSize: 44,
  bold: true,
  color: white,
});

const table = slide.tables.add({
  rows: 5,
  columns: 4,
  left: 64,
  top: 150,
  width: 1152,
  height: 360,
  columnTracks: [
    { mode: "fr", value: 1.22 },
    { mode: "fr", value: 1.24 },
    { mode: "fr", value: 1.5 },
    { mode: "fr", value: 1.3 },
  ],
  values: [
    ["ปัญหาที่พบระหว่างพัฒนา", "สาเหตุของปัญหา", "วิธีการแก้ไขเชิงเทคนิค", "ผลลัพธ์และข้อจำกัด"],
    [
      "1. Production build ล้มเหลวตอนแรก",
      "Next.js ต้องดึงฟอนต์ Geist จาก Google Fonts แต่สภาพแวดล้อมทดสอบปิดเครือข่าย",
      "อนุญาตเครือข่ายระหว่าง build และตรวจซ้ำด้วย npm run build",
      "Build ผ่าน สร้างหน้า static/dynamic ได้ครบ แต่ deploy จริงต้องให้ server ดึงฟอนต์ได้หรือเปลี่ยนเป็น local font",
    ],
    [
      "2. ESLint ยังพบข้อผิดพลาด",
      "หลายไฟล์ยังใช้ any และมี unused imports ในบางหน้า",
      "ต้องกำหนด type ให้ชัดเจน เช่น User, Article, API response และลบตัวแปรที่ไม่ใช้",
      "Type-check ผ่านแล้ว แต่ lint ยังเหลือ 38 errors จึงเป็นข้อจำกัดก่อนส่งมอบฉบับสมบูรณ์",
    ],
    [
      "3. สิทธิ์ข้อมูลและไฟล์เอกสารซับซ้อน",
      "Supabase ใช้ Auth, RLS, Storage และเอกสารแยกตามแผนก ทำให้ policy ต้องละเอียด",
      "เพิ่ม migrations สำหรับ documents, storage policies, department_id และ RLS เฉพาะ upload/delete",
      "ระบบรองรับการแยกสิทธิ์ดีขึ้น แต่ต้องทดสอบ UAT กับบัญชีแต่ละ role เพิ่ม",
    ],
    [
      "4. AI Chat, Search และ n8n ต้องพึ่งบริการภายนอก",
      "Semantic Search ใช้ OpenAI embeddings และ n8n ใช้ webhook key จาก environment variables",
      "แยก API endpoint สำหรับ chat, search, categorize, queue และ webhook พร้อมเก็บ key ฝั่ง server",
      "ระบบพร้อมสาธิต flow หลัก แต่คุณภาพคำตอบ AI และ automation ขึ้นกับ key, quota และข้อมูลจริงในฐานข้อมูล",
    ],
  ],
});

table.borders.assign({ style: "solid", fill: border, width: 1 });
table.styleOptions = { headerRow: true, bandedRows: false };

for (let c = 0; c < 4; c += 1) {
  const cell = table.getCell(0, c);
  cell.fill = headerFill;
  cell.text.style = { typeface: family, fontSize: 15, bold: true, color: dark, autoFit: "shrinkText" };
}

for (let r = 1; r < 5; r += 1) {
  for (let c = 0; c < 4; c += 1) {
    const cell = table.getCell(r, c);
    cell.fill = white;
    cell.text.style = {
      typeface: family,
      fontSize: 14,
      color: c === 0 ? dark : muted,
      bold: c === 0,
      autoFit: "shrinkText",
    };
  }
}

addText(
  slide,
  "ข้อจำกัดสำคัญ: ต้องแก้ ESLint ให้ผ่านทั้งหมด ทดสอบ role จริง และตรวจ webhook/AI ด้วยข้อมูล Production ก่อนส่งมอบ",
  { left: 64, top: 540, width: 1120, height: 44 },
  { fontSize: 25, bold: true, color: white },
);

slide.speakerNotes.textFrame.setText(
  [
    "ข้อมูลอ้างอิงจาก README.md, src/app/api, src/features/documents, src/features/ai, src/features/automation และ supabase/migrations",
    "ผลตรวจล่าสุดจากงานก่อนหน้า: npm run build ผ่านหลังอนุญาตให้ดึง Google Fonts, npm run type-check ผ่าน, npm run lint ยังพบ 38 errors และ 14 warnings",
    "สไลด์นี้สรุปปัญหาและข้อจำกัดของโปรเจกต์ CMTC AI Knowledge Management System ไม่ใช่ข้อความจากภาพตัวอย่าง",
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
