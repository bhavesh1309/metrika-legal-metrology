import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";

const labels = {
  dashboard: "Dashboard",
  applications: "Applications",
  schedule: "Verification Schedule",
  inspections: "Inspections",
  certificates: "Certificates",
  instruments: "Instruments",
  alerts: "Alerts & Reminders",
  reports: "Reports",
  users: "Users",
  "master-data": "Master Data",
  settings: "Settings",
};

function getInitials(name) {
  if (!name) return "LM";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(false);
  const [profile, setProfile] = useState(null);

  const { user } = useAuth();

  const location = useLocation();
  const key = location.pathname.split("/")[1];

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("/auth/me");
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to load officer profile:", err);
      }
    }

    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const displayName = profile?.full_name || "Legal Metrology Officer";

  const roleLabel =
    profile?.role === "GATC"
      ? "GATC Officer"
      : profile?.role === "LMO"
        ? "Legal Metrology Officer"
        : "Officer";

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <Sidebar isOpen={open} setIsOpen={setOpen} />

      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu size={21} />
            </button>

            <p className="text-sm text-slate-400">
              Portal /{" "}
              <span className="text-slate-600">
                {labels[key] || "Portal"}
              </span>
            </p>
          </div>

          <div className="relative flex items-center gap-3">
            <button
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              onClick={() => setNotes(!notes)}
            >
              <Bell size={20} />

              <i className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-rose-500" />
            </button>

            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7eef8] text-xs font-bold text-[#153b6f]">
                {getInitials(displayName)}
              </div>

              <div className="hidden text-left md:block">
                <p className="text-xs font-bold text-slate-700">
                  {displayName}
                </p>

                <p className="text-[10px] text-slate-400">
                  {roleLabel}
                </p>
              </div>
            </div>

            {notes && (
              <div className="absolute right-0 top-12 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <p className="font-bold">
                  Notifications
                </p>

                <p className="mt-3 border-t pt-3 text-sm text-slate-600">
                  Check your assigned applications and
                  inspection schedule for pending work.
                </p>
              </div>
            )}
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}