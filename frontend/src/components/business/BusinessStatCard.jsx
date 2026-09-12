import { ArrowRight } from "lucide-react";
export default function BusinessStatCard({
  icon: Icon,
  tone,
  value,
  label,
  to,
}) {
  return (
    <div className={`rounded-lg border p-5 ${tone}`}>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/50">
          <Icon size={27} />
        </div>
        <div>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm">{label}</p>
        </div>
      </div>
      <button
        onClick={to}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#0875e1]"
      >
        View all <ArrowRight size={15} />
      </button>
    </div>
  );
}
