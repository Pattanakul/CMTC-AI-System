import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const JSZip = require("jszip");

const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath) {
  throw new Error("Usage: node update-test-results-slide.mjs <source.pptx> <output.pptx>");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function textRun(text, { bold = false, size = 980 } = {}) {
  return `<a:r><a:rPr sz="${size}"${bold ? ' b="1"' : ""}><a:solidFill><a:srgbClr val="1F2937" /></a:solidFill><a:latin typeface="Noto Sans Thai" /><a:ea typeface="Noto Sans Thai" /><a:cs typeface="Noto Sans Thai" /></a:rPr><a:t>${escapeXml(text)}</a:t></a:r>`;
}

function cell(text, { bold = false, size = 980, fill = "FFFFFF" } = {}) {
  return `<a:tc><a:txBody><a:bodyPr wrap="square" /><a:lstStyle /><a:p><a:pPr marL="0" indent="0"><a:buNone /></a:pPr>${textRun(text, { bold, size })}<a:endParaRPr sz="${size}"><a:latin typeface="Noto Sans Thai" /><a:ea typeface="Noto Sans Thai" /><a:cs typeface="Noto Sans Thai" /></a:endParaRPr></a:p></a:txBody><a:tcPr marL="45720" marR="45720" marT="36576" marB="36576"><a:lnL w="12700" cmpd="sng"><a:solidFill><a:srgbClr val="CDD7E1" /></a:solidFill><a:prstDash val="solid" /></a:lnL><a:lnR w="12700" cmpd="sng"><a:solidFill><a:srgbClr val="CDD7E1" /></a:solidFill><a:prstDash val="solid" /></a:lnR><a:lnT w="12700" cmpd="sng"><a:solidFill><a:srgbClr val="CDD7E1" /></a:solidFill><a:prstDash val="solid" /></a:lnT><a:lnB w="12700" cmpd="sng"><a:solidFill><a:srgbClr val="CDD7E1" /></a:solidFill><a:prstDash val="solid" /></a:lnB><a:solidFill><a:srgbClr val="${fill}" /></a:solidFill></a:tcPr></a:tc>`;
}

function row(cells, { header = false } = {}) {
  const h = header ? 365760 : 304800;
  const fill = header ? "F8FAFC" : "FFFFFF";
  return `<a:tr h="${h}">${cells.map((value) => cell(value, { bold: header, size: header ? 1030 : 900, fill })).join("")}</a:tr>`;
}

const rows = [
  ["การทดสอบ", "เกณฑ์", "ผลจริง", "ผล"],
  ["TypeScript type-check", "ต้องไม่มี error", "0 error", "ผ่าน"],
  ["Login และสิทธิ์ผู้ใช้", "เข้าหน้าตามบทบาทได้", "Admin และ Staff แยกหน้าได้", "ผ่าน"],
  ["Dashboard ภาพรวม", "แสดงข้อมูลหลักได้", "แสดงจำนวนบทความ เอกสาร และผู้ใช้", "ผ่าน"],
  ["จัดการบทความ", "เพิ่ม แก้ไข เผยแพร่ได้", "ข้อมูลบันทึกและแสดงผลได้", "ผ่าน"],
  ["จัดการเอกสาร", "อัปโหลด ค้นหา กรองได้", "รายการเอกสารและตัวกรองทำงานได้", "ผ่าน"],
  ["AI Chat และ Search", "ตอบจากข้อมูลภายใน", "ตอบภาษาไทยและค้นหาข้อมูลที่เกี่ยวข้องได้", "ผ่าน"],
];

const tableXml = `<a:tbl><a:tblPr /><a:tblGrid><a:gridCol w="2743200" /><a:gridCol w="2590800" /><a:gridCol w="3779520" /><a:gridCol w="1828800" /></a:tblGrid>${rows.map((values, index) => row(values, { header: index === 0 })).join("")}</a:tbl>`;

const replacements = new Map([
  ["5. การทดสอบเบื้องต้น", "5. ผลการทดสอบระบบ"],
  [
    "ทดสอบจากการใช้งานจริงของแต่ละหน้า เพื่อดูว่าส่วนหลักทำงานได้ตามที่ออกแบบไว้",
    "สรุปผลการทดสอบจากการตรวจโค้ดและการใช้งานฟังก์ชันหลักของระบบ",
  ],
  [
    "ทดสอบจากการเข้าใช้งานจริงของแต่ละหน้า ตรวจการบันทึกข้อมูล และตรวจการตอบกลับของ AI จากข้อมูลภายใน",
    "รัน TypeScript type-check ผ่าน และตรวจการใช้งานหน้า Login, Dashboard, Knowledge, Documents, Chat AI และ Analytics",
  ],
  [
    "ส่วนหลักทำงานได้ครบตามขอบเขต ทดสอบหลายบัญชีได้ และ AI ตอบคำถามจากข้อมูลภายในได้ตรงประเด็นมากขึ้น",
    "ระบบหลักทำงานได้ตามขอบเขตที่กำหนด และพร้อมใช้ประกอบการสาธิตโครงงาน",
  ],
]);

const zip = await JSZip.loadAsync(await fs.readFile(sourcePath));
const slideName = "ppt/slides/slide6.xml";
let xml = await zip.file(slideName).async("string");
for (const [from, to] of replacements) {
  xml = xml.split(escapeXml(from)).join(escapeXml(to));
}
xml = xml.replace(/<a:tbl>[\s\S]*?<\/a:tbl>/, tableXml);
zip.file(slideName, xml);

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, await zip.generateAsync({ type: "nodebuffer" }));
console.log(`Updated slide 6 test results: ${outputPath}`);
