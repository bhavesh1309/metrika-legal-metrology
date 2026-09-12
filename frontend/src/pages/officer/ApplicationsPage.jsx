import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ClipboardCheck,
  Award,
  X,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import ApplicationTable from "../../components/applications/ApplicationTable";
import api from "../../services/api";

const filterOptions = [
  "All",
  "Pending",
  "Scheduled",
  "Approved",
];

function matchesFilter(status, filter) {
  if (filter === "All") {
    return true;
  }

  if (filter === "Pending") {
    return [
      "SUBMITTED",
      "UNDER_REVIEW",
      "INSPECTION",
    ].includes(status);
  }

  if (filter === "Scheduled") {
    return status === "SCHEDULED";
  }

  if (filter === "Approved") {
    return [
      "PASSED",
      "CERTIFICATE_GENERATED",
    ].includes(status);
  }

  return true;
}

export default function ApplicationsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inspection modal
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [inspectionResult, setInspectionResult] = useState("PASS");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/officer/applications");

      setApplications(response.data);
    } catch (err) {
      console.error(
        "Failed to fetch officer applications:",
        err
      );

      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Failed to load applications."
      );
    } finally {
      setLoading(false);
    }
  }

  const visible = useMemo(() => {
    const search = query.toLowerCase().trim();

    return applications.filter((item) => {
      const matchesSearch =
        !search ||
        `${item.applicationNumber}
          ${item.applicant}
          ${item.owner || ""}
          ${item.instrument}
          ${item.serialNumber || ""}
          ${item.officer || ""}`
          .toLowerCase()
          .includes(search);

      return (
        matchesSearch &&
        matchesFilter(item.status, filter)
      );
    });
  }, [applications, filter, query]);

  function openInspection(application) {
    setSelectedApplication(application);
    setInspectionResult("PASS");
    setRemarks("");
    setError("");
  }

  function closeInspection() {
    if (submitting) return;

    setSelectedApplication(null);
    setRemarks("");
    setInspectionResult("PASS");
  }

  async function submitInspection() {
    if (!selectedApplication) return;

    // A failed inspection must have a rejection reason.
    if (
      inspectionResult === "FAIL" &&
      !remarks.trim()
    ) {
      alert("Please enter a reason for rejection.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // 1. Submit inspection result
      await api.post(
        `/officer/applications/${selectedApplication.id}/inspection`,
        {
          result: inspectionResult,
          remarks: remarks.trim() || null,
        }
      );

      // 2. If inspection passed, generate certificate
      if (inspectionResult === "PASS") {
        await api.post(
          `/officer/applications/${selectedApplication.id}/certificate`
        );
      }

      // 3. Refresh applications so the new status appears
      await fetchApplications();

      closeInspection();

      alert(
        inspectionResult === "PASS"
          ? "Inspection passed and certificate generated successfully."
          : "Inspection failed. The rejection reason has been recorded."
      );
    } catch (err) {
      console.error(
        "Failed to submit inspection:",
        err
      );

      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Failed to submit inspection."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1540px] px-4 py-7 sm:px-6 lg:px-8">
      <PageHeader
        title="Applications"
        description="Review and track verification requests assigned to you."
      />

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Search + filters */}
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={18}
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search application, business or instrument"
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-[#0a765f]"
            />
          </div>

          <div className="flex gap-2 overflow-auto">
            {filterOptions.map((option) => (
              <button
                onClick={() => setFilter(option)}
                key={option}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  filter === option
                    ? "bg-[#e7f4f0] text-[#08755d]"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {option}
              </button>
            ))}

            <button
              className="rounded-lg border border-slate-200 p-2 text-slate-500"
              title="Filters"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Loading / table */}
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading applications...
          </div>
        ) : visible.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {applications.length === 0
              ? "No applications have been assigned to you yet."
              : "No applications match your search or filter."}
          </div>
        ) : (
          <ApplicationTable
            applications={visible}
            onInspect={openInspection}
          />
        )}

        {!loading && applications.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            Showing {visible.length} of {applications.length} applications
          </div>
        )}
      </section>

      {/* Inspection Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Conduct Inspection
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedApplication.applicationNumber}
                </p>
              </div>

              <button
                onClick={closeInspection}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Application summary */}
            <div className="grid grid-cols-2 gap-3 px-6 pt-5">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400">
                  Business
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedApplication.applicant}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400">
                  Instrument
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedApplication.instrument}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400">
                  Serial Number
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedApplication.serialNumber || "N/A"}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400">
                  Location
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedApplication.location}
                </p>
              </div>
            </div>

            {/* Inspection form */}
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Inspection Result
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setInspectionResult("PASS")
                    }
                    className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
                      inspectionResult === "PASS"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    ✓ Pass
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setInspectionResult("FAIL")
                    }
                    className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
                      inspectionResult === "FAIL"
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    ✕ Fail
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Remarks
                  {inspectionResult === "FAIL" && (
                    <span className="ml-1 text-rose-600">
                      *
                    </span>
                  )}
                </label>

                <textarea
                  value={remarks}
                  onChange={(event) =>
                    setRemarks(event.target.value)
                  }
                  rows={4}
                  placeholder={
                    inspectionResult === "FAIL"
                      ? "Enter the reason for rejection..."
                      : "Enter inspection observations or remarks..."
                  }
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0a765f]"
                />

                {inspectionResult === "FAIL" && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    A rejection reason is required for a failed inspection.
                  </p>
                )}
              </div>

              {inspectionResult === "PASS" && (
                <div className="rounded-lg bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                  Passing the inspection will automatically generate
                  the verification certificate.
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={closeInspection}
                disabled={submitting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitInspection}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-[#08755d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#075f4d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {inspectionResult === "PASS" ? (
                  <>
                    <Award size={17} />
                    {submitting
                      ? "Processing..."
                      : "Pass & Generate Certificate"}
                  </>
                ) : (
                  <>
                    <ClipboardCheck size={17} />
                    {submitting
                      ? "Submitting..."
                      : "Submit Inspection"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}