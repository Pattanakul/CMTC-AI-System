import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "D:\\cmtc\\CMTC-AI-System";
const SKILL_DIR = "C:\\Users\\ACER\\.codex\\plugins\\cache\\openai-primary-runtime\\presentations\\26.909.61513\\skills\\presentations";
const TMP_DIR = path.join(workspaceDir, ".codex-dev", "test-summary-slide-build");
const FINAL_PPTX = path.join(workspaceDir, "นำเสนอ", "CMTC_AI_Knowledge_Management_System_แผนการทดสอบและสรุปผล.pptx");
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
const border = "#dbe2ea";
const paleRed = "#fff1f1";

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
  geometry: "parallelogram",
  position: { left: 410, top: -64, width: 560, height: 386 },
  fill: paleRed,
  line: { style: "solid", fill: "none", width: 0 },
});

slide.shapes.add({
  geometry: "parallelogram",
  position: { left: 120, top: 378, width: 720, height: 348, horizontalFlip: true },
  fill: "#fff7f7",
  line: { style: "solid", fill: "none", width: 0 },
});

addDotGrid(slide, 604, 6, 10, 7);
addDotGrid(slide, 2, 452, 9, 6);
addDotGrid(slide, 1186, 208, 7, 6);
addDotGrid(slide, 996, 655, 10, 5);

addText(slide, "แผนการทดสอบและวิธีประเมิน", { left: 64, top: 42, width: 820, height: 62 }, {
  fontSize: 44,
  bold: true,
  color: red,
});

const table = slide.tables.add({
  rows: 5,
  columns: 3,
  left: 64,
  top: 122,
  width: 1124,
  height: 260,
  columnTracks: [
    { mode: "fr", value: 1.08 },
    { mode: "fr", value: 3.1 },
    { mode: "fr", value: 2.28 },
  ],
  values: [
    ["ประเภทการทดสอบ", "รายการและกรณีทดสอบของระบบ", "เกณฑ์และผลการประเมิน"],
    ["Functional Test", "ตรวจ Login/Logout, สิทธิ์ผู้ใช้, CRUD บทความ, เอกสาร, หมวดหมู่ และ AI Chat", "ผ่านจากการทดสอบการใช้งานหลัก และ build ผ่าน"],
    ["API & Integration Test", "ตรวจ API 6 endpoint: Chat, Search, AI Categorize, AI Queue, Export และ n8n Webhook", "ผ่านด้านโครงสร้างและการเชื่อมต่อภายในระบบ"],
    ["Code Quality Test", "ตรวจ TypeScript, ESLint และ production build ของ Next.js 16", "Type-check ผ่าน, Build ผ่าน, Lint ยังต้องแก้ 38 errors"],
    ["User Acceptance Test (UAT)", "ให้ผู้ดูแลและเจ้าหน้าที่ทดลองใช้ผ่าน Web เช่น ค้นหา, อัปโหลดเอกสาร, ถาม AI และจัดการบทความ", "อยู่ในขั้นทดลองใช้งานจริงและเก็บข้อเสนอแนะ"],
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
    cell.text.style = { typeface: family, fontSize: 15, color: c === 0 ? dark : muted, bold: c === 0, autoFit: "shrinkText" };
  }
}

addText(slide, "สรุปรายละเอียดการทดสอบ (TEST SUMMARY)", { left: 64, top: 402, width: 1000, height: 48 }, {
  fontSize: 36,
  bold: true,
  color: red,
});

const summary = [
  "จำนวนชุดการทดสอบ: ตรวจ 4 กลุ่มหลัก ได้แก่ Functional, API/Integration, Code Quality และ UAT",
  "ความถูกต้องของระบบ: TypeScript ตรวจผ่าน 100% และ production build ผ่านหลังอนุญาตให้ดึงฟอนต์",
  "ขอบเขต API: ตรวจพบและตรวจสอบ endpoint หลัก 6 จุด ครอบคลุม Chat, Search, AI, Export และ n8n",
  "ฐานข้อมูลและความปลอดภัย: มี Supabase migrations 19 ไฟล์ รองรับ Auth, RLS, Storage และ pgvector",
  "ข้อที่ต้องปรับปรุง: ESLint ยังพบ 38 errors ส่วนใหญ่เป็นการใช้ any และ unused code บางจุด",
  "สรุป: ระบบพร้อมสาธิตการทำงานหลัก แต่ควรแก้ lint และเก็บผล UAT เพิ่มก่อนส่งมอบฉบับสมบูรณ์",
];

addText(slide, summary.map((item) => `• ${item}`).join("\n"), { left: 88, top: 458, width: 1110, height: 206 }, {
  fontSize: 23,
  color: red,
  autoFit: "shrinkText",
});

slide.speakerNotes.textFrame.setText(
  [
    "ข้อมูลสรุปอ้างอิงจาก README.md, package.json, โครงสร้าง src/app/api และ supabase/migrations ณ วันที่ 17 กันยายน 2026",
    "ผลตรวจล่าสุด: npm run type-check ผ่าน, npm run build ผ่านเมื่ออนุญาตให้ดึง Google Fonts, npm run lint พบ 38 errors และ 14 warnings",
    "API endpoint ที่ตรวจพบ: /api/chat, /api/search, /api/ai/categorize, /api/ai/queue, /api/export/analytics, /api/webhooks/n8n",
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
