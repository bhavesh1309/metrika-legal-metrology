import {
  FilePlus2,
  Clock3,
  CalendarDays,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";

const cards = [
  [
    FilePlus2,
    "bg-blue-50 text-blue-700",
    "Total Applications",
    "totalApplications",
  ],
  [
    Clock3,
    "bg-amber-50 text-amber-700",
    "Pending Review",
    "pending",
  ],
  [
    CalendarDays,
    "bg-violet-50 text-violet-700",
    "Today's Inspections",
    "todayInspections",
  ],
  [
    ShieldCheck,
    "bg-emerald-50 text-emerald-700",
    "Certificates Issued",
    "approved",
  ],
];

function formatStatus(status) {
  switch (status) {
    case "SUBMITTED":
      return "Submitted";
    case "UNDER_REVIEW":
      return "Under Review";
    case "SCHEDULED":
      return "Scheduled";
    case "INSPECTION":
      return "Inspection";
    case "PASSED":
      return "Passed";
    case "FAILED":
      return "Failed";
    case "CERTIFICATE_GENERATED":
      return "Certificate Generated";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function getStatusClasses(status) {
  switch (status) {
    case "PASSED":
    case "CERTIFICATE_GENERATED":
      return "bg-emerald-50 text-emerald-700";

    case "FAILED":
      return "bg-rose-50 text-rose-700";

    case "SCHEDULED":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  return {
    month: date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase(),
    day: date.toLocaleDateString("en-US", {
      day: "2-digit",
    }),
  };
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/officer/dashboard");

        setDashboard(response.data);
      } catch (err) {
        console.error("Failed to load officer dashboard:", err);

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

    fetchDashboard();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-[1540px] px-4 py-7 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1540px] px-4 py-7 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || {
    totalApplications: 0,
    pending: 0,
    todayInspections: 0,
    approved: 0,
  };

  const recentApplications = dashboard?.recentApplications || [];
  const inspectionPlan = dashboard?.inspectionPlan || [];
  const officer = dashboard?.officer;

  return (
    <div className="mx-auto max-w-[1540px] px-4 py-7 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#126a56]">
            {today}
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Good morning, {officer?.name || "Officer"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here is what is happening with your verification work today.
          </p>
        </div>

        <Link
          to="/applications"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a5b4a] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <FilePlus2 size={18} />
          Applications
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, tone, label, key]) => (
          <StatCard
            key={key}
            icon={Icon}
            tone={tone}
            label={label}
            value={stats[key]}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_.8fr]">
        {/* Recent applications */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-bold">
                Recent applications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest verification requests assigned to you
              </p>
            </div>

            <Link
              to="/applications"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#0a5b4a]"
            >
              View all <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="divide-y">
            {recentApplications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No applications assigned yet.
              </div>
            ) : (
              recentApplications.map((application) => (
                <div
                  className="flex items-center justify-between gap-4 p-4 sm:px-5"
                  key={application.id}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700">
                      {application.application_number}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {application.applicant} ·{" "}
                      {application.instrument}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                      application.status
                    )}`}
                  >
                    {formatStatus(application.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's inspection plan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">
            Today&apos;s inspection plan
          </h2>

          <div className="mt-5 space-y-4">
            {inspectionPlan.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                No inspections scheduled for today.
              </div>
            ) : (
              inspectionPlan.map((inspection) => {
                const date = formatDate(
                  inspection.scheduled_date
                );

                return (
                  <div
                    className="flex gap-3"
                    key={inspection.id}
                  >
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[#e7f4f0] text-[#08755d]">
                      <span className="text-[10px] font-bold">
                        {date.month}
                      </span>

                      <b className="leading-3">
                        {date.day}
                      </b>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {inspection.instrument}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {inspection.applicant}
                      </p>

                      <p className="mt-1 text-xs font-medium text-[#0a5b4a]">
                        {formatTime(
                          inspection.scheduled_time
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}