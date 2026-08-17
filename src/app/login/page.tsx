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
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    setError(null);
    console.log("Submitting login data:", {
      email: data.email,
      // ไม่ควรล็อกรหัสผ่าน
    });
    
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (authError) {
      setError(authError.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <img src="/logo.svg" alt="Logo" className="w-16 h-16 mb-4 text-primary" />
          <CardTitle className="text-2xl font-bold">เข้าสู่ระบบ</CardTitle>
          <CardDescription>กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบ CMTC AI</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="text-destructive text-sm text-center mb-4 p-2 bg-destructive/10 rounded">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input id="email" type="email" placeholder="name@company.com" {...register("email")} />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ยังไม่มีบัญชีใช่ไหม?{" "}
              <Link href="/register" className="text-primary hover:underline">สมัครสมาชิก</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
