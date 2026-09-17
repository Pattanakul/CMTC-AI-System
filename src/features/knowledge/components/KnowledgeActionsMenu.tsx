"use client"

import { useRouter } from "next/navigation"
import { MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type KnowledgeActionsMenuProps = {
  articleId: string
  basePath: string
}

export function KnowledgeActionsMenu({
  articleId,
  basePath,
}: KnowledgeActionsMenuProps) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">เปิดเมนู</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`${basePath}/${articleId}/edit`)}>
          แก้ไข
        </DropdownMenuItem>
        <DropdownMenuItem>ลบข้อมูล</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
