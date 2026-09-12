import { useState } from "react";
import { Database, Plus } from "lucide-react";
const categories = [
  ["Weighing Instrument", 6, "Digital Scale, Platform Scale, Weighing Bridge"],
  ["Measuring Instrument", 5, "Fuel Dispenser, Water Meter, LPG Dispenser"],
  ["Standard Weight", 3, "Class F1, Class M1, Class M2"],
  ["Length Measure", 2, "Measuring Tape, Yardstick"],
];
export default function AdminMasterDataPage() {
  const [active, setActive] = useState(0);
  return (
    <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Master Data</h1>
          <p className="mt-1 text-slate-600">
            Instrument categories and types used across the portal
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#6366f1] px-5 py-3 text-sm font-semibold text-white">
          <Plus size={18} />
          Add Category
        </button>
      </div>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {categories.map((c, i) => (
          <button
            key={c[0]}
            onClick={() => setActive(i)}
            className={`rounded-xl border p-5 text-left ${active === i ? "border-[#6366f1] bg-[#eef2ff]" : "border-slate-200 bg-white"}`}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef2ff] text-[#6366f1]">
                <Database size={21} />
              </span>
              <div>
                <b>{c[0]}</b>
                <p className="text-xs text-slate-500">{c[1]} types</p>
              </div>  
            </div>
            <p className="mt-3 text-sm text-slate-600">{c[2]}</p>
          </button>
        ))}
      </section>
    </div>
  );
}
