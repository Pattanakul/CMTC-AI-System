"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateUserSchema, type UpdateUser, type User } from "@/features/users/schemas";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, use } from "react";
import { departmentService } from "@/features/departments/services";
import { userService } from "@/features/users/services/user.service";
import { createClient } from "@/utils/supabase/client";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    userService.getUserById(id, supabase).then(setUser).catch(console.error);
    departmentService.getDepartments().then(setDepartments).catch(console.error);
  }, [id]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UpdateUser>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: user || {}
  });

  const onSubmit = async (data: UpdateUser) => {
    if (!id) return;
    const supabase = createClient();
    await userService.updateUser(id, data, supabase);
    router.push("/admin/users");
  };

  if (!user) return <div>กำลังโหลด...</div>;


  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">แก้ไขผู้ใช้งาน: {user.fullName}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>ชื่อ-นามสกุล</Label>
          <Input {...register("fullName")} defaultValue={user.fullName} />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
        </div>
        <div>
          <Label>แผนก</Label>
          <Select defaultValue={user.department} onValueChange={(v) => setValue("department", v || "")}>
            <SelectTrigger><SelectValue placeholder="เลือกแผนก" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>บทบาท</Label>
          <Select defaultValue={user.role} onValueChange={(v) => setValue("role", v as "SUPER_ADMIN" | "STAFF")}>
            <SelectTrigger><SelectValue placeholder="เลือกบทบาท" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="STAFF">บุคลากร</SelectItem>
              <SelectItem value="SUPER_ADMIN">ผู้ดูแลระบบสูงสุด</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>สถานะ</Label>
          <Select defaultValue={user.status} onValueChange={(v) => setValue("status", v as "ACTIVE" | "INACTIVE")}>
            <SelectTrigger><SelectValue placeholder="เลือกสถานะ" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">ใช้งาน</SelectItem>
              <SelectItem value="INACTIVE">ไม่ใช้งาน</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">บันทึกการแก้ไข</Button>
      </form>
    </div>
  );
}
