import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  FileText,
  Clock,
  CalendarCheck,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserPlus,
  ClipboardCheck,
  RefreshCw,
  Activity,
  ArrowRight,
} from "lucide-react";

import api from "../../services/api";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/dashboard/stats"
      );

      setDashboard(response.data);
    } catch (err) {
      console.error(
        "Failed to load admin dashboard:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const statusEntries = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return Object.entries(
      dashboard.application_status || {}
    ).filter(([, count]) => count > 0);
  }, [dashboard]);

  const totalInspections =
    dashboard?.inspection_results
      ? (dashboard.inspection_results.PASS || 0) +
        (dashboard.inspection_results.FAIL || 0)
      : 0;

  const passPercentage =
    totalInspections > 0
      ? (
          ((dashboard.inspection_results.PASS || 0) /
            totalInspections) *
          100
        ).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f9fd] p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw
            className="animate-spin text-blue-600"
            size={30}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f9fd] p-8">
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <AlertTriangle
            className="mx-auto text-red-500 mb-3"
            size={40}
          />

          <h2 className="text-lg font-semibold text-gray-900">
            Failed to load dashboard
          </h2>

          <p className="text-gray-500 mt-2">
            {error}
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f9fd] p-6 md:p-8">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <BarChart3
              size={25}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="text-gray-500 mt-1">
              Overview of the Metrika verification system.
            </p>
          </div>

        </div>

        <button
          onClick={fetchDashboard}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-7">

        <StatCard
          title="Total Applications"
          value={dashboard.total_applications}
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Pending Applications"
          value={dashboard.pending_applications}
          icon={Clock}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />

        <StatCard
          title="Scheduled Inspections"
          value={dashboard.scheduled_inspections}
          icon={CalendarCheck}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Certificates Issued"
          value={dashboard.certificates_issued}
          icon={Award}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />

        <StatCard
          title="Active Officers"
          value={dashboard.active_officers}
          icon={Users}
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
        />

      </div>

      {/* =====================================================
          APPLICATION STATUS + INSPECTION RESULTS
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* APPLICATION STATUS */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

          <div className="p-6 border-b border-gray-100">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Application Overview
                </h2>

                <p className="text-sm text-gray-500">
                  Current application pipeline.
                </p>

              </div>

            </div>

          </div>

          <div className="p-6 space-y-5">

            {statusEntries.length === 0 ? (

              <EmptyState text="No application data available." />

            ) : (

              statusEntries.map(
                ([status, count]) => {

                  const percentage =
                    dashboard.total_applications > 0
                      ? (
                          (count /
                            dashboard.total_applications) *
                          100
                        ).toFixed(1)
                      : 0;

                  return (
                    <div key={status}>

                      <div className="flex justify-between mb-2">

                        <span className="text-sm font-medium text-gray-700">
                          {formatStatus(status)}
                        </span>

                        <span className="text-sm font-semibold text-gray-900">
                          {count}
                        </span>

                      </div>

                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )

            )}

          </div>

        </div>

        {/* INSPECTION RESULTS */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

          <div className="p-6 border-b border-gray-100">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <ClipboardCheck
                  size={20}
                  className="text-green-600"
                />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Inspection Results
                </h2>

                <p className="text-sm text-gray-500">
                  Verification outcomes across inspections.
                </p>

              </div>

            </div>

          </div>

          <div className="p-6">

            <div className="grid grid-cols-2 gap-4 mb-6">

              <ResultCard
                title="PASS"
                value={
                  dashboard.inspection_results.PASS ||
                  0
                }
                icon={CheckCircle2}
                bg="bg-green-50"
                color="text-green-600"
              />

              <ResultCard
                title="FAIL"
                value={
                  dashboard.inspection_results.FAIL ||
                  0
                }
                icon={XCircle}
                bg="bg-red-50"
                color="text-red-600"
              />

            </div>

            <div>

              <div className="flex justify-between text-sm mb-2">

                <span className="text-gray-500">
                  Pass Rate
                </span>

                <span className="font-semibold text-gray-900">
                  {passPercentage}%
                </span>

              </div>

              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${passPercentage}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          PENDING ACTIONS
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">

        <div className="p-6 border-b border-gray-100">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <AlertTriangle
                size={20}
                className="text-orange-600"
              />
            </div>

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Pending Actions
              </h2>

              <p className="text-sm text-gray-500">
                Items that may require administrator attention.
              </p>

            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">

          <ActionCard
            title="Applications to Assign"
            value={
              dashboard.pending_actions
                .applications_to_assign
            }
            description="Applications awaiting officer assignment."
            icon={UserPlus}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            link="/admin/applications"
          />

          <ActionCard
            title="Pending Inspections"
            value={
              dashboard.pending_actions
                .inspections_pending
            }
            description="Assigned inspections awaiting completion."
            icon={ClipboardCheck}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            link="/admin/applications"
          />

          <ActionCard
            title="Certificates Expiring"
            value={
              dashboard.pending_actions
                .expiring_certificates
            }
            description="Certificates expiring within 30 days."
            icon={AlertTriangle}
            iconColor="text-yellow-600"
            iconBg="bg-yellow-50"
            link="/admin/reports"
          />

        </div>

      </div>

      {/* =====================================================
          RECENT ACTIVITY
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

        <div className="p-6 border-b border-gray-100">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Activity
                  size={20}
                  className="text-indigo-600"
                />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h2>

                <p className="text-sm text-gray-500">
                  Latest actions recorded in Metrika.
                </p>

              </div>

            </div>

            <a
              href="/admin/audit-trail"
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View Audit Trail
              <ArrowRight size={16} />
            </a>

          </div>

        </div>

        <div className="divide-y divide-gray-100">

          {dashboard.recent_activity.length === 0 ? (

            <EmptyState text="No recent activity." />

          ) : (

            dashboard.recent_activity.map(
              (activity) => (

                <ActivityRow
                  key={activity.id}
                  activity={activity}
                />

              )
            )

          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          <Icon
            size={22}
            className={iconColor}
          />
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   RESULT CARD
========================================================= */

function ResultCard({
  title,
  value,
  icon: Icon,
  bg,
  color,
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-4">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-semibold text-gray-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value}
          </p>

        </div>

        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}
        >
          <Icon
            size={20}
            className={color}
          />
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   ACTION CARD
========================================================= */

function ActionCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBg,
  link,
}) {
  return (
    <div className="p-6">

      <div className="flex items-start gap-4">

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Icon
            size={21}
            className={iconColor}
          />
        </div>

        <div className="flex-1">

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-1">
            {value}
          </p>

          <p className="text-xs text-gray-400 mt-2">
            {description}
          </p>

          <a
            href={link}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-3"
          >
            View
            <ArrowRight size={13} />
          </a>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   ACTIVITY ROW
========================================================= */

function ActivityRow({ activity }) {
  return (
    <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">

      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">

        <Activity
          size={17}
          className="text-blue-600"
        />

      </div>

      <div className="flex-1 min-w-0">

        <div className="flex flex-wrap items-center gap-2">

          <span className="font-medium text-gray-800">
            {formatAction(activity.action)}
          </span>

          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {activity.entity_type}
            {activity.entity_id
              ? ` #${activity.entity_id}`
              : ""}
          </span>

        </div>

        <p className="text-xs text-gray-500 mt-1">
          {activity.user_name}
          {activity.user_role
            ? ` · ${activity.user_role}`
            : ""}
        </p>

      </div>

      <div className="text-xs text-gray-400 whitespace-nowrap">
        {formatDateTime(
          activity.created_at
        )}
      </div>

    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ text }) {
  return (
    <div className="py-10 text-center">

      <Activity
        size={32}
        className="mx-auto text-gray-300"
      />

      <p className="text-sm text-gray-500 mt-3">
        {text}
      </p>

    </div>
  );
}


/* =========================================================
   HELPERS
========================================================= */

function formatStatus(status) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatAction(action) {
  return action
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDateTime(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}