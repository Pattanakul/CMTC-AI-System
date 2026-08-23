"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { CreateUser } from "@/features/users/schemas";
import { revalidatePath } from "next/cache";

export async function createUserAction(data: CreateUser & { password: string }) {
  const supabase = await createClient();

  // 1. ตรวจสอบสิทธิ์ผู้สร้าง (เฉพาะ Super Admin หรือ Admin)
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) {
    return { error: "กรุณาเข้าสู่ระบบ" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (!profile || !["SUPER_ADMIN", "Super Admin"].includes(profile.role || "")) {
    return { error: "คุณไม่มีสิทธิ์สร้างบุคลากร" };
  }

  // 2. สร้าง User ใน Auth (ใช้ Admin Client เพื่อให้มีสิทธิ์ในการสร้าง User)
  let adminSupabase;
  try {
    adminSupabase = createAdminClient();
  } catch (err: any) {
    return { error: "กรุณาตั้งค่า SUPABASE_SERVICE_ROLE_KEY ในไฟล์ .env.local ก่อนสร้างบัญชี" };
  }

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.fullName,
      phone: data.phone,
    }
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { error: "อีเมลนี้มีบัญชีผู้ใช้งานอยู่แล้ว" };
    }
    return { error: `ไม่สามารถสร้างบัญชีผู้ใช้งานได้: ${authError.message}` };
  }

  // 3. อัปเดต Profile ในตาราง public.profiles
  const updateData: any = {
    role: data.role,
    status: data.status,
    department_id: data.department || null,
    full_name: data.fullName,
    phone: data.phone,
    email: data.email
  };

  let profileError = null;
  
  // ลองอัปเดตข้อมูลทั้งหมดก่อน (เผื่อมีการรันไมเกรชันเพิ่มคอลัมน์ full_name, phone, email ใน profiles แล้ว)
  const { error: firstTryError } = await adminSupabase
    .from("profiles")
    .update(updateData)
    .eq("id", authData.user.id);

  if (firstTryError) {
    console.warn("First try update failed, trying fallback columns:", firstTryError.message);
    // หากล้มเหลว (เช่น คอลัมน์ไม่มีอยู่จริง) ให้ลองอัปเดตเฉพาะคอลัมน์มาตรฐาน
    const { error: secondTryError } = await adminSupabase
      .from("profiles")
      .update({
        role: data.role,
        status: data.status,
        department_id: data.department || null,
      })
      .eq("id", authData.user.id);
      
    profileError = secondTryError;
  }

  if (profileError) {
    // กรณีบันทึกโปรไฟล์ล้มเหลว ให้ลบบัญชีผู้ใช้งานที่สร้างใน Auth ออกเพื่อความถูกต้อง (Rollback)
    await adminSupabase.auth.admin.deleteUser(authData.user.id);
    return { error: `ไม่สามารถบันทึกข้อมูลบุคลากรได้: ${profileError.message}` };
  }

  revalidatePath("/admin/users");
  return { data: authData.user, error: null };
}
