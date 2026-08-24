"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteUserAction(id: string) {
  // 1. ตรวจสอบสิทธิ์ผู้ลบ (เฉพาะ Admin)
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) {
    return { error: "กรุณาเข้าสู่ระบบ" };
  }

  let adminSupabase;
  try {
    adminSupabase = createAdminClient();
  } catch {
    return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
  }

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (!profile || !["Super Admin", "Admin"].includes(profile.role || "")) {
    return { error: "คุณไม่มีสิทธิ์ลบผู้ใช้งาน" };
  }

  // 2. ป้องกันไม่ให้ลบตัวเอง
  if (id === currentUser.id) {
    return { error: "ไม่สามารถลบบัญชีของตัวเองได้" };
  }

  try {
    // 3. ลบ user จาก auth.users (จะ cascade ลบ profiles ด้วยเพราะ ON DELETE CASCADE)
    const { error } = await adminSupabase.auth.admin.deleteUser(id);
    if (error) throw error;

    revalidatePath("/admin/users");
    return { error: null };
  } catch (err: any) {
    console.error("Delete user error:", err);
    return { error: `ไม่สามารถลบผู้ใช้งานได้: ${err.message || "Unknown error"}` };
  }
}

