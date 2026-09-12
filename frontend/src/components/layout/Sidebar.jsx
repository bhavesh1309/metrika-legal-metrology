import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  ClipboardCheck,
  Award,
  Scale,
  Bell,
  BarChart3,
  Users,
  Database,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
const items = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Applications", "/applications", FileText],
  ["Verification Schedule", "/schedule", CalendarDays],
  ["Inspections", "/inspections", ClipboardCheck],
  ["Certificates", "/certificates", Award],
  ["Instruments", "/instruments", Scale],
  ["Alerts & Reminders", "/alerts", Bell],
  ["Reports", "/reports", BarChart3],
  ["Users", "/users", Users],
  ["Master Data", "/master-data", Database],
  ["Settings", "/settings", Settings],
];
export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout } = useAuth();
  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/40 lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-[#06234a] text-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg">
              ⚖️
            </div>
            <div>
              <h1 className="text-sm font-bold">Legal Metrology</h1>
              <p className="text-[10px] text-slate-300">
                Online Verification System
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 lg:hidden">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">
            Main menu
          </p>
          <div className="space-y-1">
            {items.map(([label, path, Icon]) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-[#16715f] text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
                {label === "Alerts & Reminders" && (
                  <i className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] not-italic">
                    3
                  </i>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="mb-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <LogOut size={17} />
            Sign out
          </button>
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-xs font-medium">
              Department of Consumer Affairs
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              Government of India
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
