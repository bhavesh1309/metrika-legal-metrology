import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Scale,
  User,
  MapPin,
  CalendarDays,
  Hash,
  Factory,
  Ruler,
  ShieldCheck,
} from "lucide-react";

import api from "../../services/api";

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status) {
  const value = String(status || "").toUpperCase();

  if (
    value === "VERIFIED" ||
    value === "ACTIVE" ||
    value === "VALID"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    value === "PENDING" ||
    value === "UNDER_VERIFICATION"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    value === "EXPIRED" ||
    value === "REJECTED" ||
    value === "FAILED"
  ) {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={16} />

        <p className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function InstrumentDetailsModal({
  instrument,
  onClose,
}) {
  if (!instrument) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="border-b border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close details"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4 pr-10">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Scale size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Instrument Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {instrument.instrument_id}
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">

          {/* REGISTRATION STATUS */}
          <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Registration Status
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                Instrument Registration
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                instrument.status
              )}`}
            >
              {formatStatus(instrument.status)}
            </span>
          </div>

          {/* VERIFICATION STATUS */}
          <div className="mb-6 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Verification Status
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                Latest Verification
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                instrument.verification_status
              )}`}
            >
              {formatStatus(
                instrument.verification_status
              )}
            </span>
          </div>

          {/* BASIC DETAILS */}
          <h3 className="mb-3 text-sm font-bold text-slate-800">
            Instrument Information
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">

            <DetailItem
              icon={Hash}
              label="Instrument ID"
              value={instrument.instrument_id}
            />

            <DetailItem
              icon={Scale}
              label="Instrument Type"
              value={instrument.instrument_type}
            />

            <DetailItem
              icon={Factory}
              label="Manufacturer"
              value={instrument.manufacturer}
            />

            <DetailItem
              icon={Hash}
              label="Model"
              value={instrument.model}
            />

            <DetailItem
              icon={Hash}
              label="Serial Number"
              value={instrument.serial_number}
            />

            <DetailItem
              icon={User}
              label="Business ID"
              value={instrument.business_id}
            />

            <DetailItem
              icon={Ruler}
              label="Capacity"
              value={
                instrument.capacity !== null &&
                instrument.capacity !== undefined
                  ? `${instrument.capacity} ${
                      instrument.capacity_unit || ""
                    }`
                  : "—"
              }
            />

            <DetailItem
              icon={Ruler}
              label="Least Count"
              value={
                instrument.least_count !== null &&
                instrument.least_count !== undefined
                  ? `${instrument.least_count} ${
                      instrument.capacity_unit || ""
                    }`
                  : "—"
              }
            />

            <DetailItem
              icon={MapPin}
              label="Location"
              value={instrument.location}
            />

            <DetailItem
              icon={CalendarDays}
              label="Last Verification"
              value={formatDate(
                instrument.last_verification_date
              )}
            />

            <DetailItem
              icon={CalendarDays}
              label="Valid Until"
              value={formatDate(
                instrument.valid_until
              )}
            />

            <DetailItem
              icon={Hash}
              label="Certificate Number"
              value={
                instrument.certificate_number
              }
            />
          </div>

          {/* VERIFICATION INFO */}
          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
            <div className="flex items-start gap-3">

              <ShieldCheck
                size={19}
                className="mt-0.5 text-indigo-600"
              />

              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Verification Information
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  This instrument is linked to its
                  latest verification certificate.
                  The verification date, validity
                  period, and certificate number are
                  shown above.
                </p>
              </div>
            </div>
          </div>

          {/* CLOSE */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AdminInstrumentsPage() {
  const [instruments, setInstruments] =
    useState([]);

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [selectedInstrument, setSelectedInstrument] =
    useState(null);

  useEffect(() => {
    async function fetchInstruments() {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get("/admin/instruments");

        setInstruments(response.data || []);
      } catch (err) {
        console.error(
          "Failed to fetch instruments:",
          err
        );

        const detail =
          err.response?.data?.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Failed to load instruments."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInstruments();
  }, []);

  const filteredInstruments = useMemo(() => {
    const search = query
      .toLowerCase()
      .trim();

    return instruments.filter((instrument) => {

      const matchesSearch =
        !search ||
        `${instrument.instrument_id}
        ${instrument.instrument_type}
        ${instrument.manufacturer || ""}
        ${instrument.model || ""}
        ${instrument.serial_number || ""}
        ${instrument.location || ""}
        ${instrument.business_id || ""}
        ${instrument.certificate_number || ""}`
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        String(
          instrument.verification_status || ""
        ).toUpperCase() === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    instruments,
    query,
    statusFilter,
  ]);

  const statusCounts = useMemo(() => {
    const counts = {
      ALL: instruments.length,
      VERIFIED: 0,
      PENDING: 0,
      EXPIRED: 0,
    };

    instruments.forEach((instrument) => {
      const status = String(
        instrument.verification_status ||
          "PENDING"
      ).toUpperCase();

      if (status === "VERIFIED") {
        counts.VERIFIED += 1;
      }

      if (status === "PENDING") {
        counts.PENDING += 1;
      }

      if (status === "EXPIRED") {
        counts.EXPIRED += 1;
      }
    });

    return counts;
  }, [instruments]);

  return (
    <>
      <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-7">

        {/* PAGE HEADER */}
        <div>
          <h1 className="text-3xl font-bold">
            Instruments
          </h1>

          <p className="mt-1 text-slate-600">
            View and manage all registered measuring
            and weighing instruments
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}
          <button
            type="button"
            onClick={() =>
              setStatusFilter("ALL")
            }
            className={`rounded-xl border bg-white p-4 text-left transition ${
              statusFilter === "ALL"
                ? "border-indigo-300 ring-2 ring-indigo-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total Instruments
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {statusCounts.ALL}
            </p>
          </button>

          {/* VERIFIED */}
          <button
            type="button"
            onClick={() =>
              setStatusFilter("VERIFIED")
            }
            className={`rounded-xl border bg-white p-4 text-left transition ${
              statusFilter === "VERIFIED"
                ? "border-emerald-300 ring-2 ring-emerald-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Verified
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {statusCounts.VERIFIED}
            </p>
          </button>

          {/* PENDING */}
          <button
            type="button"
            onClick={() =>
              setStatusFilter("PENDING")
            }
            className={`rounded-xl border bg-white p-4 text-left transition ${
              statusFilter === "PENDING"
                ? "border-amber-300 ring-2 ring-amber-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Pending
            </p>

            <p className="mt-1 text-2xl font-bold text-amber-700">
              {statusCounts.PENDING}
            </p>
          </button>

          {/* EXPIRED */}
          <button
            type="button"
            onClick={() =>
              setStatusFilter("EXPIRED")
            }
            className={`rounded-xl border bg-white p-4 text-left transition ${
              statusFilter === "EXPIRED"
                ? "border-rose-300 ring-2 ring-rose-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Expired
            </p>

            <p className="mt-1 text-2xl font-bold text-rose-700">
              {statusCounts.EXPIRED}
            </p>
          </button>

        </div>

        {/* MAIN TABLE */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white">

          {/* SEARCH + FILTER */}
          <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">

            <div className="relative max-w-md flex-1">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={19}
              />

              <input
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                placeholder="Search instrument, serial number, owner..."
                className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#6366f1]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#6366f1]"
            >
              <option value="ALL">
                All Statuses
              </option>

              <option value="VERIFIED">
                Verified
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="EXPIRED">
                Expired
              </option>
            </select>
          </div>

          {/* ERROR */}
          {error && (
            <div className="m-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">

              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>

                  <th className="p-3 pl-5">
                    #
                  </th>

                  <th className="p-3">
                    Instrument
                  </th>

                  <th className="p-3">
                    Type
                  </th>

                  <th className="p-3">
                    Business ID
                  </th>

                  <th className="p-3">
                    Serial Number
                  </th>

                  <th className="p-3">
                    Location
                  </th>

                  <th className="p-3">
                    Verification
                  </th>

                  <th className="p-3">
                    Valid Until
                  </th>

                  <th className="p-3 pr-5 text-right">
                    Details
                  </th>

                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="p-8 text-center text-sm text-slate-500"
                    >
                      Loading instruments...
                    </td>
                  </tr>

                ) : filteredInstruments.length ===
                  0 ? (

                  <tr>
                    <td
                      colSpan="9"
                      className="p-8 text-center text-sm text-slate-500"
                    >
                      No instruments found.
                    </td>
                  </tr>

                ) : (

                  filteredInstruments.map(
                    (instrument, index) => (
                      <tr
                        key={instrument.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >

                        <td className="p-3 pl-5 text-slate-500">
                          {index + 1}
                        </td>

                        <td className="p-3">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {instrument.instrument_id}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {instrument.model ||
                                "No model specified"}
                            </p>
                          </div>
                        </td>

                        <td className="max-w-[200px] p-3">
                          <span className="line-clamp-2 text-slate-700">
                            {instrument.instrument_type ||
                              "—"}
                          </span>
                        </td>

                        <td className="p-3 text-slate-600">
                          {instrument.business_id}
                        </td>

                        <td className="p-3 text-slate-600">
                          {instrument.serial_number ||
                            "—"}
                        </td>

                        <td className="max-w-[180px] truncate p-3 text-slate-600">
                          {instrument.location ||
                            "—"}
                        </td>

                        <td className="p-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                              instrument.verification_status
                            )}`}
                          >
                            {formatStatus(
                              instrument.verification_status
                            )}
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap text-slate-600">
                          {formatDate(
                            instrument.valid_until
                          )}
                        </td>

                        <td className="p-3 pr-5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedInstrument(
                                instrument
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            Details
                          </button>
                        </td>

                      </tr>
                    )
                  )

                )}

              </tbody>

            </table>
          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing{" "}
              {filteredInstruments.length}{" "}
              of {instruments.length} instruments
            </p>
          </div>

        </section>
      </div>

      {/* DETAILS MODAL */}
      <InstrumentDetailsModal
        instrument={selectedInstrument}
        onClose={() =>
          setSelectedInstrument(null)
        }
      />
    </>
  );
}