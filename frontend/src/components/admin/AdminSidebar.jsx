import { NavLink } from "react-router-dom";
import { Database, LayoutDashboard, LogOut, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../../context/useAuth";
const links = [
  ["Dashboard", "/admin/dashboard", LayoutDashboard],
  ["Users", "/admin/users", Users],
  ["Master Data", "/admin/master-data", Database],
];
export default function AdminSidebar({ open, onClose }) {
  const { logout } = useAuth();
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/40 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-[#1e1b4b] text-white transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-[10px] text-slate-300">Legal Metrology Portal</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-6">
          <div className="space-y-1">
            {links.map(([label, path, Icon]) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive ? "bg-[#6366f1] text-white shadow-md" : "text-slate-200 hover:bg-white/10"}`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
