import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { deleteUserAction } from "@/features/users/actions/deleteUserAction";
import { resetPasswordAction } from "@/features/users/actions/resetPasswordAction";
import { ResetPasswordButton } from "@/features/users/components/ResetPasswordButton";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  status?: string | null;
  department_id?: string | null;
  departments?:
    | { name?: string | null; code?: string | null }
    | Array<{ name?: string | null; code?: string | null }>
    | null;
  created_at?: string | null;
};

type DisplayUser = {
  id: string;
  email: string;
  full_name: string;
  department: string;
  role: string;
  status: string;
};

function getDepartmentLabel(profile: Partial<ProfileRow>) {
  const department = Array.isArray(profile.departments)
    ? profile.departments[0]
    : profile.departments;

  if (department?.name && department?.code) return `${department.name} (${department.code})`;
  if (department?.name) return department.name;
  if (department?.code) return department.code;
  return "ไม่ระบุแผนก";
}

export default async function UsersPage() {
  let mergedUsers: DisplayUser[] = [];
  let loadWarning: string | null = null;
  
  try {
    const adminSupabase = createAdminClient();
    
    // Fetch users from auth.users to get emails and metadata
    const { data: authData, error: authError } = await adminSupabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    // Fetch profiles from public.profiles
    const { data: profiles, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*, departments:department_id(name, code)')
      .order('created_at', { ascending: false });
    if (profileError) throw profileError;
    
    // Merge data based on id
    mergedUsers = authData.users.map((u) => {
      const p: Partial<ProfileRow> = (profiles as ProfileRow[] | null)?.find((prof) => prof.id === u.id) || {};
      
      // Determine the best name to show
      let name = "ไม่มีชื่อ";
      if (p.full_name) name = p.full_name;
      else if (p.first_name) name = `${p.first_name} ${p.last_name || ''}`.trim();
      else if (u.user_metadata?.full_name) name = u.user_metadata.full_name;
      
      return {
        id: u.id,
        email: u.email || "ไม่พบอีเมล",
        full_name: name,
        department: getDepartmentLabel(p),
        role: p.role || 'User',
        status: p.status || 'ACTIVE'
      };
    });
    
    // Sort merged users to roughly match profile creation date order
    mergedUsers.sort((a, b) => {
      const profileA = (profiles as ProfileRow[] | null)?.find((prof) => prof.id === a.id);
      const profileB = (profiles as ProfileRow[] | null)?.find((prof) => prof.id === b.id);
      const dateA = profileA?.created_at ? new Date(profileA.created_at).getTime() : 0;
      const dateB = profileB?.created_at ? new Date(profileB.created_at).getTime() : 0;
      return dateB - dateA;
    });
    
  } catch (error) {
    console.error("Error fetching users:", error);
    loadWarning = "ไม่สามารถดึงรายชื่อจาก Supabase Auth ได้ ระบบจะแสดงข้อมูลจากตารางโปรไฟล์แทน กรุณาตรวจสอบ SUPABASE_SERVICE_ROLE_KEY บน Vercel";

    try {
      const supabase = await createClient();
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*, departments:department_id(name, code)")
        .order("created_at", { ascending: false });

      if (profileError) throw profileError;

      mergedUsers = ((profiles || []) as ProfileRow[]).map((profile) => {
        const fullName =
          profile.full_name ||
          [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() ||
          "ไม่มีชื่อ";

        return {
          id: profile.id,
          email: profile.email || "ไม่พบอีเมลในโปรไฟล์",
          full_name: fullName,
          department: getDepartmentLabel(profile),
          role: profile.role || "User",
          status: profile.status || "ACTIVE",
        };
      });
    } catch (fallbackError) {
      console.error("Error fetching profile fallback:", fallbackError);
      loadWarning = "ไม่สามารถดึงรายชื่อผู้ใช้งานได้ กรุณาตรวจสอบสิทธิ์ RLS และค่า Supabase บน Vercel";
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">จัดการผู้ใช้งาน</h1>
        <Link href="/admin/users/create">
          <Button>เพิ่มผู้ใช้งาน</Button>
        </Link>
      </div>
      {loadWarning && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadWarning}
        </div>
      )}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">แผนก</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">บทบาท</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mergedUsers?.map((user: any) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.department}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/users/${user.id}/edit`} className="text-indigo-600 hover:text-indigo-900">แก้ไข</Link>
                    <ResetPasswordButton
                      userId={user.id}
                      userName={user.full_name}
                      resetAction={resetPasswordAction}
                    />
                    <form action={deleteUserAction.bind(null, user.id) as unknown as (payload: FormData) => void} className="inline-block">
                      <Button type="submit" variant="destructive" size="sm">ลบ</Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
