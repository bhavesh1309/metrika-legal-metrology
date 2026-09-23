import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  FileText,
  Search,
  ExternalLink,
  X,
  CheckCircle2,
  Circle,
  Clock3,
  CalendarClock,
  ClipboardCheck,
  Award,
  XCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import api from "../../services/api";

const mockData = {
  notifications: [
    [
      "Verification due soon",
      "Digital Weighing Scale requires re-verification in 15 days",
      "Today",
    ],
    [
      "Application scheduled",
      "Your application APP-2024-0062 has been scheduled.",
      "Yesterday",
    ],
  ],

  profile: [
    ["Business Name", "Amit Sharma Enterprises"],
    ["Owner Name", "Amit Sharma"],
    ["Registered Address", "Main Shop, Rajpur Road, Dehradun"],
    ["Mobile Number", "+91 98765 43210"],
  ],
};

function formatStatus(status) {
  if (!status) return "Unknown";

  const labels = {
    VALID: "Valid",
    REVOKED: "Revoked",
    EXPIRED: "Expired",
    FAILED: "Rejected",

    CERTIFICATE_GENERATED: "Approved",
    PASSED: "Approved",
    APPROVED: "Approved",

    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    ASSIGNED: "Officer Assigned",
    INSPECTION: "Under Inspection",
    SCHEDULED: "Scheduled",
    COMPLETED: "Completed",
  };

  return labels[status] || status;
}

function formatApplicationType(type) {
  if (!type) return "";

  if (type === "INITIAL_VERIFICATION") {
    return "Verification";
  }

  if (type === "RE_VERIFICATION") {
    return "Re-verification";
  }

  return type;
}

function formatDate(date) {
  if (!date) return "—";

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
  if (!time) return "";

  const parts = String(time).split(":");

  if (parts.length < 2) {
    return time;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getScheduleText(row) {
  if (!row.preferredDate) {
    return "Schedule pending";
  }

  const dateText = formatDate(row.preferredDate);
  const timeText = formatTime(row.preferredTime);

  return timeText
    ? `${dateText} · ${timeText}`
    : dateText;
}

function isApplicationCompleted(status) {
  return [
    "PASSED",
    "CERTIFICATE_GENERATED",
    "APPROVED",
    "COMPLETED",
  ].includes(status);
}

function isApplicationFailed(status) {
  return status === "FAILED";
}

function isInspectionCompleted(status) {
  return [
    "PASSED",
    "CERTIFICATE_GENERATED",
    "APPROVED",
    "COMPLETED",
    "FAILED",
  ].includes(status);
}

function isAssignmentCompleted(status) {
  return [
    "ASSIGNED",
    "SCHEDULED",
    "INSPECTION",
    "PASSED",
    "CERTIFICATE_GENERATED",
    "APPROVED",
    "COMPLETED",
    "FAILED",
  ].includes(status);
}

function isSchedulingCompleted(status) {
  return [
    "SCHEDULED",
    "INSPECTION",
    "PASSED",
    "CERTIFICATE_GENERATED",
    "APPROVED",
    "COMPLETED",
    "FAILED",
  ].includes(status);
}

function isReviewCompleted(status) {
  return [
    "ASSIGNED",
    "SCHEDULED",
    "INSPECTION",
    "PASSED",
    "CERTIFICATE_GENERATED",
    "APPROVED",
    "COMPLETED",
    "FAILED",
  ].includes(status);
}

function getCurrentStageLabel(status) {
  if (status === "SUBMITTED") {
    return "Application submitted";
  }

  if (status === "UNDER_REVIEW") {
    return "Application under review";
  }

  if (status === "ASSIGNED") {
    return "Officer assigned";
  }

  if (status === "SCHEDULED") {
    return "Inspection scheduled";
  }

  if (status === "INSPECTION") {
    return "Field inspection in progress";
  }

  if (
    status === "PASSED" ||
    status === "CERTIFICATE_GENERATED" ||
    status === "APPROVED" ||
    status === "COMPLETED"
  ) {
    return "Certificate issued";
  }

  if (status === "FAILED") {
    return "Verification failed";
  }

  return formatStatus(status);
}

function TimelineIcon({
  state,
  type = "circle",
}) {
  if (state === "completed") {
    return (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 size={18} />
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">
        <XCircle size={18} />
      </div>
    );
  }

  if (state === "active") {
    return (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600">
        <Clock3 size={18} />
      </div>
    );
  }

  if (type === "schedule") {
    return (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400">
        <CalendarClock size={17} />
      </div>
    );
  }

  if (type === "inspection") {
    return (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400">
        <ClipboardCheck size={17} />
      </div>
    );
  }

  if (type === "certificate") {
    return (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Award size={17} />
      </div>
    );
  }

  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400">
      <Circle size={17} />
    </div>
  );
}

function TrackingTimeline({ row }) {
  const status = row.rawStatus;

  const failed = isApplicationFailed(status);
  const completed = isApplicationCompleted(status);

  const reviewCompleted = isReviewCompleted(status);
  const assignmentCompleted = isAssignmentCompleted(status);
  const schedulingCompleted = isSchedulingCompleted(status);
  const inspectionCompleted = isInspectionCompleted(status);

  const reviewActive = status === "UNDER_REVIEW";
  const assignmentActive = status === "ASSIGNED";
  const schedulingActive = status === "SCHEDULED";
  const inspectionActive = status === "INSPECTION";

  /*
   * IMPORTANT:
   * A completed application status means the certificate
   * stage has been completed.
   *
   * We do NOT depend on row.certificate here because
   * certificate matching can fail even though the backend
   * application status is already CERTIFICATE_GENERATED.
   */
  const certificateIssued = completed;

  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Application Tracking
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Current stage: {getCurrentStageLabel(status)}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            failed
              ? "bg-rose-50 text-rose-700"
              : completed
              ? "bg-emerald-50 text-emerald-700"
              : status === "SCHEDULED"
              ? "bg-blue-50 text-blue-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {row.status}
        </span>
      </div>

      <div className="mt-6">

        {/* 1. Application Submitted */}
        <div className="relative flex gap-3">
          <TimelineIcon state="completed" />

          <div className="pb-6">
            <p className="text-sm font-semibold text-slate-800">
              Application Submitted
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {formatDate(row.submittedDate)}
            </p>
          </div>

          <div className="absolute left-4 top-8 h-[calc(100%-16px)] w-px bg-slate-200" />
        </div>

        {/* 2. Application Reviewed */}
        <div className="relative flex gap-3">
          <TimelineIcon
            state={
              reviewCompleted
                ? "completed"
                : reviewActive
                ? "active"
                : "pending"
            }
          />

          <div className="pb-6">
            <p className="text-sm font-semibold text-slate-800">
              Application Reviewed
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {reviewCompleted
                ? "Application has moved forward in the verification process."
                : reviewActive
                ? "Application is currently being reviewed."
                : "Pending review"}
            </p>
          </div>

          <div className="absolute left-4 top-8 h-[calc(100%-16px)] w-px bg-slate-200" />
        </div>

        {/* 3. Officer Assigned */}
        <div className="relative flex gap-3">
          <TimelineIcon
            state={
              assignmentCompleted
                ? "completed"
                : assignmentActive
                ? "active"
                : "pending"
            }
          />

          <div className="pb-6">
            <p className="text-sm font-semibold text-slate-800">
              Officer Assigned
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {assignmentCompleted
                ? "A verification officer has been assigned to this application."
                : "Pending officer assignment"}
            </p>
          </div>

          <div className="absolute left-4 top-8 h-[calc(100%-16px)] w-px bg-slate-200" />
        </div>

        {/* 4. Inspection Scheduled */}
        <div className="relative flex gap-3">
          <TimelineIcon
            state={
              schedulingCompleted
                ? "completed"
                : schedulingActive
                ? "active"
                : "pending"
            }
            type="schedule"
          />

          <div className="pb-6">
            <p className="text-sm font-semibold text-slate-800">
              Inspection Scheduled
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {schedulingCompleted
                ? getScheduleText(row)
                : "Inspection schedule pending"}
            </p>
          </div>

          <div className="absolute left-4 top-8 h-[calc(100%-16px)] w-px bg-slate-200" />
        </div>

        {/* 5. Field Inspection */}
        <div className="relative flex gap-3">
          <TimelineIcon
            state={
              failed
                ? "failed"
                : inspectionCompleted
                ? "completed"
                : inspectionActive
                ? "active"
                : "pending"
            }
            type="inspection"
          />

          <div className="pb-6">
            {failed ? (
              <>
                <p className="text-sm font-semibold text-rose-700">
                  Verification Failed
                </p>

                <p className="mt-1 text-xs text-rose-600">
                  The instrument did not pass the verification inspection.
                </p>

                {row.rejectionReason && (
                  <div className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5">
                    <p className="text-xs font-semibold text-rose-700">
                      Reason for rejection
                    </p>

                    <p className="mt-1 text-xs leading-5 text-rose-600">
                      {row.rejectionReason}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-800">
                  Field Inspection
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {inspectionCompleted
                    ? "Inspection completed successfully."
                    : inspectionActive
                    ? "Officer is currently conducting the inspection."
                    : "Pending field inspection"}
                </p>
              </>
            )}
          </div>

          {!failed && (
            <div className="absolute left-4 top-8 h-[calc(100%-16px)] w-px bg-slate-200" />
          )}
        </div>

        {/* 6. Certificate Issued */}
        {!failed && (
          <div className="relative flex gap-3">
            <TimelineIcon
              state={
                certificateIssued
                  ? "completed"
                  : "pending"
              }
              type="certificate"
            />

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Certificate Issued
              </p>

              {certificateIssued ? (
                <>
                  <p className="mt-1 text-xs text-slate-500">
                    Verification certificate has been issued successfully.
                  </p>

                  {row.certificate && (
                    <>
                      <p className="mt-1 text-xs text-slate-400">
                        Certificate{" "}
                        {row.certificate.certificateNumber}

                        {row.certificate.validUntil
                          ? ` · Valid until ${formatDate(
                              row.certificate.validUntil
                            )}`
                          : ""}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {/* View Certificate */}
                        {row.certificate.pdfUrl && (
                          <a
                            href={
                              row.certificate.pdfUrl.startsWith(
                                "http"
                              )
                                ? row.certificate.pdfUrl
                                : `http://localhost:8000${row.certificate.pdfUrl}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-lg bg-[#0875e1] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            View Certificate
                            <ExternalLink size={14} />
                          </a>
                        )}

                        {/* View QR */}
                        <button
                          type="button"
                          onClick={() =>
                            row.onViewQr(
                              row.certificate
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          View QR
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  Pending successful inspection
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BusinessRecordsPage({
  type,
  title,
}) {
  const [query, setQuery] = useState("");

  const [applications, setApplications] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [loading, setLoading] = useState(
    type === "applications" ||
      type === "certificates"
  );

  const [error, setError] = useState("");

  // Selected certificate for QR modal
  const [selectedQr, setSelectedQr] = useState(null);

  // Application whose tracking timeline is expanded
  const [expandedApplication, setExpandedApplication] =
    useState(null);

  useEffect(() => {
    if (
      type !== "applications" &&
      type !== "certificates"
    ) {
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        if (type === "applications") {
          const [
            applicationsResponse,
            instrumentsResponse,
            certificatesResponse,
          ] = await Promise.all([
            api.get("/applications"),
            api.get("/instruments"),
            api.get("/certificates"),
          ]);

          setApplications(
            applicationsResponse.data || []
          );

          setInstruments(
            instrumentsResponse.data || []
          );

          setCertificates(
            certificatesResponse.data || []
          );
        }

        if (type === "certificates") {
          const response = await api.get(
            "/certificates"
          );

          setCertificates(response.data || []);
        }
      } catch (err) {
        console.error(
          `Failed to fetch business ${type}:`,
          err
        );

        const detail =
          err.response?.data?.detail;

        setError(
          typeof detail === "string"
            ? detail
            : `Failed to load ${type}.`
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [type]);

  const applicationRows = useMemo(() => {
    return applications.map((application) => {
      const applicationId = application.id;

      const applicationNumber =
        application.applicationNumber ||
        application.application_number ||
        `Application #${applicationId}`;

      const instrumentId =
        application.instrumentId ??
        application.instrument_id;

      const instrument = instruments.find(
        (item) => item.id === instrumentId
      );

      const instrumentName =
        application.instrument ||
        instrument?.instrument_type ||
        "Instrument";

      const applicationType =
        formatApplicationType(
          application.applicationType ||
            application.application_type
        );

      const rawStatus = application.status;

      const status = formatStatus(rawStatus);

      const submittedDate =
        application.submittedDate ||
        application.submitted_date ||
        application.submittedAt ||
        application.submitted_at;

      const preferredDate =
        application.preferredDate ||
        application.preferred_date;

      const preferredTime =
        application.preferredTime ||
        application.preferred_time;

      const rejectionReason =
        application.rejectionReason ||
        application.rejection_reason ||
        application.remarks ||
        null;

      const certificate = certificates.find(
        (item) =>
          (item.applicationId ??
            item.application_id) ===
          applicationId
      );

      return {
        id: applicationId,

        applicationNumber,

        instrument: instrumentName,

        applicationType,

        status,

        submittedDate,

        preferredDate,

        preferredTime,

        rejectionReason,

        rawStatus,

        certificate: certificate
          ? {
              certificateNumber:
                certificate.certificateNumber ||
                certificate.certificate_number,

              validUntil:
                certificate.validUntil ||
                certificate.valid_until,

              pdfUrl:
                certificate.pdfUrl ||
                certificate.pdf_url,
            }
          : null,
      };
    });
  }, [
    applications,
    instruments,
    certificates,
  ]);

  const certificateRows = useMemo(() => {
    return certificates.map((certificate) => {
      return {
        certificateNumber:
          certificate.certificateNumber ||
          certificate.certificate_number,

        instrument:
          certificate.instrument ||
          "Instrument",

        status: formatStatus(
          certificate.result
        ),

        validUntil:
          certificate.validUntil ||
          certificate.valid_until,

        serialNumber:
          certificate.serialNumber ||
          certificate.serial_number,

        pdfUrl:
          certificate.pdfUrl ||
          certificate.pdf_url,
      };
    });
  }, [certificates]);

  const rows = useMemo(() => {
    let result = [];

    if (type === "applications") {
      result = applicationRows;
    } else if (type === "certificates") {
      result = certificateRows;
    } else {
      result = mockData[type] || [];
    }

    return result.filter((row) =>
      Object.values(row)
        .map((value) =>
          typeof value === "object" &&
          value !== null
            ? Object.values(value).join(" ")
            : value
        )
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [
    type,
    query,
    applicationRows,
    certificateRows,
  ]);

  function toggleTracking(applicationId) {
    setExpandedApplication((current) =>
      current === applicationId
        ? null
        : applicationId
    );
  }

  function openCertificateQr(certificate) {
    if (!certificate?.certificateNumber) {
      return;
    }

    setSelectedQr({
      certificateNumber:
        certificate.certificateNumber,

      qrUrl: `http://localhost:8000/verify/${certificate.certificateNumber}`,
    });
  }

  return (
    <>
      <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-7">

        <p className="text-sm text-slate-500">
          Dashboard　›　{title}
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          {title}
        </h1>

        <p className="mt-1 text-slate-600">
          View and manage your{" "}
          {title.toLowerCase()}.
        </p>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white">

          {/* Search */}
          <div className="border-b p-4">
            <div className="relative max-w-lg">

              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={19}
              />

              <input
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                placeholder={`Search ${title.toLowerCase()}...`}
                className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#0875e1]"
              />
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading{" "}
              {title.toLowerCase()}...
            </div>

          ) : error ? (
            <div className="p-5">
              <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            </div>

          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              {type === "applications"
                ? "You have no applications yet."
                : type === "certificates"
                ? "You have no certificates yet."
                : "No records found."}
            </div>

          ) : (
            <div className="divide-y">

              {rows.map((row, i) => {

                {/* =========================
                    CERTIFICATES
                    ========================= */}
                if (
                  type === "certificates"
                ) {
                  const pdfUrl = row.pdfUrl
                    ? row.pdfUrl.startsWith(
                        "http"
                      )
                      ? row.pdfUrl
                      : `http://localhost:8000${row.pdfUrl}`
                    : null;

                  return (
                    <div
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                      key={`${row.certificateNumber}${i}`}
                    >

                      <div className="flex items-center gap-3">

                        <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600">
                          <FileText size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-bold">
                            {row.certificateNumber}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {row.instrument} ·{" "}
                            {row.status}

                            {row.serialNumber
                              ? ` · S/N: ${row.serialNumber}`
                              : ""}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Valid until{" "}
                            {formatDate(
                              row.validUntil
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Certificate Generated
                        </span>

                        {/* QR Code */}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedQr({
                              certificateNumber:
                                row.certificateNumber,

                              qrUrl: `http://localhost:8000/verify/${row.certificateNumber}`,
                            })
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          QR Code
                        </button>

                        {/* PDF */}
                        {pdfUrl && (
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-lg bg-[#0875e1] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            View Certificate
                            <ExternalLink
                              size={14}
                            />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                }

                {/* =========================
                    APPLICATIONS
                    ========================= */}
                if (
                  type === "applications"
                ) {
                  const isTracking =
                    expandedApplication ===
                    row.id;

                  return (
                    <div
                      className="p-5"
                      key={`${row.applicationNumber}${i}`}
                    >

                      {/* Application Header */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex items-start gap-3">

                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
                            <FileText size={19} />
                          </div>

                          <div>

                            <p className="text-sm font-bold">
                              {row.applicationNumber}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {row.instrument} ·{" "}
                              {row.applicationType}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Submitted{" "}
                              {formatDate(
                                row.submittedDate
                              )}
                            </p>

                            {/* Rejection reason */}
                            {row.rawStatus ===
                              "FAILED" &&
                              row.rejectionReason && (
                                <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2.5">

                                  <p className="text-xs font-semibold text-rose-700">
                                    Rejection reason
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-rose-600">
                                    {
                                      row.rejectionReason
                                    }
                                  </p>

                                </div>
                              )}
                          </div>
                        </div>

                        {/* Track + Status */}
                        <div className="flex shrink-0 items-center gap-2">

                          {/* Track */}
                          <button
                            type="button"
                            onClick={() =>
                              toggleTracking(
                                row.id
                              )
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                              isTracking
                                ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                : "bg-[#0875e1] text-white hover:bg-blue-700"
                            }`}
                          >
                            {isTracking
                              ? "Hide Tracking"
                              : "Track"}
                          </button>

                          {/* Status */}
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              row.rawStatus ===
                              "FAILED"
                                ? "bg-rose-50 text-rose-700"
                                : [
                                    "CERTIFICATE_GENERATED",
                                    "PASSED",
                                    "APPROVED",
                                    "COMPLETED",
                                  ].includes(
                                    row.rawStatus
                                  )
                                ? "bg-emerald-50 text-emerald-700"
                                : row.rawStatus ===
                                  "SCHEDULED"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {row.status}
                          </span>

                        </div>
                      </div>

                      {/* Tracking */}
                      {isTracking && (
                        <TrackingTimeline
                          row={{
                            ...row,
                            onViewQr:
                              openCertificateQr,
                          }}
                        />
                      )}

                    </div>
                  );
                }

                {/* =========================
                    MOCK RECORDS
                    ========================= */}
                return (
                  <div
                    className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                    key={`${row[0]}${i}`}
                  >

                    <div className="flex items-center gap-3">

                      <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600">

                        {type ===
                        "notifications" ? (
                          <Bell size={19} />
                        ) : (
                          <FileText size={19} />
                        )}

                      </div>

                      <div>

                        <p className="text-sm font-bold">
                          {row[0]}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {row
                            .slice(1, -1)
                            .join(" · ")}
                        </p>

                      </div>
                    </div>

                    <span className="text-sm font-medium text-slate-600">
                      {row.at(-1)}
                    </span>

                  </div>
                );
              })}

            </div>
          )}

        </section>
      </div>

      {/* =========================
          QR CODE MODAL
          ========================= */}
      {selectedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

            {/* Close */}
            <button
              type="button"
              onClick={() =>
                setSelectedQr(null)
              }
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close QR code"
            >
              <X size={20} />
            </button>

            <div className="text-center">

              <h2 className="text-xl font-bold text-slate-900">
                Certificate QR Code
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {selectedQr.certificateNumber}
              </p>

              <div className="mt-6 flex justify-center">

                <div className="rounded-xl border border-slate-200 bg-white p-4">

                  <QRCodeSVG
                    value={
                      selectedQr.qrUrl
                    }
                    size={220}
                    level="H"
                  />

                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Scan this QR code to verify
                the authenticity and validity
                of this certificate.
              </p>

              <button
                type="button"
                onClick={() =>
                  setSelectedQr(null)
                }
                className="mt-5 w-full rounded-lg bg-[#0875e1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}