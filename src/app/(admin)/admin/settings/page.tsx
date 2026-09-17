import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import {
  Bot,
  BrainCircuit,
  Database,
  FileText,
  KeyRound,
  LockKeyhole,
  Save,
  SlidersHorizontal,
  TestTube2,
  Webhook,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/server'

const aiAgents = [
  { id: 'knowledge_qa', name: 'Knowledge QA', task: 'ตอบคำถามจากฐานความรู้' },
  { id: 'document_summarizer', name: 'Document Summarizer', task: 'สรุปและประมวลผลเอกสาร' },
  { id: 'facebook_reply', name: 'Facebook Reply', task: 'ช่วยร่างคำตอบ Facebook' },
  { id: 'content_classifier', name: 'Content Classifier', task: 'จัดหมวดหมู่บทความ' },
]

const modelOptions = [
  'gpt-4o-mini',
  'gpt-4.1-mini',
  'gpt-4.1',
  'n8n-default-agent',
]

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const n8nStatus = {
    apiKey: Boolean(process.env.N8N_API_KEY),
    articleWebhook: Boolean(process.env.N8N_ARTICLE_PUBLISHED_WEBHOOK_URL),
    processingWebhook: Boolean(process.env.N8N_AI_PROCESSING_WEBHOOK_URL),
    facebookTokenWebhook: Boolean(process.env.N8N_FACEBOOK_TOKEN_UPDATE_WEBHOOK_URL),
  }

  const configuredCount = Object.values(n8nStatus).filter(Boolean).length

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border/80 bg-card/80 p-6 shadow-[0_18px_70px_-55px_color-mix(in_oklch,var(--foreground),transparent_10%)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">System control panel</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.01em]">ตั้งค่าระบบ</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              จัดการการเชื่อมต่อ n8n, Facebook token, AI agent, model และนโยบายการทำงานหลักของ CMTC AI
            </p>
          </div>
          <StatusPill
            icon={<Webhook className="size-4" />}
            label={`n8n configured ${configuredCount}/4`}
            active={configuredCount >= 3}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewCard title="n8n API key" active={n8nStatus.apiKey} />
        <OverviewCard title="AI processing webhook" active={n8nStatus.processingWebhook} />
        <OverviewCard title="Article publish webhook" active={n8nStatus.articleWebhook} />
        <OverviewCard title="Facebook token webhook" active={n8nStatus.facebookTokenWebhook} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="size-5 text-primary" />
                  Facebook Integration
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  ใช้สำหรับส่ง access token ใหม่ไปให้ n8n workflow ที่ดูแล Facebook automation
                </p>
              </div>
              <StatusPill label={n8nStatus.facebookTokenWebhook ? 'พร้อมเชื่อมต่อ' : 'ยังไม่ตั้ง webhook'} active={n8nStatus.facebookTokenWebhook} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook-token">Facebook access token ใหม่</Label>
                <Textarea
                  id="facebook-token"
                  name="facebookToken"
                  placeholder="วาง token ใหม่ที่นี่ แล้วให้ backend ส่งต่อไปยัง n8n"
                  className="min-h-28 bg-background/70"
                />
                <p className="text-xs text-muted-foreground">
                  ตัวอย่าง flow ที่เหมาะสม: เว็บเรา → API ฝั่ง server → n8n webhook → update credential หรือ variable ใน n8n
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebook-page-id">Facebook page ID</Label>
                  <Input id="facebook-page-id" placeholder="เช่น 1234567890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-expire">วันหมดอายุโดยประมาณ</Label>
                  <Input id="token-expire" type="date" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button">
                  <Save className="size-4" />
                  อัปเดต token ใน n8n
                </Button>
                <Button type="button" variant="outline">
                  <TestTube2 className="size-4" />
                  ทดสอบการเชื่อมต่อ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="size-5 text-primary" />
              AI Agent Defaults
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              เลือก agent และ model เริ่มต้นที่เว็บจะส่งไปให้ n8n เมื่อต้องประมวลผลงาน AI
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <SelectField label="Agent หลักสำหรับแชต" defaultValue="knowledge_qa" options={aiAgents.map((agent) => ({ value: agent.id, label: agent.name }))} />
                <SelectField label="Model หลัก" defaultValue="gpt-4o-mini" options={modelOptions.map((model) => ({ value: model, label: model }))} />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <NumberField label="Temperature" defaultValue="0.30" step="0.05" min="0" max="2" />
                <NumberField label="Max tokens" defaultValue="1200" step="100" min="100" max="8000" />
                <NumberField label="Confidence ขั้นต่ำ" defaultValue="0.70" step="0.05" min="0" max="1" />
              </div>
              <Textarea
                defaultValue="You are a helpful AI assistant for Chiang Mai Technical College. Answer in Thai, be concise, and cite internal knowledge when available."
                className="min-h-28 bg-background/70"
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button">
                  <Save className="size-4" />
                  บันทึกค่า AI
                </Button>
                <Button type="button" variant="outline">
                  <Bot className="size-4" />
                  ทดสอบ agent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SettingsPanel
          icon={<Database className="size-5 text-primary" />}
          title="Knowledge Policy"
          description="กำหนดวิธีใช้ฐานความรู้และเอกสารเป็น context ให้ AI"
        >
          <SelectField
            label="แหล่งข้อมูลที่ AI ใช้ตอบ"
            defaultValue="knowledge_documents"
            options={[
              { value: 'knowledge_documents', label: 'บทความและเอกสาร' },
              { value: 'knowledge', label: 'บทความเท่านั้น' },
              { value: 'documents', label: 'เอกสารเท่านั้น' },
            ]}
          />
          <NumberField label="จำนวนรายการอ้างอิงสูงสุด" defaultValue="8" min="1" max="20" />
          <SettingToggle title="เปิด cache คำตอบ" description="ใช้คำตอบเดิมเมื่อคำถามคล้ายกันเพื่อลดเวลาและค่าใช้จ่าย" checked />
          <SettingToggle title="ส่งรายการ confidence ต่ำเข้าหน้าประวัติ" description="ช่วยให้แอดมินตรวจคุณภาพความรู้ย้อนหลังได้" checked />
        </SettingsPanel>

        <SettingsPanel
          icon={<FileText className="size-5 text-primary" />}
          title="Document Processing"
          description="ตั้งค่างานอัปโหลดและประมวลผลเอกสารผ่าน n8n"
        >
          <InputRow label="ชนิดไฟล์ที่อนุญาต" value="pdf, docx, txt, md" />
          <NumberField label="ขนาดไฟล์สูงสุด (MB)" defaultValue="25" min="1" max="200" />
          <SettingToggle title="ประมวลผลอัตโนมัติหลังอัปโหลด" description="ส่งเอกสารเข้า n8n ทันทีเมื่ออัปโหลดสำเร็จ" checked />
          <SettingToggle title="แจ้งเตือนเมื่อประมวลผลล้มเหลว" description="สร้างรายการตรวจสอบเมื่อ workflow ส่ง error กลับมา" checked />
        </SettingsPanel>

        <SettingsPanel
          icon={<LockKeyhole className="size-5 text-primary" />}
          title="Security & Logging"
          description="กำหนดการสมัครใช้งาน บทบาทเริ่มต้น และการเก็บประวัติ"
        >
          <SelectField
            label="บทบาทเริ่มต้นของผู้ใช้ใหม่"
            defaultValue="Staff"
            options={[
              { value: 'Staff', label: 'Staff' },
              { value: 'Teacher', label: 'Teacher' },
              { value: 'Department Admin', label: 'Department Admin' },
            ]}
          />
          <NumberField label="เก็บประวัติการใช้งาน (วัน)" defaultValue="180" min="30" max="730" />
          <SettingToggle title="ต้องอนุมัติบัญชีก่อนใช้งาน" description="ผู้ใช้ใหม่ต้องผ่านการตรวจจากผู้ดูแลระบบ" checked />
          <SettingToggle title="บันทึก analytics ของ AI" description="เก็บคำถาม คำตอบ เวลา และ confidence ใน ai_analytics" checked />
        </SettingsPanel>
      </section>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-5 text-primary" />
            Agent Routing Map
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            ตารางนี้คือ mapping ที่เว็บควรส่งเป็น payload ไปให้ n8n เพื่อเลือก workflow/agent ตามประเภทงาน
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {aiAgents.map((agent) => (
              <div key={agent.id} className="rounded-lg border border-border bg-background/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{agent.name}</div>
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    active
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{agent.task}</p>
                <code className="mt-4 block rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{agent.id}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function OverviewCard({ title, active }: { title: string; active: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{active ? 'พร้อมใช้งาน' : 'รอการตั้งค่า'}</div>
        </div>
        <StatusPill label={active ? 'Ready' : 'Missing'} active={active} />
      </CardContent>
    </Card>
  )
}

function SettingsPanel({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

function StatusPill({ icon, label, active }: { icon?: ReactNode; label: string; active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        active
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
      }
    >
      {icon}
      {label}
    </Badge>
  )
}

function SelectField({
  label,
  defaultValue,
  options,
}: {
  label: string
  defaultValue: string
  options: Array<{ value: string; label: string }>
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select
        defaultValue={defaultValue}
        className="h-9 w-full rounded-lg border border-input bg-background/70 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function NumberField({
  label,
  defaultValue,
  min,
  max,
  step,
}: {
  label: string
  defaultValue: string
  min?: string
  max?: string
  step?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="number" defaultValue={defaultValue} min={min} max={max} step={step} />
    </div>
  )
}

function InputRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input defaultValue={value} />
    </div>
  )
}

function SettingToggle({ title, description, checked }: { title: string; description: string; checked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background/55 p-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <div
        role="switch"
        aria-checked={checked}
        className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        }`}
      >
        <span className={`block size-5 rounded-full bg-background shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  )
}
