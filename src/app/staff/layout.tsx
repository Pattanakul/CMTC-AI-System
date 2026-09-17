import { Sidebar } from "@/components/layout/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <aside className="hidden h-full w-64 border-r border-sidebar-border bg-sidebar md:block">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        {/* Header for Mobile */}
        <header className="flex items-center border-b border-border/80 bg-card/90 p-4 backdrop-blur md:hidden">
          <Sheet>
            <SheetTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <span className="ml-4 font-semibold">CMTC AI - Staff</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
