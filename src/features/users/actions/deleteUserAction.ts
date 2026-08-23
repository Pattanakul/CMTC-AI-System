"use server";

import { createClient } from "@/utils/supabase/server";
import { userService } from "../services/user.service";
import { revalidatePath } from "next/cache";

export async function deleteUserAction(id: string) {
  const supabase = await createClient();
  try {
    await userService.deleteUser(id, supabase);
    revalidatePath("/admin/users");
    return { error: null };
  } catch (err) {
    return { error: "ไม่สามารถลบผู้ใช้งานได้" };
  }
}
