import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const JSZip = require("jszip");

const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath) {
  throw new Error("Usage: node update-architecture-slide.mjs <source.pptx> <output.pptx>");
}

const replacements = new Map([
  ["3. การออกแบบและวิธีดำเนินงาน", "3. การออกแบบระบบ / System Architecture"],
  [
    "ระบบใช้เว็บแอปเป็นศูนย์กลาง เชื่อมฐานข้อมูล บทความ เอกสาร และบริการ AI",
    "สถาปัตยกรรมของระบบแบ่งเป็นชั้นการใช้งาน หน้าจอ ระบบหลังบ้าน AI และฐานข้อมูล",
  ],
  ["ภาพรวมการทำงานของระบบ", "1. Client & Frontend Layer"],
  ["ผู้ใช้เข้าสู่ระบบ", "ผู้ใช้งานผ่าน Web Browser"],
  ["ตรวจสอบบทบาทและสิทธิ์", "Next.js 16 App Router"],
  ["จัดการบทความหรือเอกสาร", "React 19 และ TypeScript"],
  ["ค้นหาข้อมูลหรือถาม AI", "Tailwind CSS 4 และ shadcn/ui"],
  ["ระบบบันทึกผลและสถิติการใช้งาน", "Tiptap Editor และ Recharts"],
  ["เครื่องมือที่ใช้", "2. Backend API & AI Layer"],
  ["Next.js: โครงเว็บและหน้าจอระบบ", "Next.js API Routes และ Server Actions"],
  ["Supabase: ฐานข้อมูล เข้าสู่ระบบ และเก็บไฟล์", "Supabase SSR สำหรับ session"],
  ["OpenAI: ช่วยตอบคำถามและประมวลผลภาษา", "OpenAI SDK และ Vercel AI SDK"],
  ["Tailwind CSS: จัดหน้าตาเว็บให้ใช้งานง่าย", "AI Chat, Search, Categorize และ Export"],
  ["แนวทาง", "3. Database, Storage & Automation"],
  [
    "ระบบครอบคลุมงานหลัก ได้แก่ ล็อกอิน ข้อมูลความรู้ เอกสาร แชท AI และสถิติ พร้อมผ่านการทดสอบตามขอบเขตโครงงาน",
    "Supabase, PostgreSQL, pgvector, Supabase Auth, Supabase Storage, RLS และ n8n Webhook",
  ],
]);

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const zip = await JSZip.loadAsync(await fs.readFile(sourcePath));
const slideName = "ppt/slides/slide4.xml";
let xml = await zip.file(slideName).async("string");
let count = 0;
for (const [from, to] of replacements) {
  const escapedFrom = escapeXml(from);
  const escapedTo = escapeXml(to);
  const occurrences = xml.split(escapedFrom).length - 1;
  if (occurrences > 0) {
    xml = xml.split(escapedFrom).join(escapedTo);
    count += occurrences;
  }
}
zip.file(slideName, xml);

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, await zip.generateAsync({ type: "nodebuffer" }));
console.log(`Updated architecture slide with ${count} replacements`);
