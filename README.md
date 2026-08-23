# CMTC AI Knowledge Management System

<div align="center">
  <h3>🧠 ระบบจัดการความรู้อัจฉริยะสำหรับองค์กร</h3>
  <p>ขับเคลื่อนด้วย AI เพื่อการค้นหาและแชร์ความรู้ที่มีประสิทธิภาพสูงสุด</p>

  ![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
  ![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?logo=supabase)
</div>

---

## 📋 คำอธิบายโครงการ

CMTC AI Knowledge Management System (CMTC AI KMS) คือแพลตฟอร์มจัดการความรู้องค์กรที่ใช้ AI ในการค้นหา จัดหมวดหมู่ และแนะนำเนื้อหาความรู้ให้กับผู้ใช้อย่างชาญฉลาด สร้างด้วย Next.js 15, React 19, TypeScript และ Supabase

## 🚀 Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15 (App Router) | Full-stack Framework |
| React | 19 | UI Library |
| TypeScript | 5 | Type Safety |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | Latest | UI Components |
| Supabase | Latest | Backend & Auth |
| PostgreSQL | 15+ | Database |
| n8n | Latest | Workflow Automation |
| ESLint | Latest | Code Quality |
| Prettier | Latest | Code Formatting |

## 📁 โครงสร้างโฟลเดอร์

```
cmtc-ai-system/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components (navbar, sidebar)
│   │   └── shared/             # Shared/reusable components
│   ├── features/               # Feature-based modules
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Library configurations
│   │   └── supabase/           # Supabase clients
│   ├── services/               # API service layer
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   ├── middleware/             # Middleware helpers
│   └── styles/                 # Additional styles
├── database/                   # Database scripts & migrations
├── docs/                       # Project documentation
├── n8n/                        # n8n workflow definitions
├── scripts/                    # Utility scripts
├── supabase/                   # Supabase config & migrations
├── public/                     # Static assets
├── .env.local.example          # Environment variables template
├── .gitignore                  # Git ignore rules
├── .prettierrc                 # Prettier configuration
├── components.json             # shadcn/ui configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## ⚙️ การติดตั้ง (Installation)

### 1. Clone Repository
```bash
git clone <repository-url>
cd cmtc-ai-system
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
```bash
cp .env.local.example .env.local
```
แก้ไขค่าใน `.env.local` ให้ถูกต้อง:
- `NEXT_PUBLIC_SUPABASE_URL` — URL ของ Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anonymous key จาก Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (เก็บเป็นความลับ)

### 4. ตั้งค่า Supabase
1. สร้าง project บน [supabase.com](https://supabase.com)
2. รัน migration scripts ใน `supabase/` folder
3. ตั้งค่า Row Level Security (RLS) policies

## 🛠️ การพัฒนา (Development)

```bash
# รัน development server
npm run dev

# รัน type checking
npm run type-check

# รัน ESLint
npm run lint

# รัน Prettier
npm run format
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## 📦 การ Build (Production)

```bash
# Build สำหรับ production
npm run build

# รัน production server
npm run start
```

## 🗺️ Roadmap — Milestones

### ✅ Milestone 1 — Project Foundation (ปัจจุบัน)
- [x] ติดตั้ง Next.js 15 + React 19 + TypeScript
- [x] ตั้งค่า Tailwind CSS + shadcn/ui
- [x] เชื่อมต่อ Supabase (client + server + middleware)
- [x] สร้างโครงสร้างโฟลเดอร์ enterprise
- [x] ตั้งค่า ESLint + Prettier
- [x] สร้าง Landing Page
- [x] Initialize Git

### 🔲 Milestone 2 — Authentication & User Management
- [x] ระบบ Login/Register ด้วย Supabase Auth
- [x] User Profile Management
- [x] Role-Based Access Control (RBAC)
- [x] Protected Routes & Middleware

### 🔲 Milestone 3 — Knowledge Base Core
- [x] CRUD Knowledge Articles
- [x] Rich Text Editor (Tiptap/Quill)
- [x] Category & Tag Management
- [x] File Upload & Media Management

### 🔲 Milestone 4 — AI Integration
- [x] AI-powered Semantic Search
- [x] Auto-categorization with LLM
- [x] AI Chat Assistant
- [x] Content Recommendations

### 🔲 Milestone 5 — n8n Workflow Automation
- [ ] Automated content processing
- [ ] Notification workflows
- [ ] Data sync pipelines
- [ ] AI processing queues

### 🔲 Milestone 6 — Analytics & Reporting
- [ ] Usage Analytics Dashboard
- [ ] Knowledge Gap Analysis
- [ ] User Engagement Metrics
- [ ] Export Reports

## 📄 License

Copyright © 2026 CMTC. All rights reserved.
