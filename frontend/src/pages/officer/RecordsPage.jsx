import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Plus,
  Search,
  CalendarDays,
  Scale,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";

import {
  mockUsers,
} from "../../data/mockData";

import PageHeader from "../../components/common/PageHeader";
import RecordList from "../../components/common/RecordList";
import api from "../../services/api";

const records = {
  users: mockUsers,

  alerts: [
    {
      id: "ALT-01",
      title: "Certificate expiring",
      detail: "Platform Scale · Singh Enterprises",
      status: "Due in 6 days",
    },
    {
      id: "ALT-02",
      title: "Inspection overdue",
      detail: "LM-2026-002 · Sharma Wholesale",
      status: "Action required",
    },
  ],

  reports: [
    {
      id: "R-01",
      title: "Monthly verification report",
      detail: "August 2026",
      status: "Ready",
    },
    {
      id: "R-02",
      title: "Certificate expiry report",
      detail: "September 2026",
      status: "Ready",
    },
  ],

  master: [
    {
      id: "M-01",
      title: "Instrument types",
      detail: "15 active categories",
      status: "Manage",
    },
    {
      id: "M-02",
      title: "Districts",
      detail: "13 configured districts",
      status: "Manage",
    },
  ],

  settings: [
    {
      id: "S-01",
      title: "Portal configuration",
      detail: "Application settings and notification rules",
      status: "Configure",
    },
  ],
};

function formatDate(date) {
  if (!date) return "Date not set";

  const value = new Date(`${date}T00:00:00`);

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getScheduleStatus(row) {
  if (row.assignmentStatus === "COMPLETED") {
    return "Completed";
  }

  if (row.assignmentStatus === "CANCELLED") {
    return "Cancelled";
  }

  return "Scheduled";
}

function getStatusLabel(status) {
  if (status === "CERTIFICATE_GENERATED") {
    return "Certificate Generated";
  }

  if (status === "UNDER_REVIEW") {
    return "Under Review";
  }

  if (status === "INITIAL_VERIFICATION") {
    return "Initial Verification";
  }

  if (status === "RE_VERIFICATION") {
    return "Re-verification";
  }

  return status
    ?.replaceAll("_", " ")
    ?.toLowerCase()
    ?.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function RecordsPage({ type, title }) {
  const [query, setQuery] = useState("");

  // Real DB data
  const [userRows, setUserRows] = useState([]);
  const [scheduleRows, setScheduleRows] = useState([]);
  const [instrumentRows, setInstrumentRows] = useState([]);
  const [inspectionRows, setInspectionRows] = useState([]);
  const [certificateRows, setCertificateRows] = useState([]);

  const [realDataLoading, setRealDataLoading] = useState(false);
  const [realDataError, setRealDataError] = useState("");

  /*
   * Users, Verification Schedule, Instruments, Inspections
   * and Certificates are backed by real DB data.
   */
  useEffect(() => {
    const realTypes = [
      "users",
      "schedule",
      "instruments",
      "inspections",
      "certificates",
    ];

    if (!realTypes.includes(type)) {
      return;
    }

    async function fetchRealData() {
      try {
        setRealDataLoading(true);
        setRealDataError("");

        if (type === "users") {
          const response = await api.get("/officer/users");
          setUserRows(response.data);
        }

        if (type === "schedule") {
          const response = await api.get("/officer/applications");

          const scheduled = response.data
            .filter((application) => application.scheduledDate)
            .sort((a, b) => {
              const dateA = `${a.scheduledDate} ${a.scheduledTime || ""}`;
              const dateB = `${b.scheduledDate} ${b.scheduledTime || ""}`;

              return dateA.localeCompare(dateB);
            });

          setScheduleRows(scheduled);
        }

        if (type === "instruments") {
          const response = await api.get("/officer/instruments");
          setInstrumentRows(response.data);
        }

        if (type === "inspections") {
          const response = await api.get("/officer/inspections");
          setInspectionRows(response.data);
        }

        if (type === "certificates") {
          const response = await api.get("/officer/certificates");
          setCertificateRows(response.data);
        }
      } catch (err) {
        console.error(`Failed to fetch ${type}:`, err);

        const detail = err.response?.data?.detail;

        setRealDataError(
          typeof detail === "string"
            ? detail
            : `Failed to load ${title.toLowerCase()}.`,
        );
      } finally {
        setRealDataLoading(false);
      }
    }

    fetchRealData();
  }, [type, title]);

  /*
   * Static pages continue using mock/static data.
   */
  const rows = useMemo(
    () =>
      (records[type] || []).filter((row) =>
        Object.values(row)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [type, query],
  );

  const visibleUsers = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) {
      return userRows;
    }

    return userRows.filter((row) =>
      `
        ${row.name}
        ${row.email}
        ${row.phone || ""}
        ${row.role || ""}
        ${row.status || ""}
      `
        .toLowerCase()
        .includes(search),
    );
  }, [userRows, query]);

  const visibleSchedule = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) {
      return scheduleRows;
    }

    return scheduleRows.filter((row) =>
      `
        ${row.applicationNumber}
        ${row.applicant}
        ${row.instrument}
        ${row.serialNumber || ""}
        ${row.location || ""}
        ${row.officer || ""}
        ${row.status || ""}
      `
        .toLowerCase()
        .includes(search),
    );
  }, [scheduleRows, query]);

  const visibleInstruments = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) {
      return instrumentRows;
    }

    return instrumentRows.filter((row) =>
      `
        ${row.instrumentId}
        ${row.instrument}
        ${row.manufacturer || ""}
        ${row.model || ""}
        ${row.serialNumber || ""}
        ${row.applicant || ""}
        ${row.location || ""}
        ${row.status || ""}
      `
        .toLowerCase()
        .includes(search),
    );
  }, [instrumentRows, query]);

  const visibleInspections = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) {
      return inspectionRows;
    }

    return inspectionRows.filter((row) =>
      `
        ${row.applicationNumber}
        ${row.applicant}
        ${row.instrument}
        ${row.serialNumber || ""}
        ${row.location || ""}
        ${row.result || ""}
        ${row.remarks || ""}
      `
        .toLowerCase()
        .includes(search),
    );
  }, [inspectionRows, query]);

  const visibleCertificates = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) {
      return certificateRows;
    }

    return certificateRows.filter((row) =>
      `
        ${row.certificateNumber}
        ${row.applicationNumber}
        ${row.applicant}
        ${row.instrument}
        ${row.serialNumber || ""}
        ${row.result || ""}
      `
        .toLowerCase()
        .includes(search),
    );
  }, [certificateRows, query]);

  /*
   * Static pages keep their old actions.
   * Users, Schedule, Instruments, Inspections and Certificates
   * are generated through the actual workflow, so they
   * should not have a fake "Add record" button.
   */
  const action =
    type === "settings"
      ? "Save changes"
      : type === "reports"
        ? "Generate report"
        : [
            "users",
            "schedule",
            "instruments",
            "inspections",
            "certificates",
          ].includes(type)
          ? null
          : "Add record";

  return (
    <div className="mx-auto max-w-[1540px] px-4 py-7 sm:px-6 lg:px-8">
      <PageHeader
        title={title}
        description={`Manage and review ${title.toLowerCase()} records.`}
        action={
          action ? (
            <button
              onClick={() =>
                alert(`${action} workflow will open here.`)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#0a5b4a] px-4 py-2.5 text-sm font-semibold text-white"
            >
              {type === "reports" ? (
                <Download size={18} />
              ) : (
                <Plus size={18} />
              )}

              {action}
            </button>
          ) : null
        }
      />

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b p-4">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={18}
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-[#0a765f]"
            />
          </div>
        </div>

        {realDataError && (
          <div className="m-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {realDataError}
          </div>
        )}

        {realDataLoading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading {title.toLowerCase()}...
          </div>
        ) : type === "users" ? (
          /*
           * REAL USERS
           */
          <div className="divide-y">
            {visibleUsers.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                {userRows.length === 0
                  ? "No business users have registered yet."
                  : "No users match your search."}
              </div>
            ) : (
              visibleUsers.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
                      {row.name
                        ?.split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        {row.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {row.email}
                      </p>

                      {row.phone && (
                        <p className="mt-1 text-xs text-slate-400">
                          {row.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
                      {row.role}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        row.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : type === "schedule" ? (
          /*
           * REAL VERIFICATION SCHEDULE
           */
          <>
            {visibleSchedule.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                {scheduleRows.length === 0
                  ? "No verification assignments have been scheduled for you."
                  : "No schedule records match your search."}
              </div>
            ) : (
              <div className="divide-y">
                {visibleSchedule.map((row) => {
                  const status = getScheduleStatus(row);

                  return (
                    <div
                      key={row.id}
                      className="flex items-center justify-between gap-4 p-5"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7f4f0] text-[#08755d]">
                          <CalendarDays size={20} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800">
                            {row.instrument}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {row.applicationNumber}
                            {" · "}
                            {row.serialNumber || "No serial number"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {row.applicant}
                            {row.location ? ` · ${row.location}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-5">
                        <div className="hidden text-right sm:block">
                          <p className="text-sm font-semibold text-slate-700">
                            {formatDate(row.scheduledDate)}
                          </p>

                          {row.scheduledTime && (
                            <p className="mt-1 text-xs font-medium text-[#0a5b4a]">
                              {formatTime(row.scheduledTime)}
                            </p>
                          )}
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            status === "Completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : status === "Cancelled"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : type === "instruments" ? (
          /*
           * REAL INSTRUMENTS
           */
          <div className="divide-y">
            {visibleInstruments.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                {instrumentRows.length === 0
                  ? "No instruments are associated with your assignments."
                  : "No instruments match your search."}
              </div>
            ) : (
              visibleInstruments.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <Scale size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        {row.instrument}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {row.instrumentId}
                        {" · "}
                        {row.serialNumber || "No serial number"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {row.applicant}
                        {" · "}
                        {row.location}
                      </p>

                      {(row.manufacturer || row.model) && (
                        <p className="mt-1 text-xs text-slate-400">
                          {row.manufacturer || "Unknown manufacturer"}
                          {row.model ? ` · ${row.model}` : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      row.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700"
                        : row.status === "EXPIRED"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {getStatusLabel(row.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : type === "inspections" ? (
          /*
           * REAL INSPECTIONS
           */
          <div className="divide-y">
            {visibleInspections.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                {inspectionRows.length === 0
                  ? "No inspections have been recorded yet."
                  : "No inspections match your search."}
              </div>
            ) : (
              visibleInspections.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                      <ClipboardCheck size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        {row.instrument}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {row.applicationNumber}
                        {" · "}
                        {row.serialNumber || "No serial number"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {row.applicant}
                        {row.location ? ` · ${row.location}` : ""}
                      </p>

                      {row.completedAt && (
                        <p className="mt-1 text-xs text-slate-400">
                          Completed{" "}
                          {new Date(row.completedAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      )}

                      {row.remarks && (
                        <p className="mt-1 text-xs text-slate-400">
                          {row.remarks}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      row.result === "PASS"
                        ? "bg-emerald-50 text-emerald-700"
                        : row.result === "FAIL"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {getStatusLabel(row.result)}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : type === "certificates" ? (
          /*
           * REAL CERTIFICATES
           */
          <div className="divide-y">
            {visibleCertificates.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                {certificateRows.length === 0
                  ? "No certificates have been issued by you."
                  : "No certificates match your search."}
              </div>
            ) : (
              visibleCertificates.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <ShieldCheck size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        {row.certificateNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {row.applicationNumber}
                        {" · "}
                        {row.instrument}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {row.applicant}
                        {" · Valid until "}
                        {formatDate(row.validUntil)}
                      </p>

                      {row.serialNumber && (
                        <p className="mt-1 text-xs text-slate-400">
                          Serial: {row.serialNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      row.result === "VALID"
                        ? "bg-emerald-50 text-emerald-700"
                        : row.result === "REVOKED"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {getStatusLabel(row.result)}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          /*
           * STATIC / MOCK PAGES
           *
           * Alerts, Reports, Master Data and Settings
           * continue using the existing RecordList.
           */
          <RecordList rows={rows} type={type} />
        )}
      </section>
    </div>
  );
}