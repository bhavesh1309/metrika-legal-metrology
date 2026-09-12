import { NavLink } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Scale,
  UserRound,
} from "lucide-react";
 import {useAuth} from "../../context/useAuth"
const links = [
  ["Dashboard", "/business/dashboard", LayoutDashboard],
  ["My Instruments", "/business/instruments", Scale],
  ["Apply for Verification", "/business/apply", FileText],
  ["Applications", "/business/applications", BriefcaseBusiness],
  ["Certificates", "/business/certificates", ReceiptText],
  ["Notifications", "/business/notifications", Bell],
  ["Profile", "/business/profile", UserRound],
];
export default function BusinessSidebar({ open, onClose }) {
  const {logout} = useAuth();
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/40 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-66 flex-col bg-[#102b43] text-white transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 text-xl">
              ⚖️
            </div>
            <div>
              <h1 className="text-lg font-bold">Legal Metrology</h1>
              <p className="text-[10px] text-slate-300">
                Fair Measures. Trusted Transactions.
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-6">
          <div className="space-y-1">
            {links.map(([label, path, Icon]) => (
              <NavLink
                to={path}
                onClick={onClose}
                key={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive ? "bg-[#0875e1] text-white shadow-md" : "text-slate-200 hover:bg-white/10"}`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
                {label === "Notifications" && (
                  <i className="ml-auto rounded-full bg-[#ef4444] px-2 py-0.5 text-[11px] font-bold not-italic">
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
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
        <div className="m-4 rounded-lg border border-white/10 bg-white/5 p-4">
          
          <div className="flex gap-3">
            
            <CircleHelp className="mt-0.5 shrink-0" size={22} />
            <div>
              <p className="text-sm font-bold">Need Help?</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">
                Call 1800-XXX-XXXX
                <br />
                or visit our Help Center
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
