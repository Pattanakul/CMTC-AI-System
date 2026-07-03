const fs = require('fs');
const path = require('path');

const files = {
  "src/app/login/page.tsx": `"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginCredentials } from "@/features/users/schemas";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">CMTC AI KMS Login</h1>
        {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </div>
    </div>
  );
}
`,
  "src/app/(admin)/users/page.tsx": `import { userService } from "@/features/users/services/user.service";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function UsersPage() {
  const users = await userService.getUsers();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Link href="/users/create">
          <Button>Create User</Button>
        </Link>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user: any) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={\`/users/\${user.id}/edit\`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                  <Link href={\`/users/\${user.id}\`} className="text-blue-600 hover:text-blue-900">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join('D:/CMTC/CMTC-AI-System', filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created: ' + filePath);
}
