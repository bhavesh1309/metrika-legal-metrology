import { useState } from "react";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { Outlet } from "react-router-dom";

import BusinessSidebar from "./BusinessSidebar";
import { useAuth } from "../../context/useAuth";

export default function BusinessLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const displayName = user?.name || "Business Owner";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <BusinessSidebar
        open={open}
        onClose={() => setOpen(false)}
      />

      <main className="min-h-screen lg:pl-66">
        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-7">
          <div className="flex flex-1 items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="relative hidden max-w-[490px] flex-1 sm:block">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={19}
              />

              <input
                placeholder="Search instruments, certificate ID, or serial number..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#0875e1]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-slate-700">
              <Bell size={22} />

              <i className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white not-italic">
                3
              </i>
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#163f69] text-sm font-bold text-white">
                {initials || "BO"}
              </div>

              <div className="hidden text-left md:block">
                <p className="text-sm font-bold">
                  {displayName}
                </p>

                <p className="text-xs text-slate-500">
                  Business Owner
                </p>
              </div>

              <ChevronDown
                className="hidden md:block"
                size={18}
              />
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}