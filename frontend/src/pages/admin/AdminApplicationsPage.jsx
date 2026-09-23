import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  ClipboardList,
  User,
  Mail,
  Scale,
  Hash,
  CalendarDays,
  Clock,
  MapPin,
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  UserCheck,
  RefreshCw,
  Loader2,
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

function formatTime(time) {
  if (!time) {
    return "—";
  }

  const value = String(time);
  const parts = value.split(":");

  if (parts.length < 2) {
    return value;
  }

  const hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) {
    return value;
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusStyle(status) {
  const value = String(status || "").toUpperCase();

  if (
    value === "CERTIFICATE_GENERATED" ||
    value === "COMPLETED" ||
    value === "APPROVED" ||
    value === "PASS"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    value === "SUBMITTED" ||
    value === "PENDING" ||
    value === "UNDER_REVIEW"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    value === "SCHEDULED" ||
    value === "INSPECTION"
  ) {
    return "bg-indigo-50 text-indigo-700";
  }

  if (
    value === "FAILED" ||
    value === "REJECTED" ||
    value === "CANCELLED"
  ) {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getInspectionStyle(result) {
  const value = String(result || "").toUpperCase();

  if (value === "PASS") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (value === "FAIL") {
    return "bg-rose-50 text-rose-700";
  }

  if (value === "SCHEDULED") {
    return "bg-indigo-50 text-indigo-700";
  }

  return "bg-slate-100 text-slate-600";
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

/* -------------------------------------------------------
   ASSIGNMENT MODAL
------------------------------------------------------- */

function AssignmentModal({
  application,
  onClose,
  onAssigned,
}) {
  const [recommendations, setRecommendations] =
    useState([]);

  const [selectedOfficer, setSelectedOfficer] =
    useState(null);

  const [scheduledDate, setScheduledDate] =
    useState(
      application?.scheduled_date ||
        application?.preferred_date ||
        ""
    );

  const [scheduledTime, setScheduledTime] =
    useState(
      application?.scheduled_time ||
        application?.preferred_time ||
        ""
    );

  const [loading, setLoading] =
    useState(true);

  const [assigning, setAssigning] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRecommendations() {
      if (!application) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/admin/applications/${application.id}/recommendations`
        );

        setRecommendations(
          response.data || []
        );
      } catch (err) {
        console.error(
          "Failed to fetch officer recommendations:",
          err
        );

        const detail =
          err.response?.data?.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Failed to load officer recommendations."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [application]);

  if (!application) {
    return null;
  }

  const applicationStatus = String(
    application.status || ""
  ).toUpperCase();

  const isReassigning =
    Boolean(application.assigned_officer_id);

  async function handleAssign() {
    if (!selectedOfficer) {
      setError("Please select an officer.");
      return;
    }

    if (!scheduledDate) {
      setError("Please select a scheduled date.");
      return;
    }

    if (!scheduledTime) {
      setError("Please select a scheduled time.");
      return;
    }

    try {
      setAssigning(true);
      setError("");

      await api.post(
        `/admin/applications/${application.id}/assign`,
        {
          officer_id: selectedOfficer.officer_id,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
        }
      );

      onAssigned();
    } catch (err) {
      console.error(
        "Failed to assign application:",
        err
      );

      const detail =
        err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Failed to assign application."
      );
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        <div className="border-b border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4 pr-10">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              {isReassigning ? (
                <RefreshCw size={23} />
              ) : (
                <UserCheck size={23} />
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isReassigning
                  ? "Reassign Application"
                  : "Assign Application"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {application.application_number}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">

          {/* Application summary */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Instrument
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {application.instrument_code ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Location
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {application.location ||
                    "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Recommended Officers
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Select an officer for this field
                  verification.
                </p>
              </div>

              {recommendations.length > 0 && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {recommendations.length} available
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center rounded-xl border border-slate-200 p-8">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Loading recommendations...
                </div>
              </div>
            ) : recommendations.length ===
              0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                No officer recommendations are
                currently available.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map(
                  (officer) => {
                    const selected =
                      selectedOfficer?.officer_id ===
                      officer.officer_id;

                    return (
                      <button
                        key={
                          officer.officer_id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedOfficer(
                            officer
                          )
                        }
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100"
                            : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">

                          <div className="flex min-w-0 items-start gap-3">
                            <div
                              className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                                selected
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <User size={19} />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">
                                {
                                  officer.officer_name
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {officer.designation ||
                                  officer.officer_type ||
                                  "Officer"}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {officer.district && (
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                                    {
                                      officer.district
                                    }
                                  </span>
                                )}

                                {officer.specialization && (
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                                    {
                                      officer.specialization
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-[10px] uppercase tracking-wide text-slate-400">
                              Workload
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-700">
                              {
                                officer.current_workload ??
                                0
                              }
                            </p>

                            {selected && (
                              <span className="mt-2 inline-block rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                                Selected
                              </span>
                            )}
                          </div>

                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Schedule */}

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold text-slate-800">
              Schedule
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Scheduled Date
                </label>

                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) =>
                    setScheduledDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Scheduled Time
                </label>

                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) =>
                    setScheduledTime(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Actions */}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={assigning}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAssign}
              disabled={
                assigning ||
                loading ||
                !selectedOfficer ||
                !scheduledDate ||
                !scheduledTime
              }
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {assigning && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {assigning
                ? "Saving..."
                : isReassigning
                  ? "Reassign Application"
                  : "Assign Application"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   APPLICATION DETAILS MODAL
------------------------------------------------------- */

function ApplicationDetailsModal({
  application,
  onClose,
  onAssign,
}) {
  if (!application) {
    return null;
  }

  const applicationStatus = String(
    application.status || ""
  ).toUpperCase();

  const isCompleted =
    applicationStatus ===
      "CERTIFICATE_GENERATED" ||
    applicationStatus === "COMPLETED" ||
    applicationStatus === "APPROVED";

  const canAssign =
    !isCompleted;

  let inspectionDisplay = "Not Completed";
  let inspectionSubtitle =
    "No field inspection completed yet";
  let inspectionResult = null;

  if (applicationStatus === "SCHEDULED") {
    inspectionDisplay = "Scheduled";

    inspectionSubtitle =
      application.scheduled_date
        ? `Inspection scheduled for ${formatDate(
            application.scheduled_date
          )}${
            application.scheduled_time
              ? ` at ${formatTime(
                  application.scheduled_time
                )}`
              : ""
          }`
        : "Inspection has been scheduled";

    inspectionResult = "SCHEDULED";
  } else if (
    applicationStatus ===
      "CERTIFICATE_GENERATED" ||
    applicationStatus === "COMPLETED" ||
    applicationStatus === "APPROVED"
  ) {
    if (application.inspection_result) {
      inspectionDisplay = formatStatus(
        application.inspection_result
      );

      inspectionSubtitle =
        "Latest field inspection";

      inspectionResult =
        application.inspection_result;
    } else {
      inspectionDisplay = "Completed";
      inspectionSubtitle =
        "Inspection completed successfully";
      inspectionResult = "PASS";
    }
  } else if (
    applicationStatus === "FAILED" ||
    applicationStatus === "REJECTED"
  ) {
    if (application.inspection_result) {
      inspectionDisplay = formatStatus(
        application.inspection_result
      );

      inspectionSubtitle =
        "Latest field inspection";

      inspectionResult =
        application.inspection_result;
    } else {
      inspectionDisplay = "Failed";
      inspectionSubtitle =
        "Verification failed";
      inspectionResult = "FAIL";
    }
  } else if (application.inspection_result) {
    inspectionDisplay = formatStatus(
      application.inspection_result
    );

    inspectionSubtitle =
      "Latest field inspection";

    inspectionResult =
      application.inspection_result;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        <div className="border-b border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4 pr-10">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <ClipboardList size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Application Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {application.application_number}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">

          {/* Current Status */}

          <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Current Status
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                Application Processing Status
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                application.status
              )}`}
            >
              {formatStatus(
                application.status
              )}
            </span>
          </div>

          {/* Application Information */}

          <h3 className="mb-3 text-sm font-bold text-slate-800">
            Application Information
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={Hash}
              label="Application Number"
              value={
                application.application_number
              }
            />

            <DetailItem
              icon={ClipboardList}
              label="Application Type"
              value={formatStatus(
                application.application_type
              )}
            />

            <DetailItem
              icon={CalendarDays}
              label="Submitted On"
              value={formatDate(
                application.submitted_at
              )}
            />

            <DetailItem
              icon={CalendarDays}
              label="Preferred Date"
              value={formatDate(
                application.preferred_date
              )}
            />

            <DetailItem
              icon={Clock}
              label="Preferred Time"
              value={formatTime(
                application.preferred_time
              )}
            />

            <DetailItem
              icon={MapPin}
              label="Location"
              value={application.location}
            />
          </div>

          {/* Business Information */}

          <h3 className="mb-3 mt-6 text-sm font-bold text-slate-800">
            Business Information
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={User}
              label="Business Name"
              value={
                application.business_name
              }
            />

            <DetailItem
              icon={Mail}
              label="Business Email"
              value={
                application.business_email
              }
            />

            <DetailItem
              icon={Hash}
              label="Business ID"
              value={
                application.business_id
              }
            />
          </div>

          {/* Instrument Information */}

          <h3 className="mb-3 mt-6 text-sm font-bold text-slate-800">
            Instrument Information
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={Scale}
              label="Instrument ID"
              value={
                application.instrument_code
              }
            />

            <DetailItem
              icon={Scale}
              label="Instrument Type"
              value={
                application.instrument_type
              }
            />

            <DetailItem
              icon={Hash}
              label="Serial Number"
              value={
                application.serial_number
              }
            />

            <DetailItem
              icon={Hash}
              label="Database Instrument ID"
              value={
                application.instrument_id
              }
            />
          </div>

          {/* Assignment & Schedule */}

          <div className="mb-3 mt-6 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800">
              Assignment & Schedule
            </h3>

            {canAssign && (
              <button
                type="button"
                onClick={() =>
                  onAssign(application)
                }
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                {application.assigned_officer_id ? (
                  <>
                    <RefreshCw size={15} />
                    Reassign Application
                  </>
                ) : (
                  <>
                    <UserCheck size={15} />
                    Assign Application
                  </>
                )}
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={User}
              label="Assigned Officer"
              value={
                application.assigned_officer_name
              }
            />

            <DetailItem
              icon={Hash}
              label="Officer ID"
              value={
                application.assigned_officer_id
              }
            />

            <DetailItem
              icon={CalendarDays}
              label="Scheduled Date"
              value={formatDate(
                application.scheduled_date
              )}
            />

            <DetailItem
              icon={Clock}
              label="Scheduled Time"
              value={formatTime(
                application.scheduled_time
              )}
            />
          </div>

          {/* Inspection */}

          <h3 className="mb-3 mt-6 text-sm font-bold text-slate-800">
            Inspection
          </h3>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Inspection Result
                  </p>

                  <p className="text-xs text-slate-500">
                    {inspectionSubtitle}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getInspectionStyle(
                  inspectionResult
                )}`}
              >
                {inspectionDisplay}
              </span>
            </div>

            {application.rejection_reason && (
              <div className="mt-4 rounded-lg bg-rose-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={17}
                    className="mt-0.5 text-rose-600"
                  />

                  <div>
                    <p className="text-xs font-bold text-rose-700">
                      Rejection Reason
                    </p>

                    <p className="mt-1 text-sm text-rose-700">
                      {
                        application.rejection_reason
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Certificate */}

          <h3 className="mb-3 mt-6 text-sm font-bold text-slate-800">
            Certificate
          </h3>

          <div className="rounded-xl border border-slate-200 p-4">
            {application.certificate_number ? (
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FileCheck2 size={19} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Certificate Number
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {
                      application.certificate_number
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-500">
                  <FileCheck2 size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    No certificate issued
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    A certificate will appear here
                    after a successful inspection.
                  </p>
                </div>
              </div>
            )}
          </div>

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

/* -------------------------------------------------------
   MAIN PAGE
------------------------------------------------------- */

export default function AdminApplicationsPage() {
  const [applications, setApplications] =
    useState([]);

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [assignmentApplication, setAssignmentApplication] =
    useState(null);

  async function fetchApplications() {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/admin/applications");

      setApplications(
        response.data || []
      );
    } catch (err) {
      console.error(
        "Failed to fetch applications:",
        err
      );

      const detail =
        err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Failed to load applications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  const statusCounts = useMemo(() => {
    const counts = {
      ALL: applications.length,
      SCHEDULED: 0,
      COMPLETED: 0,
      FAILED: 0,
    };

    applications.forEach((application) => {
      const status = String(
        application.status || ""
      ).toUpperCase();

      if (status === "SCHEDULED") {
        counts.SCHEDULED += 1;
      }

      if (
        status === "CERTIFICATE_GENERATED" ||
        status === "COMPLETED" ||
        status === "APPROVED"
      ) {
        counts.COMPLETED += 1;
      }

      if (
        status === "FAILED" ||
        status === "REJECTED"
      ) {
        counts.FAILED += 1;
      }
    });

    return counts;
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const search = query
      .toLowerCase()
      .trim();

    return applications.filter(
      (application) => {
        const matchesSearch =
          !search ||
          `${application.application_number}
          ${application.business_name || ""}
          ${application.business_email || ""}
          ${application.instrument_code || ""}
          ${application.instrument_type || ""}
          ${application.serial_number || ""}
          ${application.assigned_officer_name || ""}
          ${application.location || ""}`
            .toLowerCase()
            .includes(search);

        const status =
          String(
            application.status || ""
          ).toUpperCase();

        let matchesStatus = true;

        if (statusFilter !== "ALL") {
          if (
            statusFilter === "COMPLETED"
          ) {
            matchesStatus =
              status ===
                "CERTIFICATE_GENERATED" ||
              status === "COMPLETED" ||
              status === "APPROVED";
          } else if (
            statusFilter === "FAILED"
          ) {
            matchesStatus =
              status === "FAILED" ||
              status === "REJECTED";
          } else {
            matchesStatus =
              status === statusFilter;
          }
        }

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    applications,
    query,
    statusFilter,
  ]);

  function handleAssignmentComplete() {
    setAssignmentApplication(null);
    setSelectedApplication(null);
    fetchApplications();
  }

  return (
    <>
      <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-7">

        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold">
            Applications
          </h1>

          <p className="mt-1 text-slate-600">
            View and manage all verification
            applications submitted to the portal
          </p>
        </div>

        {/* Summary Cards */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total */}

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
              Total
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {statusCounts.ALL}
            </p>
          </button>

          {/* Scheduled */}

          <button
            type="button"
            onClick={() =>
              setStatusFilter("SCHEDULED")
            }
            className={`rounded-xl border bg-white p-4 text-left transition ${
              statusFilter === "SCHEDULED"
                ? "border-indigo-300 ring-2 ring-indigo-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Scheduled
            </p>

            <p className="mt-1 text-2xl font-bold text-indigo-700">
              {statusCounts.SCHEDULED}
            </p>
          </button>

          {/* Completed */}

          <button
            type="button"
            onClick={() =>
              setStatusFilter("COMPLETED")
            }
            className={`rounded-xl border bg-white p-4 text-left transition ${
              statusFilter === "COMPLETED"
                ? "border-emerald-300 ring-2 ring-emerald-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Completed
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {statusCounts.COMPLETED}
            </p>
          </button>

          {/* Failed */}

          <button
            type="button"
            onClick={() =>
              setStatusFilter("FAILED")
            }
            className={`rounded-xl border bg-white p-4 text-left transition ${
              statusFilter === "FAILED"
                ? "border-rose-300 ring-2 ring-rose-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Failed / Rejected
            </p>

            <p className="mt-1 text-2xl font-bold text-rose-700">
              {statusCounts.FAILED}
            </p>
          </button>

        </div>

        {/* Table */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white">

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
                placeholder="Search application, business, instrument..."
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

              <option value="SCHEDULED">
                Scheduled
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="FAILED">
                Failed / Rejected
              </option>
            </select>
          </div>

          {error && (
            <div className="m-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left text-sm">

              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="p-3 pl-5">
                    #
                  </th>

                  <th className="p-3">
                    Application
                  </th>

                  <th className="p-3">
                    Business
                  </th>

                  <th className="p-3">
                    Instrument
                  </th>

                  <th className="p-3">
                    Type
                  </th>

                  <th className="p-3">
                    Officer
                  </th>

                  <th className="p-3">
                    Status
                  </th>

                  <th className="p-3">
                    Submitted
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
                      Loading applications...
                    </td>
                  </tr>
                ) : filteredApplications.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="p-8 text-center text-sm text-slate-500"
                    >
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map(
                    (application, index) => (
                      <tr
                        key={application.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >

                        <td className="p-3 pl-5 text-slate-500">
                          {index + 1}
                        </td>

                        <td className="p-3">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {
                                application.application_number
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatStatus(
                                application.application_type
                              )}
                            </p>
                          </div>
                        </td>

                        <td className="max-w-[180px] p-3">
                          <p className="truncate font-medium text-slate-700">
                            {application.business_name ||
                              "—"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {application.business_email ||
                              `Business #${application.business_id}`}
                          </p>
                        </td>

                        <td className="max-w-[190px] p-3">
                          <p className="font-medium text-slate-700">
                            {application.instrument_code ||
                              "—"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {application.instrument_type ||
                              "Instrument"}
                          </p>
                        </td>

                        <td className="max-w-[150px] p-3">
                          <span className="line-clamp-2 text-slate-600">
                            {formatStatus(
                              application.application_type
                            )}
                          </span>
                        </td>

                        <td className="p-3">
                          {application.assigned_officer_name ? (
                            <div>
                              <p className="font-medium text-slate-700">
                                {
                                  application.assigned_officer_name
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                Officer
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400">
                              Not assigned
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                              application.status
                            )}`}
                          >
                            {formatStatus(
                              application.status
                            )}
                          </span>
                        </td>

                        <td className="whitespace-nowrap p-3 text-slate-600">
                          {formatDate(
                            application.submitted_at
                          )}
                        </td>

                        <td className="p-3 pr-5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedApplication(
                                application
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

          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing{" "}
              {filteredApplications.length}{" "}
              of {applications.length} applications
            </p>
          </div>

        </section>
      </div>

      {/* Details Modal */}

      <ApplicationDetailsModal
        application={selectedApplication}
        onClose={() =>
          setSelectedApplication(null)
        }
        onAssign={(application) => {
          setAssignmentApplication(
            application
          );
        }}
      />

      {/* Assignment Modal */}

      <AssignmentModal
        application={assignmentApplication}
        onClose={() =>
          setAssignmentApplication(null)
        }
        onAssigned={
          handleAssignmentComplete
        }
      />
    </>
  );
}