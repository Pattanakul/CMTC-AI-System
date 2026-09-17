'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/auth/actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BrainCircuit, Database, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined)
  return (
    <main className="grid min-h-screen w-full bg-background lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:block">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--sidebar-primary)_22%,transparent),transparent_34%),radial-gradient(circle_at_78%_18%,color-mix(in_oklch,var(--accent)_22%,transparent),transparent_24rem)]" />
        <div className="relative flex min-h-screen flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg border border-sidebar-primary/35 bg-sidebar-primary/15 text-sidebar-primary">
              <BrainCircuit className="size-6" />
            </div>
            <div>
              <p className="text-sm text-sidebar-foreground/60">Chiang Mai Technical College</p>
              <h1 className="text-xl font-semibold">CMTC AI Knowledge System</h1>
            </div>
          </div>

          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-sidebar-border bg-sidebar-accent/70 px-3 py-1 text-sm text-sidebar-foreground/75">
              AI-assisted knowledge operations
            </p>
            <h2 className="text-5xl font-semibold leading-[1.08] tracking-[-0.01em]">
              คลังความรู้กลางสำหรับการทำงานที่ตอบได้ไวกว่าเดิม
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-sidebar-foreground/68">
              จัดการบทความ เอกสาร และสิทธิ์การเข้าถึงในหน้าจอเดียว พร้อมโครงสร้างที่พร้อมต่อการค้นหาด้วย AI
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Database, label: 'Knowledge base', value: 'จัดข้อมูลเป็นระบบ' },
              { icon: ShieldCheck, label: 'Access control', value: 'แยกสิทธิ์ตามบทบาท' },
              { icon: BrainCircuit, label: 'AI search', value: 'ตอบคำถามจากเอกสาร' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-sidebar-border bg-sidebar-accent/55 p-4">
                <item.icon className="mb-4 size-5 text-sidebar-primary" />
                <div className="text-sm font-medium">{item.label}</div>
                <div className="mt-1 text-xs text-sidebar-foreground/55">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BrainCircuit className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CMTC AI</p>
              <p className="font-semibold">Knowledge System</p>
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold">เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            เข้าใช้งานระบบจัดการความรู้และผู้ช่วยตอบคำถามอัตโนมัติของวิทยาลัย
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            {state?.error && (
              <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@cmtc.ac.th"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center space-y-2">
          <div className="text-sm text-muted-foreground">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              สมัครใช้งาน
            </Link>
          </div>
        </CardFooter>
      </Card>
      </section>
    </main>
  )
}
