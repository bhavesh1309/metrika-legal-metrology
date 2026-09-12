import {
  Clock3,
  FileText,
  Scale,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import api from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";

const cards = [
  [Users, "bg-indigo-50 text-indigo-700", "Total Users", "totalUsers"],
  [
    Scale,
    "bg-blue-50 text-blue-700",
    "Total Instruments",
    "totalInstruments",
  ],
  [
    FileText,
    "bg-violet-50 text-violet-700",
    "Total Applications",
    "totalApplications",
  ],
  [
    UserCheck,
    "bg-emerald-50 text-emerald-700",
    "Active Officers",
    "activeOfficers",
  ],
];

function getStatusDisplay(status) {
  switch (status) {
    case "PASSED":
    case "CERTIFICATE_GENERATED":
      return {
        label:
          status === "PASSED"
            ? "Approved"
            : "Certificate Generated",
        className: "bg-emerald-50 text-emerald-700",
      };

    case "FAILED":
      return {
        label: "Rejected",
        className: "bg-rose-50 text-rose-700",
      };

    case "SUBMITTED":
      return {
        label: "Submitted",
        className: "bg-blue-50 text-blue-700",
      };

    case "UNDER_REVIEW":
      return {
        label: "Under Review",
        className: "bg-violet-50 text-violet-700",
      };

    case "SCHEDULED":
      return {
        label: "Scheduled",
        className: "bg-amber-50 text-amber-700",
      };

    case "INSPECTION":
      return {
        label: "Inspection",
        className: "bg-orange-50 text-orange-700",
      };

    case "CANCELLED":
      return {
        label: "Cancelled",
        className: "bg-slate-100 text-slate-600",
      };

    default:
      return {
        label: status || "Unknown",
        className: "bg-slate-100 text-slate-600",
      };
  }
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Assignment modal state
  const [selectedApplication, setSelectedApplication] =
    useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] =
    useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [
        usersResponse,
        instrumentsResponse,
        applicationsResponse,
      ] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/instruments"),
        api.get("/admin/applications"),
      ]);

      setUsers(usersResponse.data);
      setInstruments(instrumentsResponse.data);
      setApplications(applicationsResponse.data);
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);

      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeOfficers = useMemo(() => {
    return users.filter(
      (user) =>
        user.is_active &&
        (user.role === "LMO" || user.role === "GATC")
    );
  }, [users]);

  const approvedCount = useMemo(() => {
    return applications.filter(
      (application) =>
        application.status === "PASSED" ||
        application.status === "CERTIFICATE_GENERATED"
    ).length;
  }, [applications]);

  const rejectedCount = useMemo(() => {
    return applications.filter(
      (application) => application.status === "FAILED"
    ).length;
  }, [applications]);

  const pendingCount = useMemo(() => {
    return applications.filter((application) =>
      [
        "SUBMITTED",
        "UNDER_REVIEW",
        "SCHEDULED",
        "INSPECTION",
      ].includes(application.status)
    ).length;
  }, [applications]);

  const stats = {
    totalUsers: users.length,
    totalInstruments: instruments.length,
    totalApplications: applications.length,
    activeOfficers: activeOfficers.length,
  };

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort(
        (a, b) =>
          new Date(b.submitted_at) -
          new Date(a.submitted_at)
      )
      .slice(0, 4);
  }, [applications]);

  // -----------------------------------------
  // Open assignment modal
  // -----------------------------------------
  async function openAssignment(application) {
    try {
      setSelectedApplication(application);
      setRecommendations([]);
      setAssignmentError("");
      setLoadingRecommendations(true);

      const response = await api.get(
        `/admin/applications/${application.id}/recommendations`
      );

      setRecommendations(response.data);
    } catch (err) {
      console.error(
        "Failed to load officer recommendations:",
        err
      );

      const detail = err.response?.data?.detail;

      setAssignmentError(
        typeof detail === "string"
          ? detail
          : "Failed to load officer recommendations."
      );
    } finally {
      setLoadingRecommendations(false);
    }
  }

  // -----------------------------------------
  // Assign selected officer
  // -----------------------------------------
  async function assignOfficer(officer) {
    if (!selectedApplication) return;

    try {
      setAssigning(true);
      setAssignmentError("");

      await api.post(
        `/admin/applications/${selectedApplication.id}/assign`,
        {
          officer_id: officer.officer_id,

          // Use application's preferred date/time if available.
          scheduled_date:
            selectedApplication.preferred_date || null,

          scheduled_time:
            selectedApplication.preferred_time || null,
        }
      );

      // Close modal
      setSelectedApplication(null);
      setRecommendations([]);

      // Refresh dashboard so status changes immediately
      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to assign officer:", err);

      const detail = err.response?.data?.detail;

      setAssignmentError(
        typeof detail === "string"
          ? detail
          : "Failed to assign officer."
      );
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1540px] px-4 py-7 sm:px-6 lg:px-8">

      {/* Header */}
      <h1 className="text-2xl font-bold sm:text-3xl">
        Admin Dashboard
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        System-wide overview of the Legal Metrology Portal
      </p>

      {error && (
        <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Main statistics */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, tone, label, key]) => (
          <StatCard
            key={key}
            icon={Icon}
            tone={tone}
            label={label}
            value={loading ? "..." : stats[key]}
          />
        ))}
      </div>

      {/* Application status */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">

        {/* Approved */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <ShieldCheck size={21} />
          </span>

          <div>
            <p className="text-2xl font-bold">
              {loading ? "..." : approvedCount}
            </p>

            <p className="text-sm text-slate-500">
              Approved
            </p>
          </div>
        </div>

        {/* Rejected */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-700">
            <XCircle size={21} />
          </span>

          <div>
            <p className="text-2xl font-bold">
              {loading ? "..." : rejectedCount}
            </p>

            <p className="text-sm text-slate-500">
              Rejected
            </p>
          </div>
        </div>

        {/* Pending */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-700">
            <Clock3 size={21} />
          </span>

          <div>
            <p className="text-2xl font-bold">
              {loading ? "..." : pendingCount}
            </p>

            <p className="text-sm text-slate-500">
              Pending
            </p>
          </div>
        </div>

      </div>

      {/* Recent Applications + Active Officers */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_.8fr]">

        {/* Recent Applications */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b p-5">
            <h2 className="font-bold">
              Recent Applications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest verification requests across all districts
            </p>
          </div>

          <div className="divide-y">

            {loading ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Loading applications...
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No applications found.
              </div>
            ) : (
              recentApplications.map((application) => {
                const status = getStatusDisplay(
                  application.status
                );

                const alreadyAssigned =
                  application.status === "SCHEDULED" ||
                  application.status === "INSPECTION" ||
                  application.status === "PASSED" ||
                  application.status ===
                    "CERTIFICATE_GENERATED";

                return (
                  <div
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    key={application.id}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {application.application_number}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Instrument #{application.instrument_id}
                        {" · "}
                        {application.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>

                      {!alreadyAssigned && (
                        <button
                          onClick={() =>
                            openAssignment(application)
                          }
                          className="rounded-lg bg-[#08755d] px-3 py-2 text-xs font-semibold text-white hover:bg-[#06664f]"
                        >
                          Assign Officer
                        </button>
                      )}

                      {alreadyAssigned && (
                        <span className="text-xs font-medium text-slate-400">
                          Assigned
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* Active Officers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <h2 className="font-bold">
            Active Officers
          </h2>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">
              Loading officers...
            </p>
          ) : activeOfficers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No active officers found.
            </p>
          ) : (
            <div className="mt-4 space-y-4">

              {activeOfficers.map((officer) => (
                <div
                  className="flex items-center justify-between"
                  key={officer.id}
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {officer.full_name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {officer.role}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Active
                  </span>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      {/* -------------------------------------- */}
      {/* ASSIGN OFFICER MODAL */}
      {/* -------------------------------------- */}

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-lg font-bold">
                  Assign Officer
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedApplication.application_number}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedApplication(null);
                  setRecommendations([]);
                  setAssignmentError("");
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Application details */}
            <div className="border-b bg-slate-50 px-5 py-4">
              <p className="text-sm font-semibold">
                Instrument #{selectedApplication.instrument_id}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {selectedApplication.location}
              </p>

              {selectedApplication.preferred_date && (
                <p className="mt-2 text-xs text-slate-500">
                  Preferred date:{" "}
                  {selectedApplication.preferred_date}
                </p>
              )}
            </div>

            {/* Error */}
            {assignmentError && (
              <div className="mx-5 mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {assignmentError}
              </div>
            )}

            {/* Recommendations */}
            <div className="max-h-[420px] overflow-y-auto p-5">

              {loadingRecommendations ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Finding suitable officers...
                </div>
              ) : recommendations.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No available officers found.
                </div>
              ) : (
                <div className="space-y-3">

                  {recommendations.map((officer) => (
                    <div
                      key={officer.officer_id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <p className="font-semibold text-slate-800">
                            {officer.officer_name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {officer.officer_type}
                            {" · "}
                            {officer.designation ||
                              "Metrology Officer"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {officer.district || "District N/A"}
                            {officer.state
                              ? `, ${officer.state}`
                              : ""}
                          </p>

                          {officer.specialization && (
                            <p className="mt-2 text-xs text-slate-500">
                              Specialization:{" "}
                              {officer.specialization}
                            </p>
                          )}

                          <p className="mt-2 text-xs text-slate-500">
                            Current workload:{" "}
                            {officer.current_workload}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                            Score {officer.recommendation_score}
                          </span>
                        </div>

                      </div>

                      <button
                        disabled={
                          assigning || !officer.is_available
                        }
                        onClick={() =>
                          assignOfficer(officer)
                        }
                        className="mt-4 w-full rounded-lg bg-[#08755d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#06664f] disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {assigning
                          ? "Assigning..."
                          : officer.is_available
                            ? "Assign This Officer"
                            : "Officer Unavailable"}
                      </button>
                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}