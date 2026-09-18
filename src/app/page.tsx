"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginCredentials } from "@/features/users/schemas";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Database, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    setError(null);
    const supabase = createClient();

    const { error: authError, data: authData } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : authError.message);
      return;
    }

    if (!authData.user) {
        setError('ไม่พบข้อมูลผู้ใช้งานในระบบ');
        return;
    }

    // Check user role from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      setError('บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบ');
      return;
    }

    const role = profile.role;

    if (role === 'SUPER_ADMIN' || role === 'Super Admin' || role === 'Admin') {
      router.push("/admin/dashboard");
    } else if (role === 'STAFF' || role === 'Staff' || role === 'USER' || role === 'Department Admin' || role === 'Teacher') {
      router.push("/staff/dashboard");
    } else {
      setError('บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบ');
    }
  };

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
              ค้นหา จัดการ และส่งต่อความรู้ของวิทยาลัยจากศูนย์กลางเดียว
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-sidebar-foreground/68">
              ระบบนี้ออกแบบให้ทีมงานจัดการบทความ เอกสาร และสิทธิ์การใช้งานได้รวดเร็ว พร้อมข้อมูลที่พร้อมต่อการค้นหาด้วย AI
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Database, label: "Knowledge base", value: "จัดข้อมูลเป็นระบบ" },
              { icon: ShieldCheck, label: "Access control", value: "แยกสิทธิ์ตามบทบาท" },
              { icon: BrainCircuit, label: "AI search", value: "ตอบคำถามจากเอกสาร" },
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
            ใช้อีเมลของคุณเพื่อเข้าใช้งานระบบจัดการความรู้และผู้ช่วยตอบคำถามอัตโนมัติ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="name@cmtc.ac.th" {...register("email")} />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}        
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </section>
    </main>
  );
}
