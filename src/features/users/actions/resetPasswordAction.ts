"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const DEFAULT_PASSWORD = "123456";

export async function resetPasswordAction(userId: string) {
  // 1. ตรวจสอบสิทธิ์ผู้ดำเนินการ (เฉพาะ Admin)
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
    return { error: "คุณไม่มีสิทธิ์รีเซตรหัสผ่าน" };
  }

  try {
    // 2. รีเซตรหัสผ่านเป็นค่าเริ่มต้น
    const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
      password: DEFAULT_PASSWORD,
    });
    if (error) throw error;

    revalidatePath("/admin/users");
    return { error: null };
  } catch (err: any) {
    console.error("Reset password error:", err);
    return { error: `ไม่สามารถรีเซตรหัสผ่านได้: ${err.message || "Unknown error"}` };
  }
}
