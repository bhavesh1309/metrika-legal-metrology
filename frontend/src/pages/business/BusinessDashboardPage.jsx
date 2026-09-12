import {
  AlertCircle,
  Box,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import BusinessStatCard from "../../components/business/BusinessStatCard";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status) {
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

    case "CERTIFICATE_GENERATED":
      return "Completed";

    case "FAILED":
      return "Rejected";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status || "Unknown";
  }
}

function getStatusTone(status) {
  switch (status) {
    case "CERTIFICATE_GENERATED":
    case "PASSED":
      return "bg-emerald-50 text-emerald-700";

    case "FAILED":
    case "CANCELLED":
      return "bg-rose-50 text-rose-700";

    case "SCHEDULED":
    case "INSPECTION":
      return "bg-emerald-50 text-emerald-700";

    default:
      return "bg-blue-50 text-blue-700";
  }
}

export default function BusinessDashboardPage() {
  const go = useNavigate();
  const { user } = useAuth();

  const [instruments, setInstruments] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const displayName = user?.name || "Business Owner";

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [instrumentsResponse, applicationsResponse] =
          await Promise.all([
            api.get("/instruments"),
            api.get("/applications"),
          ]);

        setInstruments(instrumentsResponse.data || []);
        setApplications(applicationsResponse.data || []);
      } catch (err) {
        console.error(
          "Failed to load business dashboard:",
          err
        );

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

    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const total = instruments.length;

    const valid = instruments.filter(
      (item) => item.status === "ACTIVE"
    ).length;

    const expiringSoon = instruments.filter(
      (item) => item.status === "VERIFICATION_DUE"
    ).length;

    const expired = instruments.filter(
      (item) => item.status === "EXPIRED"
    ).length;

    return {
      total,
      valid,
      expiringSoon,
      expired,
    };
  }, [instruments]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => {
        const dateA =
          a.submitted_at ||
          a.submittedAt ||
          a.submitted_date ||
          a.submittedDate ||
          0;

        const dateB =
          b.submitted_at ||
          b.submittedAt ||
          b.submitted_date ||
          b.submittedDate ||
          0;

        return new Date(dateB) - new Date(dateA);
      })
      .slice(0, 5)
      .map((application) => {
        const instrument = instruments.find(
          (item) =>
            Number(item.id) ===
            Number(application.instrument_id)
        );

        const submittedDate =
          application.submitted_at ||
          application.submittedAt ||
          application.submitted_date ||
          application.submittedDate ||
          null;

        return {
          ...application,
          instrumentName:
            instrument?.instrument_type ||
            instrument?.name ||
            "Instrument",
          submittedDate,
        };
      });
  }, [applications, instruments]);

  const upcomingActions = useMemo(() => {
    const actions = [];

    instruments
      .filter(
        (instrument) =>
          instrument.status === "VERIFICATION_DUE" ||
          instrument.status === "EXPIRED"
      )
      .slice(0, 4)
      .forEach((instrument) => {
        const isExpired =
          instrument.status === "EXPIRED";

        actions.push({
          key: `instrument-${instrument.id}`,
          icon: isExpired ? AlertCircle : Clock3,
          title: isExpired
            ? "Instrument verification expired"
            : "Verification due",
          detail: `${instrument.instrument_type}${
            instrument.serial_number
              ? ` (S/N: ${instrument.serial_number})`
              : ""
          }`,
          date: isExpired
            ? "Expired"
            : "Verification Due",
          tone: isExpired
            ? "text-rose-600 bg-rose-50"
            : "text-amber-600 bg-amber-50",
        });
      });

    applications
      .filter((application) =>
        [
          "SUBMITTED",
          "UNDER_REVIEW",
          "SCHEDULED",
          "INSPECTION",
        ].includes(application.status)
      )
      .slice(0, 4)
      .forEach((application) => {
        const submittedDate =
          application.submitted_at ||
          application.submittedAt ||
          application.submitted_date ||
          application.submittedDate;

        actions.push({
          key: `application-${application.id}`,
          icon: FileText,
          title: `Application ${getStatusLabel(
            application.status
          )}`,
          detail: `Application ${application.application_number}`,
          date: formatDate(submittedDate),
          tone: "text-blue-600 bg-blue-50",
        });
      });

    return actions.slice(0, 4);
  }, [instruments, applications]);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-7">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome back, {displayName}!
          </h1>

          <p className="mt-1 text-slate-600">
            Here&apos;s an overview of your instruments and verification status.
          </p>
        </div>

        <p className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
          <CalendarClock size={18} />
          Today, {today}
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BusinessStatCard
          icon={Box}
          tone="border-blue-100 bg-[#e8f4ff] text-blue-700"
          value={loading ? "—" : stats.total}
          label="Total Instruments"
          to={() => go("/business/instruments")}
        />

        <BusinessStatCard
          icon={CheckCircle2}
          tone="border-emerald-100 bg-[#e8fbef] text-emerald-600"
          value={loading ? "—" : stats.valid}
          label="Valid Instruments"
          to={() => go("/business/instruments")}
        />

        <BusinessStatCard
          icon={Clock3}
          tone="border-amber-100 bg-[#fff8e4] text-amber-600"
          value={loading ? "—" : stats.expiringSoon}
          label="Expiring Soon"
          to={() => go("/business/instruments")}
        />

        <BusinessStatCard
          icon={AlertCircle}
          tone="border-rose-100 bg-[#fff0ef] text-rose-600"
          value={loading ? "—" : stats.expired}
          label="Expired"
          to={() => go("/business/instruments")}
        />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">
            Verification Status Overview
          </h2>

          <div className="mt-7 flex items-center justify-around">
            <div
              className="grid h-48 w-48 place-items-center rounded-full"
              style={{
                background:
                  stats.total > 0
                    ? `conic-gradient(
                        #22c55e 0 ${
                          (stats.valid / stats.total) * 100
                        }%,
                        #fbbf24 ${
                          (stats.valid / stats.total) * 100
                        }% ${
                          ((stats.valid + stats.expiringSoon) /
                            stats.total) *
                          100
                        }%,
                        #e63950 ${
                          ((stats.valid + stats.expiringSoon) /
                            stats.total) *
                          100
                        }% 100%
                      )`
                    : "#e2e8f0",
              }}
            >
              <div className="grid h-32 w-32 place-items-center rounded-full bg-white text-center">
                <b className="text-3xl">
                  {loading ? "—" : stats.total}
                </b>

                <span className="text-sm text-slate-500">
                  Instruments
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              {[
                [
                  "bg-emerald-500",
                  "Valid",
                  stats.valid,
                ],
                [
                  "bg-amber-400",
                  "Expiring Soon",
                  stats.expiringSoon,
                ],
                [
                  "bg-rose-500",
                  "Expired",
                  stats.expired,
                ],
              ].map(([color, label, count]) => (
                <div
                  className="flex items-center gap-3"
                  key={label}
                >
                  <i
                    className={`h-3 w-3 rounded-full ${color}`}
                  />

                  <span className="w-28">
                    {label}
                  </span>

                  <b>{loading ? "—" : count}</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex justify-between">
            <h2 className="text-lg font-bold">
              Upcoming Actions
            </h2>

            <button
              onClick={() => go("/business/applications")}
              className="text-sm font-medium text-blue-600"
            >
              View all →
            </button>
          </div>

          <div className="mt-3 divide-y">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading...
              </p>
            ) : upcomingActions.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No upcoming actions.
              </p>
            ) : (
              upcomingActions.map(
                ({
                  key,
                  icon: Icon,
                  title,
                  detail,
                  date,
                  tone,
                }) => (
                  <div
                    className="flex items-center gap-3 py-3"
                    key={key}
                  >
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full ${tone}`}
                    >
                      <Icon size={20} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">
                        {title}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {detail}
                      </p>
                    </div>

                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${tone}`}
                    >
                      {date}
                    </span>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.9fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex justify-between">
            <h2 className="text-lg font-bold">
              Recent Applications
            </h2>

            <button
              onClick={() => go("/business/applications")}
              className="text-sm font-medium text-blue-600"
            >
              View all →
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="p-3">#</th>
                  <th>Instrument</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-6 text-center text-sm text-slate-500"
                    >
                      Loading applications...
                    </td>
                  </tr>
                ) : recentApplications.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-6 text-center text-sm text-slate-500"
                    >
                      No applications yet.
                    </td>
                  </tr>
                ) : (
                  recentApplications.map(
                    (application, index) => (
                      <tr
                        className="border-b"
                        key={application.id}
                      >
                        <td className="p-3">
                          {index + 1}
                        </td>

                        <td>
                          {application.instrumentName}
                        </td>

                        <td>
                          {application.application_type ===
                          "RE_VERIFICATION"
                            ? "Re-verification"
                            : "Verification"}
                        </td>

                        <td>
                          {formatDate(
                            application.submittedDate
                          )}
                        </td>

                        <td>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${getStatusTone(
                              application.status
                            )}`}
                          >
                            {getStatusLabel(
                              application.status
                            )}
                          </span>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">
            Quick Actions
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => go("/business/instruments")}
              className="rounded-lg border p-4 text-left text-sm font-semibold"
            >
              <Plus className="mb-2 text-blue-600" />
              Register New Instrument
            </button>

            <button
              onClick={() => go("/business/apply")}
              className="rounded-lg border p-4 text-left text-sm font-semibold"
            >
              <FileText className="mb-2 text-blue-600" />
              Apply for Verification
            </button>

            <button
              onClick={() => go("/business/certificates")}
              className="rounded-lg border p-4 text-left text-sm font-semibold"
            >
              <Search className="mb-2 text-blue-600" />
              Search Certificate
            </button>

            <button
              onClick={() => go("/business/notifications")}
              className="rounded-lg border p-4 text-left text-sm font-semibold"
            >
              <CalendarClock className="mb-2 text-blue-600" />
              Notifications
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}