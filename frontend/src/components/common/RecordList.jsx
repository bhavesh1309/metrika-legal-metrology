import { BellRing, CalendarDays } from "lucide-react";

function details(row) {
  if (row.detail) return row.detail;
  return Object.entries(row)
    .filter(([key]) => !["id", "status", "title", "detail"].includes(key))
    .slice(0, 3)
    .map(([, value]) => value)
    .join(" · ");
}

export default function RecordList({ rows, type }) {
  if (!rows.length)
    return (
      <div className="p-12 text-center text-sm text-slate-500">
        No matching records found.
      </div>
    );
  return (
    <div className="divide-y">
      {rows.map((row) => (
        <div
          className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
          key={row.id}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f4f0] text-[#08755d]">
              {type === "alerts" ? (
                <BellRing size={19} />
              ) : (
                <CalendarDays size={19} />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {row.title ||
                  row.instrumentType ||
                  row.instrument ||
                  row.name ||
                  row.type}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{details(row)}</p>
            </div>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {row.status || "Active"}
          </span>
        </div>
      ))}
    </div>
  );
}
