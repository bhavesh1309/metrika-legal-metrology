import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
  AlertTriangle,
  Users,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import api from "../../services/api";

export default function AdminReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/reports");

      setReports(response.data);
    } catch (err) {
      console.error("Failed to load reports:", err);

      setError(
        err?.response?.data?.detail ||
        "Failed to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const maxTrendValue = useMemo(() => {
    if (!reports?.application_trends?.length) {
      return 1;
    }

    return Math.max(
      ...reports.application_trends.map(
        (item) => item.count
      ),
      1
    );
  }, [reports]);

  const maxOfficerWorkload = useMemo(() => {
    if (!reports?.officer_workload?.length) {
      return 1;
    }

    return Math.max(
      ...reports.officer_workload.map(
        (item) => item.assigned
      ),
      1
    );
  }, [reports]);

  const maxInstrumentCount = useMemo(() => {
    if (!reports?.instrument_distribution?.length) {
      return 1;
    }

    return Math.max(
      ...reports.instrument_distribution.map(
        (item) => item.count
      ),
      1
    );
  }, [reports]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f9fd] p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-blue-600" size={30} />
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
            Failed to load reports
          </h2>

          <p className="text-gray-500 mt-2">
            {error}
          </p>

          <button
            onClick={fetchReports}
            className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reports) {
    return null;
  }

  const applicationStatuses =
    Object.entries(
      reports.application_status || {}
    ).filter(
      ([, count]) => count > 0
    );

  const inspectionResults =
    reports.inspection_results || {};

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
              Reports & Analytics
            </h1>

            <p className="text-gray-500 mt-1">
              Operational insights across Metrika.
            </p>
          </div>

        </div>

        <button
          onClick={fetchReports}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        <StatCard
          title="Total Applications"
          value={reports.total_applications}
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Completed Verifications"
          value={reports.completed_verifications}
          icon={CheckCircle2}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />

        <StatCard
          title="Pending Applications"
          value={reports.pending_applications}
          icon={Clock}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />

        <StatCard
          title="Pass Rate"
          value={`${reports.pass_rate}%`}
          icon={TrendingUp}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">

        <StatCard
          title="Failed Inspections"
          value={reports.failed_inspections}
          icon={XCircle}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />

        <StatCard
          title="Certificates Issued"
          value={reports.certificates_issued}
          icon={Award}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />

        <StatCard
          title="Expiring Soon"
          value={reports.expiring_soon}
          icon={AlertTriangle}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
        />

        <StatCard
          title="Active Officers"
          value={reports.active_officers}
          icon={Users}
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
        />

      </div>

      {/* =====================================================
          APPLICATION STATUS + INSPECTION RESULTS
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* Application Status */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

          <div className="p-6 border-b border-gray-100">

            <h2 className="text-lg font-semibold text-gray-900">
              Application Status
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Current distribution of applications.
            </p>

          </div>

          <div className="p-6 space-y-5">

            {applicationStatuses.length === 0 ? (

              <EmptyState text="No application data available." />

            ) : (

              applicationStatuses.map(
                ([status, count]) => {

                  const percentage =
                    reports.total_applications > 0
                      ? (
                          (count /
                            reports.total_applications) *
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
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                      <div className="text-xs text-gray-400 mt-1">
                        {percentage}%
                      </div>

                    </div>
                  );
                }
              )

            )}

          </div>

        </div>

        {/* Inspection Results */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

          <div className="p-6 border-b border-gray-100">

            <h2 className="text-lg font-semibold text-gray-900">
              Inspection Results
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              PASS and FAIL inspection outcomes.
            </p>

          </div>

          <div className="p-6">

            <div className="flex items-center gap-8">

              <div className="relative w-40 h-40 shrink-0">

                <div
                  className="w-40 h-40 rounded-full"
                  style={{
                    background: getDonutGradient(
                      inspectionResults.PASS || 0,
                      inspectionResults.FAIL || 0
                    ),
                  }}
                />

                <div className="absolute inset-5 bg-white rounded-full flex flex-col items-center justify-center">

                  <span className="text-2xl font-bold text-gray-900">
                    {reports.pass_rate}%
                  </span>

                  <span className="text-xs text-gray-500">
                    Pass Rate
                  </span>

                </div>

              </div>

              <div className="flex-1 space-y-5">

                <ResultLegend
                  label="PASS"
                  value={inspectionResults.PASS || 0}
                  total={
                    (inspectionResults.PASS || 0) +
                    (inspectionResults.FAIL || 0)
                  }
                  dotClass="bg-green-500"
                />

                <ResultLegend
                  label="FAIL"
                  value={inspectionResults.FAIL || 0}
                  total={
                    (inspectionResults.PASS || 0) +
                    (inspectionResults.FAIL || 0)
                  }
                  dotClass="bg-red-500"
                />

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          APPLICATION TRENDS
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">

        <div className="p-6 border-b border-gray-100">

          <h2 className="text-lg font-semibold text-gray-900">
            Application Trends
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Applications submitted over the last six months.
          </p>

        </div>

        <div className="p-6">

          <div className="flex items-end gap-4 h-64">

            {reports.application_trends.map(
              (item) => {

                const height =
                  item.count === 0
                    ? 4
                    : Math.max(
                        (item.count /
                          maxTrendValue) *
                          100,
                        8
                      );

                return (
                  <div
                    key={item.month}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                  >

                    <span className="text-xs font-semibold text-gray-700">
                      {item.count}
                    </span>

                    <div className="w-full max-w-16 h-48 flex items-end">

                      <div
                        className="w-full bg-blue-500 rounded-t-lg transition-all"
                        style={{
                          height: `${height}%`,
                        }}
                      />

                    </div>

                    <span className="text-xs text-gray-500">
                      {item.month}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          OFFICER WORKLOAD + INSTRUMENT DISTRIBUTION
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* Officer Workload */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

          <div className="p-6 border-b border-gray-100">

            <h2 className="text-lg font-semibold text-gray-900">
              Officer Workload
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Assignment and completion overview.
            </p>

          </div>

          <div className="p-6 space-y-6">

            {reports.officer_workload.length === 0 ? (

              <EmptyState text="No officer data available." />

            ) : (

              reports.officer_workload.map(
                (officer) => {

                  const width =
                    officer.assigned === 0
                      ? 0
                      : Math.max(
                          (officer.assigned /
                            maxOfficerWorkload) *
                            100,
                          5
                        );

                  return (
                    <div key={officer.officer_id}>

                      <div className="flex justify-between mb-2">

                        <div>

                          <p className="text-sm font-semibold text-gray-800">
                            {officer.officer_name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {officer.district || "District not specified"}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-sm font-semibold text-gray-900">
                            {officer.assigned} assigned
                          </p>

                          <p className="text-xs text-gray-500">
                            {officer.completed} completed
                          </p>

                        </div>

                      </div>

                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${width}%`,
                          }}
                        />

                      </div>

                      <div className="flex justify-between mt-1 text-xs text-gray-400">

                        <span>
                          Pending: {officer.pending}
                        </span>

                        <span>
                          {officer.is_available
                            ? "Available"
                            : "Unavailable"}
                        </span>

                      </div>

                    </div>
                  );
                }
              )

            )}

          </div>

        </div>

        {/* Instrument Distribution */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

          <div className="p-6 border-b border-gray-100">

            <h2 className="text-lg font-semibold text-gray-900">
              Instrument Distribution
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Registered instruments by type.
            </p>

          </div>

          <div className="p-6 space-y-5">

            {reports.instrument_distribution.length === 0 ? (

              <EmptyState text="No instrument data available." />

            ) : (

              reports.instrument_distribution.map(
                (item) => {

                  const percentage =
                    reports.instrument_distribution.reduce(
                      (sum, current) =>
                        sum + current.count,
                      0
                    ) > 0
                      ? (
                          (item.count /
                            reports.instrument_distribution.reduce(
                              (sum, current) =>
                                sum + current.count,
                              0
                            )) *
                          100
                        ).toFixed(1)
                      : 0;

                  const width =
                    Math.max(
                      (item.count /
                        maxInstrumentCount) *
                        100,
                      5
                    );

                  return (
                    <div key={item.instrument_type}>

                      <div className="flex justify-between mb-2">

                        <span className="text-sm font-medium text-gray-700">
                          {item.instrument_type}
                        </span>

                        <span className="text-sm font-semibold text-gray-900">
                          {item.count}
                        </span>

                      </div>

                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{
                            width: `${width}%`,
                          }}
                        />

                      </div>

                      <div className="text-xs text-gray-400 mt-1">
                        {percentage}% of registered instruments
                      </div>

                    </div>
                  );
                }
              )

            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          EXPIRING CERTIFICATES
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

        <div className="p-6 border-b border-gray-100">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Certificates Expiring Soon
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Certificates expiring within the next 30 days.
              </p>

            </div>

            <div className="px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-sm font-semibold">
              {reports.expiring_soon} certificates
            </div>

          </div>

        </div>

        <div className="overflow-x-auto">

          {reports.expiring_certificates.length === 0 ? (

            <div className="p-10">
              <EmptyState text="No certificates are expiring within the next 30 days." />
            </div>

          ) : (

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Certificate
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Business
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Instrument
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Valid Until
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Remaining
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {reports.expiring_certificates.map(
                  (certificate) => (

                    <tr
                      key={certificate.certificate_number}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <span className="font-semibold text-blue-600">
                          {certificate.certificate_number}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {certificate.business_name || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {certificate.instrument_code || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(
                          certificate.valid_until
                        )}
                      </td>

                      <td className="px-6 py-4">

                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-semibold">
                          {certificate.days_remaining} days
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

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
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
        >

          <Icon
            size={23}
            className={iconColor}
          />

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   RESULT LEGEND
========================================================= */

function ResultLegend({
  label,
  value,
  total,
  dotClass,
}) {
  const percentage =
    total > 0
      ? ((value / total) * 100).toFixed(1)
      : 0;

  return (
    <div>

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span
            className={`w-3 h-3 rounded-full ${dotClass}`}
          />

          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>

        </div>

        <span className="font-semibold text-gray-900">
          {value}
        </span>

      </div>

      <p className="text-xs text-gray-400 mt-1">
        {percentage}% of inspections
      </p>

    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ text }) {
  return (
    <div className="text-center py-8">

      <FileText
        className="mx-auto text-gray-300"
        size={32}
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

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getDonutGradient(pass, fail) {
  const total = pass + fail;

  if (total === 0) {
    return "conic-gradient(#e5e7eb 0deg 360deg)";
  }

  const passDegrees =
    (pass / total) * 360;

  return `conic-gradient(
    #22c55e 0deg ${passDegrees}deg,
    #ef4444 ${passDegrees}deg 360deg
  )`;
}