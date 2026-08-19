import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <ShieldAlert className="h-20 w-20 text-red-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">403 - เข้าถึงข้อมูลไม่ได้</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ หากคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
      </p>
      <Link href="/">
        <Button>กลับสู่หน้าหลัก</Button>
      </Link>
    </div>
  );
}
