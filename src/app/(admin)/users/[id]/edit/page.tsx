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
    router.push("/users");
  };

  if (!user) return <div>Loading...</div>;


  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit User: {user.fullName}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input {...register("fullName")} defaultValue={user.fullName} />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
        </div>
        <div>
          <Label>Department</Label>
          <Select defaultValue={user.department} onValueChange={(v) => setValue("department", v || "")}>
            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Role</Label>
          <Select defaultValue={user.role} onValueChange={(v) => setValue("role", v as "USER" | "ADMIN" | "DEPARTMENT_ADMIN" | "SUPER_ADMIN")}>
            <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="DEPARTMENT_ADMIN">Department Admin</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select defaultValue={user.status} onValueChange={(v) => setValue("status", v as "ACTIVE" | "INACTIVE")}>
            <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Update User</Button>
      </form>
    </div>
  );
}
