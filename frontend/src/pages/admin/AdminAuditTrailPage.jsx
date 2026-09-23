import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ShieldCheck,
  User,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const AdminAuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");

  const [expandedLog, setExpandedLog] = useState(null);

  const fetchAuditLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/admin/audit-logs");

      setAuditLogs(response.data || []);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load audit logs."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const actions = useMemo(() => {
    const values = auditLogs
      .map((log) => log.action)
      .filter(Boolean);

    return [...new Set(values)];
  }, [auditLogs]);

  const entities = useMemo(() => {
    const values = auditLogs
      .map((log) => log.entity_type)
      .filter(Boolean);

    return [...new Set(values)];
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return auditLogs.filter((log) => {
      const matchesSearch =
        !query ||
        String(log.id || "")
          .toLowerCase()
          .includes(query) ||
        String(log.user_name || "")
          .toLowerCase()
          .includes(query) ||
        String(log.user_role || "")
          .toLowerCase()
          .includes(query) ||
        String(log.action || "")
          .toLowerCase()
          .includes(query) ||
        String(log.entity_type || "")
          .toLowerCase()
          .includes(query) ||
        String(log.entity_id || "")
          .toLowerCase()
          .includes(query);

      const matchesAction =
        actionFilter === "ALL" ||
        log.action === actionFilter;

      const matchesEntity =
        entityFilter === "ALL" ||
        log.entity_type === entityFilter;

      return (
        matchesSearch &&
        matchesAction &&
        matchesEntity
      );
    });
  }, [
    auditLogs,
    search,
    actionFilter,
    entityFilter,
  ]);

  const formatDateTime = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionStyle = (action) => {
    switch (action) {
      case "CREATE":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "ASSIGN_OFFICER":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "SUBMIT_INSPECTION":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "GENERATE_CERTIFICATE":
        return "bg-green-50 text-green-700 border-green-200";

      case "STATUS_CHANGE":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getEntityStyle = (entity) => {
    switch (entity) {
      case "APPLICATION":
        return "bg-blue-50 text-blue-700";

      case "INSTRUMENT":
        return "bg-indigo-50 text-indigo-700";

      case "CERTIFICATE":
        return "bg-green-50 text-green-700";

      case "USER":
        return "bg-purple-50 text-purple-700";

      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const formatJson = (value) => {
    if (!value) {
      return "No data";
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedLog((current) =>
      current === id ? null : id
    );
  };

  const totalLogs = auditLogs.length;

  const displayedLogs = filteredLogs;

  return (
    <div className="min-h-screen bg-[#F5F9FD] p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#087FE5] text-white shadow-sm">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Audit Trail
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Track important actions and changes across Metrika.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchAuditLogs(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#087FE5] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#066FC9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "animate-spin" : ""
            }
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Audit Events
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalLogs}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Activity size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Actions
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {actions.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Filtered Events
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {filteredLogs.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <FileText size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search user, action, entity or ID..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#087FE5] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) =>
              setActionFilter(e.target.value)
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#087FE5] focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              All Actions
            </option>

            {actions.map((action) => (
              <option
                key={action}
                value={action}
              >
                {action.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          {/* Entity filter */}
          <select
            value={entityFilter}
            onChange={(e) =>
              setEntityFilter(e.target.value)
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#087FE5] focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              All Entities
            </option>

            {entities.map((entity) => (
              <option
                key={entity}
                value={entity}
              >
                {entity}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} />

          <span>{error}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Activity Log
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {displayedLogs.length} event
                {displayedLogs.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw
                size={25}
                className="animate-spin text-[#087FE5]"
              />

              <p className="text-sm text-gray-500">
                Loading audit logs...
              </p>
            </div>
          </div>
        ) : displayedLogs.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <FileText size={25} />
            </div>

            <h3 className="font-semibold text-gray-800">
              No audit events found
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              No audit events match your current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Time
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    User
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Entity
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Entity ID
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {displayedLogs.map((log) => {
                  const isExpanded =
                    expandedLog === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="border-b border-gray-100 transition hover:bg-gray-50">
                        {/* Time */}
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-start gap-2">
                            <Clock
                              size={16}
                              className="mt-0.5 text-gray-400"
                            />

                            <div>
                              <p className="whitespace-nowrap text-sm font-medium text-gray-800">
                                {formatDateTime(
                                  log.created_at
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* User */}
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-start gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                              <User size={15} />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {log.user_name ||
                                  "System"}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-500">
                                {log.user_role ||
                                  "SYSTEM"}

                                {log.user_id
                                  ? ` • ID ${log.user_id}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getActionStyle(
                              log.action
                            )}`}
                          >
                            {String(
                              log.action || "UNKNOWN"
                            ).replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        </td>

                        {/* Entity */}
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getEntityStyle(
                              log.entity_type
                            )}`}
                          >
                            {log.entity_type ||
                              "—"}
                          </span>
                        </td>

                        {/* Entity ID */}
                        <td className="px-5 py-4 align-top">
                          <span className="font-mono text-sm text-gray-700">
                            {log.entity_id ??
                              "—"}
                          </span>
                        </td>

                        {/* Details */}
                        <td className="px-5 py-4 align-top">
                          <button
                            onClick={() =>
                              toggleExpanded(
                                log.id
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-[#087FE5] hover:bg-blue-50 hover:text-[#087FE5]"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp
                                  size={15}
                                />
                                Hide
                              </>
                            ) : (
                              <>
                                <ChevronDown
                                  size={15}
                                />
                                View
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded details */}
                      {isExpanded && (
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <td
                            colSpan="6"
                            className="px-5 py-5"
                          >
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                              {/* Old value */}
                              <div>
                                <div className="mb-2 flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-gray-800">
                                    Previous State
                                  </h4>
                                </div>

                                <pre className="max-h-[280px] overflow-auto rounded-lg border border-gray-200 bg-white p-4 text-xs leading-5 text-gray-700">
                                  {formatJson(
                                    log.old_value
                                  )}
                                </pre>
                              </div>

                              {/* New value */}
                              <div>
                                <div className="mb-2 flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-gray-800">
                                    New State
                                  </h4>
                                </div>

                                <pre className="max-h-[280px] overflow-auto rounded-lg border border-gray-200 bg-white p-4 text-xs leading-5 text-gray-700">
                                  {formatJson(
                                    log.new_value
                                  )}
                                </pre>
                              </div>

                              {/* Metadata */}
                              <div className="lg:col-span-2">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                                    <p className="text-xs text-gray-500">
                                      Audit ID
                                    </p>

                                    <p className="mt-1 font-mono text-sm font-medium text-gray-800">
                                      #{log.id}
                                    </p>
                                  </div>

                                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                                    <p className="text-xs text-gray-500">
                                      IP Address
                                    </p>

                                    <p className="mt-1 font-mono text-sm font-medium text-gray-800">
                                      {log.ip_address ||
                                        "Not recorded"}
                                    </p>
                                  </div>

                                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                                    <p className="text-xs text-gray-500">
                                      Timestamp
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-800">
                                      {formatDateTime(
                                        log.created_at
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogsPage;