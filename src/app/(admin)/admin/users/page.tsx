import { userService } from "@/features/users/services/user.service";
import Link from "next/link";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { deleteUserAction } from "@/features/users/actions/deleteUserAction";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const supabase = await createClient();
  const users = await userService.getUsers(supabase);

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
            {users?.map((user: User) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/admin/users/${user.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">แก้ไข</Link>
                  <form action={deleteUserAction.bind(null, user.id)}>
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
