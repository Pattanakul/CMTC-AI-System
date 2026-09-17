import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const JSZip = require("jszip");

const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath) {
  throw new Error("Usage: node polish-architecture-bullets.mjs <source.pptx> <output.pptx>");
}

const replacements = new Map([
  ["1. Client & Frontend Layer", "1. Client Layer / 2. Frontend Layer"],
  ["ผู้ใช้งานผ่าน Web Browser", "• ผู้ดูแลระบบ เจ้าหน้าที่ และผู้ใช้ทั่วไป"],
  ["Next.js 16 App Router", "• Web Browser บน Desktop / Mobile"],
  ["React 19 และ TypeScript", "• Next.js 16 App Router"],
  ["Tailwind CSS 4 และ shadcn/ui", "• React 19 และ TypeScript"],
  ["Tiptap Editor และ Recharts", "• Tailwind CSS 4, shadcn/ui, Tiptap, Recharts"],
  ["2. Backend API & AI Layer", "3. Backend API & AI Layer"],
  ["Next.js API Routes และ Server Actions", "• Next.js API Routes และ Server Actions"],
  ["Supabase SSR สำหรับ session", "• Supabase SSR สำหรับ session"],
  ["OpenAI SDK และ Vercel AI SDK", "• OpenAI SDK และ Vercel AI SDK"],
  ["AI Chat, Search, Categorize และ Export", "• AI Chat, Search, Categorize และ Export"],
  ["3. Database,\nStorage &\nAutomation", "4. Database, Storage & Automation"],
  [
    "Supabase, PostgreSQL, pgvector, Supabase Auth, Supabase Storage, RLS และ n8n Webhook",
    "• Supabase และ PostgreSQL  • pgvector สำหรับ Semantic Search  • Supabase Auth, Storage, RLS  • n8n Webhook",
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
console.log(`Polished architecture bullets with ${count} replacements`);
