# CMTC AI Knowledge Management System
**ระบบจัดการข้อมูลและองค์ความรู้สำหรับวิทยาลัยเทคนิคเชียงใหม่**

CMTC AI Knowledge Management System เป็นระบบสำหรับจัดเก็บ จัดการ และค้นหาองค์ความรู้ (Knowledge Articles) สำหรับวิทยาลัยเทคนิคเชียงใหม่ ระบบถูกออกแบบมาให้รองรับการจัดการสิทธิ์ผู้ใช้งาน (Role-Based Access Control) การจัดหมวดหมู่ข้อมูล การค้นหาด้วยความหมาย (Semantic Search) และมีระบบ AI Chat Assistant เพื่อช่วยอำนวยความสะดวกให้บุคลากรสามารถเข้าถึงข้อมูลได้อย่างรวดเร็วและแม่นยำ

## ✨ ระบบหลัก

จากการพัฒนาในปัจจุบัน ระบบมีฟีเจอร์หลักที่พร้อมใช้งานดังนี้:

* **Authentication & Security**
  * ระบบ Login / Logout ผ่าน Supabase Authentication
  * Role-Based Access Control (RBAC) ควบคุมสิทธิ์การใช้งาน
  * Row Level Security (RLS) ระดับฐานข้อมูลเพื่อความปลอดภัย
* **Knowledge Management**
  * Knowledge Article CRUD (สร้าง อ่าน แก้ไข ลบ)
  * ระบบจัดหมวดหมู่ (Category & Tag Management)
  * การจัดการสถานะบทความ (Draft, Published, Archived)
  * Rich Text Editor (Tiptap) สำหรับเขียนบทความ
  * ระบบอัปโหลดและจัดการไฟล์ Media (Supabase Storage)
* **AI Integration**
  * AI-powered Semantic Search (ค้นหาด้วยความหมายผ่าน `pgvector` และ OpenAI Embeddings)
  * Auto-categorization (AI ช่วยแนะนำหมวดหมู่และสรุปเนื้อหาบทความอัตโนมัติ)
  * AI Chat Assistant (ผู้ช่วย AI ตอบคำถามจากบริบทขององค์ความรู้)
  * Content Recommendations (แนะนำบทความที่เกี่ยวข้อง)
* **n8n Workflow Automation**
  * ระบบยิง Webhook (Outgoing) เมื่อบทความถูก Publish
  * Background AI Processing Queue (ส่งบทความให้ประมวลผลเบื้องหลัง)
  * Webhook Receiver (Incoming) รับคำสั่งกลับจาก n8n เพื่ออัปเดตสถานะหรือเก็บ Analytics
* **Analytics & Reporting**
  * Usage Analytics Dashboard สำหรับดูภาพรวมของระบบ
  * Knowledge Gap Analysis วิเคราะห์ช่องโหว่ความรู้จากคำถามที่ AI ไม่มั่นใจ
  * Export Reports เป็นไฟล์ CSV

## 💻 Technology Stack

ระบบพัฒนาด้วยเทคโนโลยีที่ทันสมัย ดังนี้:

* **Frontend Framework:** Next.js 16.2.9, React 19.2.4, TypeScript
* **UI & Styling:** Tailwind CSS 4, shadcn/ui, Lucide React
* **Backend & Database:** Supabase, PostgreSQL (พร้อม `pgvector` สำหรับ Semantic Search)
* **AI & Machine Learning:** OpenAI SDK (`openai`), Vercel AI SDK (`ai`)
* **Automation:** n8n (ผ่าน API Webhooks)
* **Rich Text Editor:** Tiptap
* **Charts:** Recharts
* **Code Quality:** ESLint, Prettier

## 👥 User Roles

ระบบรองรับการแบ่งสิทธิ์ผู้ใช้งานตาม Role ในฐานข้อมูล (`profiles.role`) ดังนี้:

* **Super Admin:** ผู้ดูแลระบบระดับสูง มีสิทธิ์เข้าถึงและจัดการข้อมูลทุกส่วนในระบบ
* **Admin:** ผู้ดูแลระบบสำหรับการจัดการข้อมูลองค์ความรู้ในภาพรวม
* **Department Admin:** ผู้ดูแลข้อมูลและการจัดการองค์ความรู้เฉพาะภายในแผนกของตนเอง
* **User (Default):** ผู้ใช้งานทั่วไป สามารถเข้าถึงและอ่านบทความองค์ความรู้ รวมถึงใช้งาน AI Chat Assistant

## 📚 Knowledge Management

โมดูลจัดการองค์ความรู้ประกอบด้วยฟังก์ชัน:
* **แสดงรายการ Knowledge Articles:** แสดงข้อมูลบทความทั้งหมด พร้อมฟิลเตอร์และการค้นหา (อยู่ใน `/admin/articles` และ `/admin/knowledge`)
* **เพิ่ม/แก้ไข ข้อมูล:** ใช้ Rich Text Editor ในการจัดทำเนื้อหา พร้อมระบบ Auto-categorize ด้วย AI
* **Category Management:** จัดการหมวดหมู่ของบทความเพื่อความเป็นระเบียบ
* **Publish / Draft Status:** ผู้เขียนสามารถบันทึกเป็น Draft และ Publish เมื่อพร้อม
* **Semantic Search:** ค้นหาบทความจากความหมาย ไม่ใช่แค่เพียงการค้นหาจากคำตรงตัว
* **Related Articles:** ระบบแนะนำบทความที่มีเนื้อหาใกล้เคียงกันตอนท้ายบทความ

## 🔐 Security

* **Supabase Authentication:** จัดการ Session อย่างปลอดภัยผ่าน Supabase SSR
* **Role-Based Access Control & Protected Routes:** ตรวจสอบสิทธิ์ผู้ใช้ใน Server Components และ API Routes
* **Row Level Security (RLS):** ฐานข้อมูลมีการตั้ง RLS Policy เพื่อป้องกันการอ่าน/เขียนข้อมูลข้ามสิทธิ์
* **Environment Variables:** มีการเก็บ Key สำคัญใน `.env.local`
  * ข้อควรระวัง: `SUPABASE_SERVICE_ROLE_KEY` หรือ `N8N_API_KEY` ต้องเก็บเป็นความลับสูงสุดที่ Server เท่านั้น ห้ามเปิดเผยหรือใช้งานใน Client Component

## 📂 Project Structure

โครงสร้างปัจจุบันของระบบ:

```text
cmtc-ai-system/
├── src/
│   ├── app/                 # Next.js App Router (Pages & API Routes)
│   │   ├── admin/           # Admin Dashboard & Article Management
│   │   ├── api/             # API Endpoints (Chat, Search, AI, Export, Webhooks)
│   │   └── articles/        # Public Knowledge Base Viewer
│   ├── components/          # React Components (UI, Analytics, Articles, Shared)
│   ├── features/            # Feature modules (AI, Automation, Chat)
│   ├── lib/                 # Library configurations (Supabase Client/Server)
│   └── utils/               # Utility functions
├── supabase/
│   └── migrations/          # PostgreSQL Database Schema & Migration files
├── docs/                    # Documentation files
└── public/                  # Static assets
```

## 🛠️ Installation

1. Clone repository:
```bash
git clone <repository-url>
cd cmtc-ai-system
```

2. ติดตั้ง Dependencies:
```bash
npm install
```

3. คัดลอกและตั้งค่า Environment Variables:
```bash
cp .env.local.example .env.local
```
*(ตั้งค่าค่าใน `.env.local` ให้ถูกต้อง ดูรายละเอียดที่หัวข้อ Environment Variables)*

4. รัน Development Server:
```bash
npm run dev
```

## 🔑 Environment Variables

ตัวแปรที่ระบบใช้งานจริง มีดังนี้:

* `NEXT_PUBLIC_SUPABASE_URL` - URL ของ Supabase Project
* `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Key สำหรับใช้งาน Supabase ในฝั่ง Client
* `OPENAI_API_KEY` - API Key สำหรับเชื่อมต่อ OpenAI (ใช้ใน Semantic Search, Chat, Auto-categorize)
* `N8N_API_URL` - URL หลักของ n8n (ถ้ามี)
* `N8N_API_KEY` - รหัสลับสำหรับตรวจสอบ Webhook ที่ยิงมาจาก n8n
* `N8N_ARTICLE_PUBLISHED_WEBHOOK_URL` - URL Webhook ของ n8n เมื่อมีการ Publish บทความ
* `N8N_AI_PROCESSING_WEBHOOK_URL` - URL Webhook ของ n8n สำหรับส่งบทความเข้าคิวประมวลผล

## 🗺️ Roadmap

* ✅ **Milestone 1:** Foundation & Setup
* ✅ **Milestone 2:** Authentication & RBAC
* ✅ **Milestone 3:** Knowledge Base Core
* ✅ **Milestone 4:** AI Integration
* ✅ **Milestone 5:** n8n Workflow Automation (Webhooks)
* ✅ **Milestone 6:** Analytics & Reporting

## 💻 Development Commands

คำสั่งที่สามารถใช้งานได้ตาม `package.json`:

```bash
npm run dev          # รัน Development server
npm run build        # Build ระบบสำหรับ Production
npm run start        # รัน Production server หลังจาก Build แล้ว
npm run lint         # ตรวจสอบ Code Quality ด้วย ESLint
npm run lint:fix     # แก้ไขปัญหา ESLint อัตโนมัติ
npm run type-check   # ตรวจสอบ TypeScript Types
npm run format       # จัดรูปแบบโค้ดด้วย Prettier
```

## 🚀 Production Deployment

ในการ Deploy ขึ้น Production สามารถ Build ได้ด้วยคำสั่ง:

```bash
npm run build
npm run start
```

ในอนาคต หากวิทยาลัยต้องการเปลี่ยน Backend หรือย้ายฐานข้อมูลออกจาก Supabase ก็สามารถทำได้ง่าย เนื่องจากสถาปัตยกรรมมีการแยก `src/lib/supabase` ออกจาก UI Components อย่างชัดเจน

## 📄 License

Copyright © 2026 CMTC. All rights reserved.
