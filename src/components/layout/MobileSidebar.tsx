'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export function MobileSidebar() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-transparent hover:bg-muted rounded-md p-2 md:hidden" aria-label="เปิดเมนู">
          <Menu className="size-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="p-0 w-64 h-full max-w-none" showCloseButton={false}>
        <Sidebar />
      </DialogContent>
    </Dialog>
  );
}
