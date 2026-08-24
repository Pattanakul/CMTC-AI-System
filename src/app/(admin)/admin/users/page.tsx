import { userService } from "@/features/users/services/user.service";
import Link from "next/link";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/utils/supabase/admin";
import { deleteUserAction } from "@/features/users/actions/deleteUserAction";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  let mergedUsers: any[] = [];
  
  try {
    const adminSupabase = createAdminClient();
    
    // Fetch users from auth.users to get emails and metadata
    const { data: authData, error: authError } = await adminSupabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    // Fetch profiles from public.profiles
    const { data: profiles, error: profileError } = await adminSupabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (profileError) throw profileError;
    
    // Merge data based on id
    mergedUsers = authData.users.map((u: any) => {
      const p = profiles?.find((prof: any) => prof.id === u.id) || {};
      
      // Determine the best name to show
      let name = "ไม่มีชื่อ";
      if (p.full_name) name = p.full_name;
      else if (p.first_name) name = `${p.first_name} ${p.last_name || ''}`.trim();
      else if (u.user_metadata?.full_name) name = u.user_metadata.full_name;
      
      return {
        id: u.id,
        email: u.email,
        full_name: name,
        role: p.role || 'User',
        status: p.status || 'ACTIVE'
      };
    });
    
    // Sort merged users to roughly match profile creation date order
    mergedUsers.sort((a, b) => {
      const profileA = profiles?.find((prof: any) => prof.id === a.id);
      const profileB = profiles?.find((prof: any) => prof.id === b.id);
      const dateA = profileA?.created_at ? new Date(profileA.created_at).getTime() : 0;
      const dateB = profileB?.created_at ? new Date(profileB.created_at).getTime() : 0;
      return dateB - dateA;
    });
    
  } catch (error) {
    console.error("Error fetching users:", error);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">จัดการผู้ใช้งาน</h1>
        <Link href="/admin/users/create">
          <Button>เพิ่มผู้ใช้งาน</Button>
        </Link>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
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
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/admin/users/${user.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">แก้ไข</Link>
                  <form action={deleteUserAction.bind(null, user.id) as unknown as (payload: FormData) => void} className="inline-block">
                    <Button type="submit" variant="destructive" size="sm">ลบ</Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
