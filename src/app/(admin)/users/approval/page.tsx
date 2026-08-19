import { userService } from '@/features/users/services/user.service';
import { createClient } from '@/utils/supabase/server';
import { Button } from "@/components/ui/button";

export default async function UserApprovalPage() {
  const supabase = await createClient();
  const users = await userService.getUsers(supabase);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Approval</h1>
      <div className="border rounded-lg p-4">
        {users?.map((user: any) => (
          <div key={user.id} className="flex justify-between items-center p-2 border-b">
            <span>{user.full_name} ({user.email})</span>
            <Button>Approve</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
