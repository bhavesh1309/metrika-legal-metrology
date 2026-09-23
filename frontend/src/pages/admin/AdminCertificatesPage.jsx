import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  FileCheck2,
  QrCode,
  Building2,
  Scale,
  CalendarDays,
  Hash,
  Eye,
  Loader2,
  ExternalLink,
} from "lucide-react";

import api from "../../services/api";


/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

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
    value === "VALID" ||
    value === "ACTIVE"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    value === "EXPIRED"
  ) {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}


/* -------------------------------------------------------
   CERTIFICATE DETAILS MODAL
------------------------------------------------------- */

function CertificateDetailsModal({
  certificate,
  onClose,
}) {
  if (!certificate) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="border-b border-slate-200 px-6 py-5">

          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4 pr-10">

            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileCheck2 size={24} />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Certificate Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {certificate.certificate_number}
              </p>

            </div>

          </div>

        </div>


        {/* BODY */}

        <div className="p-6">

          {/* STATUS */}

          <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Certificate Status
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                Current certificate validity
              </p>

            </div>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                certificate.status
              )}`}
            >
              {formatStatus(certificate.status)}
            </span>

          </div>


          {/* CERTIFICATE INFORMATION */}

          <h3 className="mb-3 text-sm font-bold text-slate-800">
            Certificate Information
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">

            <DetailItem
              icon={Hash}
              label="Certificate Number"
              value={certificate.certificate_number}
            />

            <DetailItem
              icon={Hash}
              label="Certificate ID"
              value={certificate.id}
            />

            <DetailItem
              icon={CalendarDays}
              label="Verification Date"
              value={formatDate(
                certificate.verification_date
              )}
            />

            <DetailItem
              icon={CalendarDays}
              label="Valid Until"
              value={formatDate(
                certificate.valid_until
              )}
            />

          </div>


          {/* BUSINESS */}

          <h3 className="mb-3 mt-6 text-sm font-bold text-slate-800">
            Business Information
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">

            <DetailItem
              icon={Building2}
              label="Business Name"
              value={certificate.business_name}
            />

            <DetailItem
              icon={Hash}
              label="Business ID"
              value={certificate.business_id}
            />

          </div>


          {/* INSTRUMENT */}

          <h3 className="mb-3 mt-6 text-sm font-bold text-slate-800">
            Instrument Information
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">

            <DetailItem
              icon={Scale}
              label="Instrument ID"
              value={certificate.instrument_code}
            />

            <DetailItem
              icon={Scale}
              label="Instrument Type"
              value={certificate.instrument_type}
            />

            <DetailItem
              icon={Hash}
              label="Database Instrument ID"
              value={certificate.instrument_id}
            />

            <DetailItem
              icon={Hash}
              label="Application ID"
              value={certificate.application_id}
            />

          </div>


          {/* PDF */}

          {certificate.pdf_url && (
            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-sm font-semibold text-indigo-900">
                    Generated Certificate PDF
                  </p>

                  <p className="mt-1 text-xs text-indigo-700">
                    The official certificate document is available.
                  </p>

                </div>

                <a
                  href={certificate.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <ExternalLink size={15} />
                  Open PDF
                </a>

              </div>

            </div>
          )}


          {/* CLOSE */}

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
   DETAIL ITEM
------------------------------------------------------- */

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
   QR MODAL
------------------------------------------------------- */

function QRModal({
  certificate,
  onClose,
}) {
  if (!certificate) {
    return null;
  }

  /*
    The QR contains the public verification URL.

    Example:

    http://localhost:5173/verify/CERT-ABC123

    When your frontend is deployed, window.location.origin
    automatically changes to your deployed frontend URL.
  */

  const verificationUrl =
    `${window.location.origin}/verify/${encodeURIComponent(
      certificate.certificate_number
    )}`;

  const qrImageUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
      verificationUrl
    )}`;


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

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
              <QrCode size={24} />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Certificate QR
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {certificate.certificate_number}
              </p>

            </div>

          </div>

        </div>


        {/* BODY */}

        <div className="p-6">

          <div className="flex flex-col items-center">

            {/* QR IMAGE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <img
                src={qrImageUrl}
                alt={`QR code for ${certificate.certificate_number}`}
                className="h-64 w-64 object-contain"
              />

            </div>


            <p className="mt-5 text-center text-sm font-semibold text-slate-800">
              Scan to verify certificate
            </p>

            <p className="mt-1 max-w-[300px] break-all text-center text-xs text-slate-500">
              {verificationUrl}
            </p>

          </div>


          {/* INFO */}

          <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3">

            <p className="text-xs font-semibold text-slate-600">
              Verification URL
            </p>

            <p className="mt-1 break-all text-xs text-slate-500">
              {verificationUrl}
            </p>

          </div>


          {/* ACTIONS */}

          <div className="mt-6 flex justify-end gap-2">

            <a
              href={qrImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink size={15} />
              Open QR
            </a>

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

export default function AdminCertificatesPage() {

  const [certificates, setCertificates] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedCertificate, setSelectedCertificate] =
    useState(null);

  const [qrCertificate, setQrCertificate] =
    useState(null);

  const [certificateLoading, setCertificateLoading] =
    useState(false);


  /* ---------------------------------------------------
     FETCH CERTIFICATES
  --------------------------------------------------- */

  useEffect(() => {

    async function fetchCertificates() {

      try {

        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/admin/certificates"
          );

        setCertificates(
          response.data || []
        );

      } catch (err) {

        console.error(
          "Failed to fetch certificates:",
          err
        );

        const detail =
          err.response?.data?.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Failed to load certificates."
        );

      } finally {

        setLoading(false);

      }

    }

    fetchCertificates();

  }, []);


  /* ---------------------------------------------------
     VIEW CERTIFICATE
  --------------------------------------------------- */

  async function handleViewCertificate(certificate) {

    try {

      setCertificateLoading(true);
      setError("");

      /*
        First fetch the complete certificate.

        Admin list endpoint intentionally contains
        summary information only.

        GET /certificates/{id} returns:

        certificate_number
        application_id
        instrument_id
        business_id
        officer_id
        verification_date
        valid_until
        result
        certificate_hash
        pdf_url
        issued_at
      */

      const response =
        await api.get(
          `/certificates/${certificate.id}`
        );

      const fullCertificate =
        response.data;


      /*
        Merge the detailed certificate response
        with the admin certificate information.

        This keeps business_name,
        instrument_code, etc.
      */

      const mergedCertificate = {
        ...certificate,
        ...fullCertificate,
      };


      /*
        If the backend returned a PDF URL,
        open the actual generated certificate.

        Otherwise show the details modal.
      */

      if (fullCertificate.pdf_url) {

        let pdfUrl =
          fullCertificate.pdf_url;


        /*
          If pdf_url is relative, convert it
          into an absolute backend URL.

          Example:

          /files/certificates/CERT-123.pdf

          becomes:

          http://localhost:8000/files/certificates/CERT-123.pdf
        */

        if (
          !pdfUrl.startsWith("http://") &&
          !pdfUrl.startsWith("https://")
        ) {

          const apiBaseUrl =
            api.defaults.baseURL ||
            "http://localhost:8000";

          /*
            Remove trailing slash from API base URL.
          */

          const cleanBaseUrl =
            apiBaseUrl.replace(/\/$/, "");

          /*
            Make sure the relative URL starts
            with a slash.
          */

          const cleanPdfPath =
            pdfUrl.startsWith("/")
              ? pdfUrl
              : `/${pdfUrl}`;

          pdfUrl =
            `${cleanBaseUrl}${cleanPdfPath}`;
        }


        /*
          Open the PDF in a new browser tab.
        */

        window.open(
          pdfUrl,
          "_blank",
          "noopener,noreferrer"
        );

      } else {

        /*
          No PDF available, so show the
          certificate information modal.
        */

        setSelectedCertificate(
          mergedCertificate
        );

      }

    } catch (err) {

      console.error(
        "Failed to fetch certificate:",
        err
      );

      /*
        If the detailed API fails,
        we can still show the certificate
        information already returned by
        /admin/certificates.
      */

      setSelectedCertificate(
        certificate
      );

      const detail =
        err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Could not open the complete certificate."
      );

    } finally {

      setCertificateLoading(false);

    }

  }


  /* ---------------------------------------------------
     COUNTS
  --------------------------------------------------- */

  const statusCounts = useMemo(() => {

    const counts = {
      ALL: certificates.length,
      VALID: 0,
      EXPIRED: 0,
    };

    certificates.forEach(
      (certificate) => {

        const status =
          String(
            certificate.status || ""
          ).toUpperCase();

        if (
          status === "VALID" ||
          status === "ACTIVE"
        ) {
          counts.VALID += 1;
        }

        if (
          status === "EXPIRED"
        ) {
          counts.EXPIRED += 1;
        }

      }
    );

    return counts;

  }, [certificates]);


  /* ---------------------------------------------------
     FILTER
  --------------------------------------------------- */

  const filteredCertificates =
    useMemo(() => {

      const search =
        query
          .toLowerCase()
          .trim();

      return certificates.filter(
        (certificate) => {

          const matchesSearch =
            !search ||
            `${certificate.certificate_number}
            ${certificate.business_name || ""}
            ${certificate.business_id || ""}
            ${certificate.instrument_code || ""}
            ${certificate.instrument_type || ""}`
              .toLowerCase()
              .includes(search);

          const status =
            String(
              certificate.status || ""
            ).toUpperCase();

          let matchesStatus = true;

          if (
            statusFilter !== "ALL"
          ) {

            if (
              statusFilter === "VALID"
            ) {

              matchesStatus =
                status === "VALID" ||
                status === "ACTIVE";

            }

            if (
              statusFilter === "EXPIRED"
            ) {

              matchesStatus =
                status === "EXPIRED";

            }

          }

          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      certificates,
      query,
      statusFilter,
    ]);


  /* ---------------------------------------------------
     RENDER
  --------------------------------------------------- */

  return (
    <>

      <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-7">

        {/* HEADER */}

        <div>

          <h1 className="text-3xl font-bold">
            Certificates
          </h1>

          <p className="mt-1 text-slate-600">
            View and manage verification
            certificates generated through the
            portal
          </p>

        </div>


        {/* SUMMARY CARDS */}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">

          {/* TOTAL */}

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
              Total Certificates
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {statusCounts.ALL}
            </p>

          </button>


          {/* VALID */}

          <button
            type="button"
            onClick={() =>
              setStatusFilter("VALID")
            }
            className={`rounded-xl border bg-white p-4 text-left transition ${
              statusFilter === "VALID"
                ? "border-emerald-300 ring-2 ring-emerald-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Valid
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {statusCounts.VALID}
            </p>

          </button>


          {/* EXPIRED */}

          <button
            type="button"
            onClick={() =>
              setStatusFilter("EXPIRED")
            }
            className={`rounded-xl border bg-white p-4 text-left transition ${
              statusFilter === "EXPIRED"
                ? "border-rose-300 ring-2 ring-rose-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Expired
            </p>

            <p className="mt-1 text-2xl font-bold text-rose-700">
              {statusCounts.EXPIRED}
            </p>

          </button>

        </div>


        {/* TABLE */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white">

          {/* SEARCH */}

          <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">

            <div className="relative max-w-md flex-1">

              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={19}
              />

              <input
                value={query}
                onChange={(e) =>
                  setQuery(
                    e.target.value
                  )
                }
                placeholder="Search certificate, business, instrument..."
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
                All Certificates
              </option>

              <option value="VALID">
                Valid
              </option>

              <option value="EXPIRED">
                Expired
              </option>

            </select>

          </div>


          {/* ERROR */}

          {error && (
            <div className="m-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}


          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px] text-left text-sm">

              <thead className="bg-slate-50 text-xs text-slate-500">

                <tr>

                  <th className="p-3 pl-5">
                    #
                  </th>

                  <th className="p-3">
                    Certificate
                  </th>

                  <th className="p-3">
                    Business
                  </th>

                  <th className="p-3">
                    Instrument
                  </th>

                  <th className="p-3">
                    Verification Date
                  </th>

                  <th className="p-3">
                    Valid Until
                  </th>

                  <th className="p-3">
                    Status
                  </th>

                  <th className="p-3 pr-5 text-right">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="8"
                      className="p-8 text-center text-sm text-slate-500"
                    >

                      <div className="flex items-center justify-center gap-2">

                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Loading certificates...

                      </div>

                    </td>

                  </tr>

                ) : filteredCertificates.length ===
                  0 ? (

                  <tr>

                    <td
                      colSpan="8"
                      className="p-8 text-center text-sm text-slate-500"
                    >
                      No certificates found.
                    </td>

                  </tr>

                ) : (

                  filteredCertificates.map(
                    (certificate, index) => (

                      <tr
                        key={certificate.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >

                        {/* # */}

                        <td className="p-3 pl-5 text-slate-500">
                          {index + 1}
                        </td>


                        {/* CERTIFICATE */}

                        <td className="p-3">

                          <div className="flex items-center gap-3">

                            <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">

                              <FileCheck2
                                size={18}
                              />

                            </div>

                            <div>

                              <p className="font-semibold text-slate-800">
                                {
                                  certificate.certificate_number
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                Certificate
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* BUSINESS */}

                        <td className="max-w-[220px] p-3">

                          <p className="truncate font-semibold text-slate-700">
                            {
                              certificate.business_name ||
                              "—"
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Business ID:{" "}
                            {
                              certificate.business_id ??
                              "—"
                            }
                          </p>

                        </td>


                        {/* INSTRUMENT */}

                        <td className="max-w-[220px] p-3">

                          <p className="font-medium text-slate-700">
                            {
                              certificate.instrument_code ||
                              "—"
                            }
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {
                              certificate.instrument_type ||
                              "Instrument"
                            }
                          </p>

                        </td>


                        {/* VERIFICATION DATE */}

                        <td className="whitespace-nowrap p-3 text-slate-600">

                          {formatDate(
                            certificate.verification_date
                          )}

                        </td>


                        {/* VALID UNTIL */}

                        <td className="whitespace-nowrap p-3 text-slate-600">

                          {formatDate(
                            certificate.valid_until
                          )}

                        </td>


                        {/* STATUS */}

                        <td className="p-3">

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                              certificate.status
                            )}`}
                          >
                            {formatStatus(
                              certificate.status
                            )}
                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="p-3 pr-5">

                          <div className="flex justify-end gap-2">

                            {/* VIEW CERTIFICATE */}

                            <button
                              type="button"
                              disabled={certificateLoading}
                              onClick={() =>
                                handleViewCertificate(
                                  certificate
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                              {certificateLoading ? (
                                <Loader2
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <Eye
                                  size={15}
                                />
                              )}

                              View Certificate

                            </button>


                            {/* VIEW QR */}

                            <button
                              type="button"
                              onClick={() =>
                                setQrCertificate(
                                  certificate
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                            >

                              <QrCode
                                size={15}
                              />

                              View QR

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>


          {/* FOOTER */}

          <div className="border-t border-slate-100 px-5 py-4">

            <p className="text-xs text-slate-500">
              Showing{" "}
              {filteredCertificates.length}{" "}
              of {certificates.length} certificates
            </p>

          </div>

        </section>

      </div>


      {/* CERTIFICATE MODAL */}

      <CertificateDetailsModal
        certificate={selectedCertificate}
        onClose={() =>
          setSelectedCertificate(null)
        }
      />


      {/* QR MODAL */}

      <QRModal
        certificate={qrCertificate}
        onClose={() =>
          setQrCertificate(null)
        }
      />

    </>
  );
}