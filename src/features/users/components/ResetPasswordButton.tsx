"use client";

import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import { useTransition } from "react";

interface ResetPasswordButtonProps {
  userId: string;
  userName: string;
  resetAction: (userId: string) => Promise<{ error: string | null }>;
}

export function ResetPasswordButton({ userId, userName, resetAction }: ResetPasswordButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    const confirmed = window.confirm(
      `ยืนยันการรีเซตรหัสผ่านของ "${userName}" เป็น 123456 หรือไม่?`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await resetAction(userId);
      if (result?.error) {
        alert(`เกิดข้อผิดพลาด: ${result.error}`);
      } else {
        alert(`รีเซตรหัสผ่านของ "${userName}" เป็น 123456 สำเร็จแล้ว`);
      }
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleReset}
      disabled={isPending}
      className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700"
    >
      <KeyRound className="h-3.5 w-3.5 mr-1" />
      {isPending ? "กำลังรีเซต..." : "รีเซตรหัสผ่าน"}
    </Button>
  );
}
