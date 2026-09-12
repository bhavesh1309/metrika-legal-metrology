import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  FileText,
  Search,
  ExternalLink,
  X,
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
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    INSPECTION: "Under Inspection",
    SCHEDULED: "Scheduled",
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

export default function BusinessRecordsPage({ type, title }) {
  const [query, setQuery] = useState("");

  const [applications, setApplications] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [loading, setLoading] = useState(
    type === "applications" || type === "certificates"
  );

  const [error, setError] = useState("");

  // Currently selected certificate whose QR code is being viewed
  const [selectedQr, setSelectedQr] = useState(null);

  useEffect(() => {
    if (type !== "applications" && type !== "certificates") {
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
          ] = await Promise.all([
            api.get("/applications"),
            api.get("/instruments"),
          ]);

          setApplications(applicationsResponse.data || []);
          setInstruments(instrumentsResponse.data || []);
        }

        if (type === "certificates") {
          const response = await api.get("/certificates");

          setCertificates(response.data || []);
        }
      } catch (err) {
        console.error(
          `Failed to fetch business ${type}:`,
          err
        );

        const detail = err.response?.data?.detail;

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

      const applicationType = formatApplicationType(
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

      const rejectionReason =
        application.rejectionReason ||
        application.rejection_reason ||
        null;

      return {
        applicationNumber,
        instrument: instrumentName,
        applicationType,
        status,
        submittedDate,
        rejectionReason,
        rawStatus,
      };
    });
  }, [applications, instruments]);

  const certificateRows = useMemo(() => {
    return certificates.map((certificate) => {
      return {
        certificateNumber:
          certificate.certificateNumber ||
          certificate.certificate_number,

        instrument:
          certificate.instrument ||
          "Instrument",

        status: formatStatus(certificate.result),

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
          View and manage your {title.toLowerCase()}.
        </p>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white">
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

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading {title.toLowerCase()}...
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
                if (type === "certificates") {
                  const pdfUrl = row.pdfUrl
                    ? row.pdfUrl.startsWith("http")
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
                            {row.instrument} · {row.status}
                            {row.serialNumber
                              ? ` · S/N: ${row.serialNumber}`
                              : ""}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Valid until{" "}
                            {formatDate(row.validUntil)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Certificate Generated
                        </span>

                        {/* QR Code button */}
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

                        {/* Certificate PDF button */}
                        {pdfUrl && (
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-lg bg-[#0875e1] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            View Certificate
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                }

                if (type === "applications") {
                  return (
                    <div
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
                      key={`${row.applicationNumber}${i}`}
                    >
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
                            {formatDate(row.submittedDate)}
                          </p>

                          {row.rawStatus === "FAILED" &&
                            row.rejectionReason && (
                              <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2.5">
                                <p className="text-xs font-semibold text-rose-700">
                                  Rejection reason
                                </p>

                                <p className="mt-1 text-xs leading-5 text-rose-600">
                                  {row.rejectionReason}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            row.rawStatus === "FAILED"
                              ? "bg-rose-50 text-rose-700"
                              : row.rawStatus ===
                                  "CERTIFICATE_GENERATED" ||
                                row.rawStatus === "PASSED"
                              ? "bg-emerald-50 text-emerald-700"
                              : row.rawStatus === "SCHEDULED"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                    key={`${row[0]}${i}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600">
                        {type === "notifications" ? (
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

      {/* QR CODE MODAL */}
      {selectedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedQr(null)}
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
                    value={selectedQr.qrUrl}
                    size={220}
                    level="H"
                  />
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Scan this QR code to verify the authenticity
                and validity of this certificate.
              </p>

              <button
                type="button"
                onClick={() => setSelectedQr(null)}
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