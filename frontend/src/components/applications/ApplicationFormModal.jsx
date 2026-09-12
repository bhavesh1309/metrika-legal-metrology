import { useState } from "react";

export default function ApplicationFormModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    applicant: "",
    instrument: "",
    serial: "",
  });
  function submit(event) {
    event.preventDefault();
    onCreate(form);
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-xl font-bold">New verification application</h2>
        <div className="mt-5 grid gap-4">
          {[
            ["applicant", "Business / applicant name"],
            ["instrument", "Instrument type"],
            ["serial", "Serial number"],
          ].map(([key, placeholder]) => (
            <input
              key={key}
              required
              placeholder={placeholder}
              value={form[key]}
              onChange={(event) =>
                setForm({ ...form, [key]: event.target.value })
              }
              className="rounded-lg border border-slate-200 p-2.5 outline-none focus:border-[#0a765f]"
            />
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
          <button className="rounded-lg bg-[#0a5b4a] px-4 py-2 text-sm font-semibold text-white">
            Save application
          </button>
        </div>
      </form>
    </div>
  );
}
