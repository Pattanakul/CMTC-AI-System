import { Sidebar } from "@/components/layout/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:block w-64 h-full border-r">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header for Mobile */}
        <header className="md:hidden flex items-center p-4 border-b">
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center rounded-lg h-8 w-8 hover:bg-muted focus:outline-none">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <span className="ml-4 font-bold">CMTC AI - Staff</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
