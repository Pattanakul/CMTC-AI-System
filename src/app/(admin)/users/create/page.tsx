"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserSchema, type CreateUser } from "@/features/users/schemas";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { departmentService } from "@/features/departments/services";
import { userService } from "@/features/users/services/user.service";
import { createClient } from "@/utils/supabase/client";

export default function CreateUserPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    departmentService.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateUser>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: { status: "ACTIVE", role: "DEPARTMENT_ADMIN", department: "" }
  });

  const onSubmit = async (data: CreateUser) => {
    const supabase = createClient();
    await userService.createUser(data, supabase);
    router.push("/users");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create User</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input {...register("fullName")} />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message as string}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <Input {...register("email")} />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message as string}</p>}
        </div>
        <div>
          <Label>Department</Label>
          <Select onValueChange={(v) => setValue("department", v as string)}>
            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.department && <p className="text-red-500 text-sm">{errors.department.message as string}</p>}
        </div>
        <div>
          <Label>Role</Label>
          <Select onValueChange={(v) => setValue("role", v as "SUPER_ADMIN" | "DEPARTMENT_ADMIN")}>
            <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              <SelectItem value="DEPARTMENT_ADMIN">Department Admin</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="text-red-500 text-sm">{errors.role.message as string}</p>}
        </div>
        <Button type="submit">Create User</Button>
      </form>
    </div>
  );
}
