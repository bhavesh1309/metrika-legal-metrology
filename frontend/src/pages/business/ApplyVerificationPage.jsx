import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Info,
  MapPin,
  Plus,
  ShieldCheck,
  UploadCloud,
  FileCheck2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

const steps = [
  "Select Instrument",
  "Application Details",
  "Upload Documents",
  "Review & Submit",
];

const stepHints = [
  "Choose your instrument",
  "Provide information",
  "Attach required files",
  "Confirm and submit",
];

const requiredDocs = [
  "Purchase Invoice / Bill",
  "Instrument Photograph",
  "Previous Certificate (if any)",
  "ID / Address Proof",
];

const timeSlots = [
  {
    label: "10:00 AM – 01:00 PM",
    value: "10:00",
  },
  {
    label: "01:00 PM – 04:00 PM",
    value: "13:00",
  },
  {
    label: "04:00 PM – 07:00 PM",
    value: "16:00",
  },
];

function formatDate(date) {
  if (!date) return "Not selected";

  const value = new Date(`${date}T00:00:00`);

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatApplicationType(type) {
  if (type === "INITIAL_VERIFICATION") {
    return "Initial Verification";
  }

  if (type === "RE_VERIFICATION") {
    return "Re-verification";
  }

  return type;
}

export default function ApplyVerificationPage() {
  const go = useNavigate();

  const [step, setStep] = useState(1);

  // Real instruments from backend
  const [instruments, setInstruments] = useState([]);
  const [loadingInstruments, setLoadingInstruments] =
    useState(true);
  const [instrumentError, setInstrumentError] =
    useState("");

  const [selectedInstrument, setSelectedInstrument] =
    useState(null);

  const [applicationType, setApplicationType] = useState(
    "RE_VERIFICATION"
  );

  const [preferredDate, setPreferredDate] =
    useState("");

  const [preferredTime, setPreferredTime] =
    useState("10:00");

  const [location, setLocation] = useState("");

  const [remarks, setRemarks] = useState("");

  const [files, setFiles] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [submittedApplication, setSubmittedApplication] =
    useState(null);

  // Fetch the logged-in business owner's instruments
  useEffect(() => {
    async function fetchInstruments() {
      try {
        setLoadingInstruments(true);
        setInstrumentError("");

        const response = await api.get("/instruments");

        const data = response.data || [];

        setInstruments(data);

        if (data.length > 0) {
          setSelectedInstrument(data[0]);
          setLocation(data[0].location || "");
        }
      } catch (err) {
        console.error(
          "Failed to fetch instruments:",
          err
        );

        setInstrumentError(
          err.response?.data?.detail ||
            "Failed to load your instruments."
        );
      } finally {
        setLoadingInstruments(false);
      }
    }

    fetchInstruments();
  }, []);

  function selectInstrument(instrument) {
    setSelectedInstrument(instrument);
    setLocation(instrument.location || "");
  }

  function next() {
    if (step === 1 && !selectedInstrument) {
      setSubmitError(
        "Please select an instrument first."
      );
      return;
    }

    if (step === 2) {
      if (!preferredDate) {
        setSubmitError(
          "Please select a preferred date."
        );
        return;
      }

      if (!location.trim()) {
        setSubmitError(
          "Please enter the instrument location."
        );
        return;
      }
    }

    setSubmitError("");
    setStep(Math.min(4, step + 1));
  }

  function back() {
    setSubmitError("");

    if (step === 1) {
      go("/business/dashboard");
      return;
    }

    setStep(Math.max(1, step - 1));
  }

  function pickFile(doc, event) {
    const file = event.target.files?.[0];

    if (file) {
      setFiles((prev) => ({
        ...prev,
        [doc]: file.name,
      }));
    }
  }

  async function submit() {
    if (!selectedInstrument) {
      setSubmitError(
        "Please select an instrument."
      );
      return;
    }

    if (!preferredDate) {
      setSubmitError(
        "Please select a preferred date."
      );
      setStep(2);
      return;
    }

    if (!location.trim()) {
      setSubmitError(
        "Please enter the instrument location."
      );
      setStep(2);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const payload = {
        instrument_id: selectedInstrument.id,
        application_type: applicationType,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        location: location.trim(),
      };

      console.log(
        "Submitting application:",
        payload
      );

      const response = await api.post(
        "/applications",
        payload
      );

      console.log(
        "Application created:",
        response.data
      );

      setSubmittedApplication(response.data);
    } catch (err) {
      console.error(
        "Failed to submit application:",
        err
      );

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setSubmitError(
          detail
            .map((item) => item.msg)
            .join(", ")
        );
      } else if (typeof detail === "string") {
        setSubmitError(detail);
      } else {
        setSubmitError(
          "Failed to submit application. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  // -----------------------------
  // SUCCESS SCREEN
  // -----------------------------

  if (submittedApplication) {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-16 text-center sm:px-7">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={34} />
        </div>

        <h1 className="mt-5 text-2xl font-bold">
          Application Submitted
        </h1>

        <p className="mt-2 text-slate-600">
          Your application for{" "}
          <b>
            {selectedInstrument?.instrument_type}
          </b>{" "}
          has been submitted successfully.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Application Number
          </p>

          <p className="mt-1 text-xl font-bold text-[#075b4c]">
            {submittedApplication.application_number}
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="text-slate-500">
                Instrument:
              </span>{" "}
              {selectedInstrument?.instrument_type}
            </p>

            <p>
              <span className="text-slate-500">
                Type:
              </span>{" "}
              {formatApplicationType(
                submittedApplication.application_type
              )}
            </p>

            <p>
              <span className="text-slate-500">
                Preferred Date:
              </span>{" "}
              {formatDate(
                submittedApplication.preferred_date
              )}
            </p>

            <p>
              <span className="text-slate-500">
                Status:
              </span>{" "}
              <span className="font-semibold text-amber-600">
                {submittedApplication.status}
              </span>
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-500">
          Your application has been sent for review.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() =>
              go("/business/applications")
            }
            className="rounded-lg border px-5 py-3 text-sm font-semibold"
          >
            View Applications
          </button>

          <button
            onClick={() =>
              go("/business/dashboard")
            }
            className="rounded-lg bg-[#0875e1] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------
  // MAIN PAGE
  // -----------------------------

  return (
    <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-7">
      <p className="text-sm text-slate-500">
        Dashboard　›　Apply for Verification
      </p>

      <h1 className="mt-3 text-3xl font-bold">
        Apply for Verification
      </h1>

      <p className="mt-1 text-slate-600">
        Submit a request for verification or
        re-verification of your instrument
      </p>

      {/* Steps */}
      <div className="mt-7 grid grid-cols-2 gap-5 md:grid-cols-4">
        {steps.map((label, i) => (
          <button
            onClick={() =>
              i + 1 < step &&
              setStep(i + 1)
            }
            className="flex items-center gap-3 text-left"
            key={label}
          >
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-xl font-bold ${
                step === i + 1
                  ? "bg-[#0875e1] text-white"
                  : step > i + 1
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-800"
              }`}
            >
              {step > i + 1 ? (
                <CheckCircle2 size={22} />
              ) : (
                i + 1
              )}
            </span>

            <span>
              <b className="block text-sm">
                {label}
              </b>

              <small className="text-slate-500">
                {stepHints[i]}
              </small>
            </span>
          </button>
        ))}
      </div>

      {/* Global error */}
      {submitError && (
        <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      )}

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.75fr_.85fr]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* -------------------------------- */}
          {/* STEP 1 */}
          {/* -------------------------------- */}

          {step === 1 && (
            <div className="p-6">
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">
                    1. Select Instrument
                  </h2>

                  <p className="mt-1 text-slate-600">
                    Choose the instrument you want to
                    apply for verification
                  </p>
                </div>

                <button
                  onClick={() =>
                    go("/business/instruments")
                  }
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600"
                >
                  <Plus size={18} />
                  Register New Instrument
                </button>
              </div>

              {loadingInstruments ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  Loading your instruments...
                </div>
              ) : instrumentError ? (
                <div className="mt-5 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
                  {instrumentError}
                </div>
              ) : instruments.length === 0 ? (
                <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-10 text-center">
                  <p className="font-semibold">
                    No instruments registered
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Register an instrument before
                    applying for verification.
                  </p>

                  <button
                    onClick={() =>
                      go("/business/instruments")
                    }
                    className="mt-4 rounded-lg bg-[#0875e1] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Register Instrument
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {instruments.map((ins) => (
                    <button
                      key={ins.id}
                      onClick={() =>
                        selectInstrument(ins)
                      }
                      className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition ${
                        selectedInstrument?.id ===
                        ins.id
                          ? "border-[#0875e1] bg-[#eaf4ff]"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <div>
                        <b>{ins.instrument_type}</b>

                        <p className="mt-1 text-sm text-slate-600">
                          S/N:{" "}
                          {ins.serial_number ||
                            "—"}{" "}
                          | Model:{" "}
                          {ins.model || "—"}{" "}
                          | Capacity:{" "}
                          {ins.capacity}{" "}
                          {ins.capacity_unit}{" "}
                          | Least Count:{" "}
                          {ins.least_count}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Location:{" "}
                          {ins.location}
                        </p>
                      </div>

                      {selectedInstrument?.id ===
                      ins.id ? (
                        <CheckCircle2 className="shrink-0 text-[#0875e1]" />
                      ) : (
                        <ChevronDown className="shrink-0 text-slate-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* -------------------------------- */}
          {/* STEP 2 */}
          {/* -------------------------------- */}

          {step === 2 && (
            <div className="p-6">
              <h2 className="text-xl font-bold">
                2. Application Details
              </h2>

              <p className="mt-1 text-slate-600">
                Provide the verification details
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <div>
                  <p className="mb-2 text-sm font-semibold">
                    Type of Application{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </p>

                  <label className="mr-4 text-sm">
                    <input
                      type="radio"
                      checked={
                        applicationType ===
                        "INITIAL_VERIFICATION"
                      }
                      onChange={() =>
                        setApplicationType(
                          "INITIAL_VERIFICATION"
                        )
                      }
                    />{" "}
                    Initial Verification
                  </label>

                  <label className="text-sm">
                    <input
                      type="radio"
                      checked={
                        applicationType ===
                        "RE_VERIFICATION"
                      }
                      onChange={() =>
                        setApplicationType(
                          "RE_VERIFICATION"
                        )
                      }
                    />{" "}
                    Re-verification
                  </label>
                </div>

                {/* Preferred Date */}
                <label className="text-sm font-semibold">
                  Preferred Date *
                  <span className="relative mt-2 block">
                    <CalendarDays
                      className="absolute left-3 top-3 text-slate-400"
                      size={18}
                    />

                    <input
                      type="date"
                      value={preferredDate}
                      min={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(event) =>
                        setPreferredDate(
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border py-2.5 pl-10 pr-3 outline-none focus:border-[#0875e1]"
                    />
                  </span>
                </label>

                {/* Time */}
                <label className="text-sm font-semibold">
                  Preferred Time Slot *
                  <select
                    value={preferredTime}
                    onChange={(event) =>
                      setPreferredTime(
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border p-2.5 text-sm font-normal outline-none focus:border-[#0875e1]"
                  >
                    {timeSlots.map((slot) => (
                      <option
                        key={slot.value}
                        value={slot.value}
                      >
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Location */}
              <label className="mt-5 block text-sm font-semibold">
                Location of Instrument *

                <span className="relative mt-2 block">
                  <MapPin
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />

                  <input
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="Enter instrument location"
                    className="w-full rounded-lg border py-2.5 pl-10 pr-3 outline-none focus:border-[#0875e1]"
                  />
                </span>
              </label>

              {/* Remarks */}
              <label className="mt-5 block text-sm font-semibold">
                Additional Remarks{" "}
                <span className="font-normal">
                  (Optional)
                </span>

                <textarea
                  value={remarks}
                  onChange={(event) =>
                    setRemarks(event.target.value)
                  }
                  placeholder="Any special instructions for the officer..."
                  className="mt-2 h-24 w-full rounded-lg border p-3 font-normal outline-none focus:border-[#0875e1]"
                />
              </label>
            </div>
          )}

          {/* -------------------------------- */}
          {/* STEP 3 */}
          {/* -------------------------------- */}

          {step === 3 && (
            <div className="p-6">
              <h2 className="text-xl font-bold">
                3. Upload Documents
              </h2>

              <p className="mt-1 text-slate-600">
                Attach the required documents for your
                application
              </p>

              <div className="mt-6 space-y-3">
                {requiredDocs.map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center justify-between gap-3 rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eaf4ff] text-[#0875e1]">
                        {files[doc] ? (
                          <FileCheck2 size={19} />
                        ) : (
                          <UploadCloud size={19} />
                        )}
                      </span>

                      <div>
                        <b className="text-sm">
                          {doc}
                        </b>

                        <p className="text-xs text-slate-500">
                          {files[doc] ||
                            "PDF, JPG or PNG, up to 5 MB"}
                        </p>
                      </div>
                    </div>

                    <label className="shrink-0 cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold hover:bg-slate-200">
                      {files[doc]
                        ? "Replace"
                        : "Choose File"}

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(event) =>
                          pickFile(doc, event)
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                Document upload is currently captured
                in the form. The application API currently
                stores the application details; document
                storage can be connected separately.
              </div>
            </div>
          )}

          {/* -------------------------------- */}
          {/* STEP 4 */}
          {/* -------------------------------- */}

          {step === 4 && (
            <div className="p-6">
              <h2 className="text-xl font-bold">
                4. Review & Submit
              </h2>

              <p className="mt-1 text-slate-600">
                Please review your application before
                submitting
              </p>

              <div className="mt-6 space-y-4 text-sm">
                <div className="rounded-lg border p-4">
                  <b className="text-slate-500">
                    Instrument
                  </b>

                  <p className="mt-1 font-semibold">
                    {selectedInstrument?.instrument_type}
                  </p>

                  <p className="text-slate-600">
                    S/N:{" "}
                    {selectedInstrument?.serial_number ||
                      "—"}
                  </p>

                  <p className="text-slate-600">
                    Model:{" "}
                    {selectedInstrument?.model ||
                      "—"}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <b className="text-slate-500">
                    Application Details
                  </b>

                  <p className="mt-1">
                    Type:{" "}
                    {formatApplicationType(
                      applicationType
                    )}
                  </p>

                  <p>
                    Preferred Date:{" "}
                    {formatDate(preferredDate)}
                  </p>

                  <p>
                    Preferred Time:{" "}
                    {
                      timeSlots.find(
                        (slot) =>
                          slot.value ===
                          preferredTime
                      )?.label
                    }
                  </p>

                  <p>
                    Location: {location}
                  </p>

                  {remarks && (
                    <p>
                      Remarks: {remarks}
                    </p>
                  )}
                </div>

                <div className="rounded-lg border p-4">
                  <b className="text-slate-500">
                    Documents
                  </b>

                  {requiredDocs.map((doc) => (
                    <p
                      key={doc}
                      className="mt-1"
                    >
                      {doc}:{" "}
                      {files[doc] ? (
                        <span className="text-emerald-600">
                          {files[doc]}
                        </span>
                      ) : (
                        <span className="text-amber-600">
                          Not uploaded
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom buttons */}
          <div className="flex justify-between border-t p-5">
            <button
              onClick={back}
              disabled={submitting}
              className="rounded-lg bg-slate-100 px-5 py-3 text-sm font-semibold disabled:opacity-40"
            >
              {step === 1
                ? "Cancel"
                : "← Back"}
            </button>

            {step < 4 ? (
              <button
                onClick={next}
                className="rounded-lg bg-[#0875e1] px-6 py-3 text-sm font-semibold text-white"
              >
                Save & Next　→
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Application"}
              </button>
            )}
          </div>
        </section>

        {/* -------------------------------- */}
        {/* SUMMARY */}
        {/* -------------------------------- */}

        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold">
            Application Summary
          </h2>

          <div className="mt-6 border-b pb-5">
            <b>
              {selectedInstrument?.instrument_type ||
                "No instrument selected"}
            </b>

            {selectedInstrument && (
              <p className="mt-1 text-sm text-slate-600">
                S/N:{" "}
                {selectedInstrument.serial_number ||
                  "—"}
                <br />
                Model:{" "}
                {selectedInstrument.model ||
                  "—"}
              </p>
            )}
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt>Type of Application</dt>

              <dd className="text-right font-medium">
                {formatApplicationType(
                  applicationType
                )}
              </dd>
            </div>

            <div className="flex justify-between gap-3">
              <dt>Preferred Date</dt>

              <dd className="font-medium">
                {formatDate(preferredDate)}
              </dd>
            </div>

            <div className="flex justify-between gap-3">
              <dt>Preferred Time</dt>

              <dd className="text-right font-medium">
                {
                  timeSlots.find(
                    (slot) =>
                      slot.value ===
                      preferredTime
                  )?.label
                }
              </dd>
            </div>

            <div className="flex justify-between gap-3">
              <dt>Documents Uploaded</dt>

              <dd className="font-medium">
                {Object.keys(files).length}/
                {requiredDocs.length}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-lg bg-[#eaf4ff] p-4">
            <div className="flex gap-3">
              <Info className="shrink-0 text-blue-600" />

              <div>
                <b className="text-sm">
                  Next Steps
                </b>

                <ol className="mt-2 list-decimal pl-4 text-sm text-slate-600">
                  <li>
                    Submit your application
                  </li>
                  <li>
                    Application is reviewed
                  </li>
                  <li>
                    Officer is assigned
                  </li>
                  <li>
                    Verification is conducted
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border p-4">
            <p className="text-sm">
              Applicable Fee (Estimated)
            </p>

            <b className="text-2xl">₹ 200</b>
          </div>

          <div className="mt-4 flex gap-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
            <ShieldCheck className="shrink-0" />

            <span>
              Your information is secure and will be
              used only for verification purposes.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}