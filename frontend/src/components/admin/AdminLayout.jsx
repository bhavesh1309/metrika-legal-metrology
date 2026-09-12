import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../context/useAuth";
export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-7">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 lg:hidden"
          >
            <Menu size={21} />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1b4b] text-sm font-bold text-white">
              AV
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-bold">{user?.name || "Amit Verma"}</p>
              <p className="text-xs text-slate-500">System Administrator</p>
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
