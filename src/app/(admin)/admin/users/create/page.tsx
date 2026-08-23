"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react";
import { createUserAction } from "@/features/users/actions/createUserAction";
import { CreateUserSchema, type CreateUser } from "@/features/users/schemas";
import { departmentService } from "@/features/departments/services";
import { z } from "zod";

const FormSchema = CreateUserSchema.extend({
  password: z.string().min(6, "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"),
});

type FormValues = z.infer<typeof FormSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    departmentService.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      status: "ACTIVE",
      role: "STAFF",
      fullName: "",
      email: "",
      phone: "",
      department: "",
      password: "123456",
    }
  });

  const status = watch("status");

  const generatePassword = () => {
    setValue("password", "123456");
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const result = await createUserAction(data);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("เพิ่มบุคลากรเรียบร้อยแล้ว");
      router.push("/admin/users");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="text-sm text-muted-foreground">แดชบอร์ด &gt; จัดการบุคลากร &gt; เพิ่มบุคลากร</div>
      <h1 className="text-3xl font-bold">เพิ่มบุคลากร</h1>
      <p className="text-muted-foreground">สร้างบัญชีผู้ใช้งานสำหรับครูและบุคลากรของวิทยาลัย</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ข้อมูลส่วนบุคคล */}
        <Card>
          <CardHeader><CardTitle>ข้อมูลส่วนบุคคล</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>ชื่อ-นามสกุล <span className="text-red-500">*</span></Label>
              <Input {...register("fullName")} placeholder="ชื่อ-นามสกุล" />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label>อีเมล <span className="text-red-500">*</span></Label>
              <Input {...register("email")} placeholder="example@cmtc.ac.th" />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
              <Label>เบอร์โทรศัพท์</Label>
              <Input {...register("phone")} placeholder="0xxxxxxxxx" />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* ข้อมูลการปฏิบัติงาน */}
        <Card>
          <CardHeader><CardTitle>ข้อมูลการปฏิบัติงาน</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>แผนก <span className="text-red-500">*</span></Label>
              <Select onValueChange={(v) => setValue("department", v as string)}>
                <SelectTrigger><SelectValue placeholder="เลือกแผนก" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-red-500 text-sm">{errors.department.message}</p>}
            </div>
            <div>
              <Label>สิทธิ์การใช้งาน <span className="text-red-500">*</span></Label>
              <Select onValueChange={(v) => setValue("role", v as any)} defaultValue="STAFF">
                <SelectTrigger><SelectValue placeholder="เลือกสิทธิ์การใช้งาน" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF">บุคลากร</SelectItem>
                  <SelectItem value="SUPER_ADMIN">ผู้ดูแลระบบสูงสุด (Super Admin)</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={status === "ACTIVE"} onCheckedChange={(v: boolean) => setValue("status", v ? "ACTIVE" : "INACTIVE")} />
              <Label>{status === "ACTIVE" ? "บัญชีนี้สามารถเข้าสู่ระบบได้" : "บัญชีนี้จะไม่สามารถเข้าสู่ระบบได้"}</Label>
            </div>
          </CardContent>
        </Card>

        {/* ข้อมูลบัญชี */}
        <Card>
          <CardHeader><CardTitle>ข้อมูลบัญชี</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>รหัสผ่านชั่วคราว <span className="text-red-500">*</span></Label>
                <Input type={showPassword ? "text" : "password"} {...register("password")} />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>
              <Button type="button" variant="outline" className="mt-7" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</Button>
              <Button type="button" variant="secondary" className="mt-7" onClick={generatePassword}><RefreshCw /> รีเซ็ตรหัสผ่านเริ่มต้น</Button>
            </div>
            <Alert>
              <AlertTitle>ข้อมูลสำคัญ</AlertTitle>
              <AlertDescription>
                บัญชีผู้ใช้งานนี้ถูกสร้างโดยผู้ดูแลระบบ บุคลากรไม่สามารถสมัครบัญชีด้วยตนเองได้<br/>
                โปรดส่งข้อมูลการเข้าสู่ระบบให้บุคลากรผ่านช่องทางที่เหมาะสม
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>ยกเลิก</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="animate-spin" /> กำลังเพิ่มบุคลากร...</> : "เพิ่มบุคลากร"}</Button>
        </div>
      </form>
    </div>
  );
}
