import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Box,
  CheckCircle2,
  Clock3,
  MoreVertical,
  Plus,
  Search,
  X,
} from "lucide-react";

import api from "../../services/api";

/*
 * Instrument types are grouped according to the schedule structure
 * of the Legal Metrology (General) Rules, 2011.
 */
const INSTRUMENT_TYPE_GROUPS = [
  {
    label: "Fifth Schedule — Weights",
    options: [
      "Weights (Other than Carat Weights)",
      "Carat Weights",
      "Standard Weights for Testing High Capacity Weighing Machines",
    ],
  },
  {
    label: "Sixth Schedule — Measures",
    options: [
      "Liquid Capacity Measures",
      "Dispensing Measures",
      "Liquor Measures",
      "Length Measures (Non-Flexible)",
      "Folding Scales",
      "Fabric or Plastic Tape Measures",
      "Steel Tape Measures",
      "Surveying Chains",
      "Tapes for Measurement of Oil Quantities",
    ],
  },
  {
    label: "Seventh Schedule — Weighing Instruments",
    options: [
      "Non-Automatic Weighing Instrument",
      "Beam Scale",
      "Counter Machine",
      "Automatic Rail Weighbridge",
      "Automatic Gravimetric Filling Instrument",
      "Discontinuous Totalizing Automatic Weighing Instrument",
      "Automatic Instrument for Weighing Road Vehicles in Motion",
    ],
  },
  {
    label: "Eighth Schedule — Measuring Instruments",
    options: [
      "Volumetric Container Filling Machine",
      "Bulk Meter",
      "Water Meter",
      "Measuring System for Liquids Other than Water",
      "Volumetric Container-Type Liquid Measuring Device",
      "Clinical Thermometer",
      "Sphygmomanometer",
      "Taximeter",
      "CNG Measuring System for Vehicles",
      "Petrol / Diesel Fuel Dispenser",
      "LPG Fuel Dispenser",
      "LNG Fuel Dispenser",
      "Hydrogen Fuel Dispenser",
      "Gas Meter",
      "Radar Equipment for Measuring Vehicle Speed",
      "Moisture Meter",
      "Breath Analyser",
      "Continuous Electrical Thermometer",
      "Energy Meter",
      "Flow Meter",
      "Multi-Dimensional Measuring Instrument",
      "Load Cell",
      "Measuring Tape",
      "Auto Rickshaw / Taxi Meter",
    ],
  },
];

/*
 * Capacity units available during instrument registration.
 *
 * The selected unit is stored directly in the existing
 * `capacity_unit` field, so no backend/database change is needed.
 */
const CAPACITY_UNITS = [
  "mg",
  "g",
  "kg",
  "tonne",
  "mL",
  "L",
  "m³",
  "mm",
  "cm",
  "m",
  "km",
];

const initialForm = {
  instrument_type: "",
  manufacturer: "",
  model: "",
  serial_number: "",
  capacity: "",
  capacity_unit: "",
  least_count: "",
  location: "",
};

function formatStatus(status) {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function getStatusClass(status) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700";

    case "VERIFICATION_DUE":
      return "bg-amber-50 text-amber-700";

    case "EXPIRED":
      return "bg-rose-50 text-rose-700";

    case "INACTIVE":
      return "bg-slate-100 text-slate-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function MyInstrumentsPage() {
  const [instruments, setInstruments] = useState([]);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchInstruments();
  }, []);

  async function fetchInstruments() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/instruments");

      setInstruments(response.data || []);
    } catch (err) {
      console.error(
        "Failed to fetch instruments:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load instruments."
      );
    } finally {
      setLoading(false);
    }
  }

  function openModal() {
    setFormError("");
    setForm(initialForm);
    setShowModal(true);
  }

  function closeModal() {
    if (submitting) return;

    setShowModal(false);
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");

    if (
      !form.instrument_type.trim() ||
      !form.manufacturer.trim() ||
      !form.serial_number.trim() ||
      !form.capacity ||
      !form.capacity_unit.trim() ||
      !form.least_count ||
      !form.location.trim()
    ) {
      setFormError(
        "Please fill in all required fields."
      );
      return;
    }

    if (Number(form.capacity) <= 0) {
      setFormError(
        "Capacity must be greater than 0."
      );
      return;
    }

    if (Number(form.least_count) <= 0) {
      setFormError(
        "Least count must be greater than 0."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        instrument_type: form.instrument_type.trim(),
        manufacturer: form.manufacturer.trim(),
        model: form.model.trim() || null,
        serial_number: form.serial_number.trim(),
        capacity: Number(form.capacity),
        capacity_unit: form.capacity_unit.trim(),
        least_count: Number(form.least_count),
        location: form.location.trim(),
      };

      console.log(
        "Registering instrument:",
        payload
      );

      const response = await api.post(
        "/instruments",
        payload
      );

      setInstruments((prev) => [
        response.data,
        ...prev,
      ]);

      setForm(initialForm);
      setShowModal(false);
    } catch (err) {
      console.error(
        "Failed to register instrument:",
        err
      );

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setFormError(
          detail
            .map((item) => item.msg)
            .join(", ")
        );
      } else if (typeof detail === "string") {
        setFormError(detail);
      } else {
        setFormError(
          "Failed to register instrument. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  const instrumentTypes = useMemo(() => {
    return [
      ...new Set(
        instruments
          .map(
            (instrument) =>
              instrument.instrument_type
          )
          .filter(Boolean)
      ),
    ];
  }, [instruments]);

  const statusValues = useMemo(() => {
    return [
      ...new Set(
        instruments
          .map((instrument) => instrument.status)
          .filter(Boolean)
      ),
    ];
  }, [instruments]);

  const filteredInstruments = useMemo(() => {
    const search = query.toLowerCase().trim();

    return instruments.filter((instrument) => {
      const searchableText = [
        instrument.instrument_id,
        instrument.instrument_type,
        instrument.manufacturer,
        instrument.model,
        instrument.serial_number,
        instrument.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search ||
        searchableText.includes(search);

      const matchesType =
        typeFilter === "All Types" ||
        instrument.instrument_type === typeFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        instrument.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    instruments,
    query,
    typeFilter,
    statusFilter,
  ]);

  const totalInstruments = instruments.length;

  const activeCount = instruments.filter(
    (instrument) =>
      instrument.status === "ACTIVE"
  ).length;

  const verificationDueCount =
    instruments.filter(
      (instrument) =>
        instrument.status === "VERIFICATION_DUE"
    ).length;

  const expiredCount = instruments.filter(
    (instrument) =>
      instrument.status === "EXPIRED"
  ).length;

  return (
    <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-7">

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">
            Dashboard　›　My Instruments
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            My Instruments
          </h1>

          <p className="mt-1 text-slate-600">
            Manage your registered weighing and measuring
            instruments
          </p>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0875e1] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Register New Instrument
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            Box,
            totalInstruments,
            "Total Instruments",
            "bg-[#e8f4ff] text-blue-600",
          ],
          [
            CheckCircle2,
            activeCount,
            "Active",
            "bg-[#e8fbef] text-emerald-600",
          ],
          [
            Clock3,
            verificationDueCount,
            "Verification Due",
            "bg-[#fff8e4] text-amber-600",
          ],
          [
            AlertCircle,
            expiredCount,
            "Expired",
            "bg-[#fff0ef] text-rose-600",
          ],
        ].map(
          ([Icon, value, label, style]) => (
            <div
              className={`flex items-center gap-4 rounded-lg border p-5 ${style}`}
              key={label}
            >
              <span className="rounded-full bg-white/50 p-3">
                <Icon size={27} />
              </span>

              <div>
                <b className="text-3xl text-slate-900">
                  {value}
                </b>

                <p className="text-sm text-slate-700">
                  {label}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Main table */}
      <section className="mt-5 rounded-xl border border-slate-200 bg-white">

        {/* Filters */}
        <div className="grid gap-3 p-4 lg:grid-cols-[1.6fr_.7fr_.7fr]">

          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={19}
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search by ID, type, manufacturer, or serial number..."
              className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#0875e1]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            className="rounded-lg border px-3 py-2.5 text-sm text-slate-600"
          >
            <option>All Types</option>

            {instrumentTypes.map((type) => (
              <option key={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-lg border px-3 py-2.5 text-sm text-slate-600"
          >
            <option>All Status</option>

            {statusValues.map((status) => (
              <option key={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {!loading && error && (
          <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}

            <button
              onClick={fetchInstruments}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading instruments...
          </div>
        )}

        {/* Empty state */}
        {!loading &&
          !error &&
          filteredInstruments.length === 0 && (
            <div className="p-12 text-center">
              <Box
                size={42}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-800">
                No instruments found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {instruments.length === 0
                  ? "Register your first instrument to get started."
                  : "Try changing your search or filters."}
              </p>

              {instruments.length === 0 && (
                <button
                  onClick={openModal}
                  className="mt-4 rounded-lg bg-[#0875e1] px-4 py-2 text-sm font-semibold text-white"
                >
                  Register Instrument
                </button>
              )}
            </div>
          )}

        {/* Table */}
        {!loading &&
          !error &&
          filteredInstruments.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="bg-[#eef6ff] text-xs text-slate-700">
                    <tr>
                      {[
                        "#",
                        "Instrument ID",
                        "Type",
                        "Manufacturer",
                        "Model",
                        "Serial Number",
                        "Capacity",
                        "Least Count",
                        "Location",
                        "Status",
                        "Actions",
                      ].map((heading) => (
                        <th
                          className="px-3 py-3 font-bold"
                          key={heading}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInstruments.map(
                      (instrument, index) => (
                        <tr
                          className="border-b border-slate-100"
                          key={instrument.id}
                        >
                          <td className="px-3 py-4">
                            {index + 1}
                          </td>

                          <td className="px-3 py-4 font-semibold text-[#075b4c]">
                            {instrument.instrument_id}
                          </td>

                          <td className="px-3 py-4 text-slate-600">
                            {instrument.instrument_type}
                          </td>

                          <td className="px-3 py-4">
                            {instrument.manufacturer ||
                              "—"}
                          </td>

                          <td className="px-3 py-4">
                            {instrument.model || "—"}
                          </td>

                          <td className="px-3 py-4">
                            {instrument.serial_number ||
                              "—"}
                          </td>

                          <td className="px-3 py-4">
                            {instrument.capacity}{" "}
                            {instrument.capacity_unit}
                          </td>

                          <td className="px-3 py-4">
                            {instrument.least_count}
                          </td>

                          <td className="px-3 py-4 text-xs">
                            {instrument.location}
                          </td>

                          <td className="px-3 py-4">
                            <span
                              className={`rounded px-2 py-1 text-xs font-semibold ${getStatusClass(
                                instrument.status
                              )}`}
                            >
                              {formatStatus(
                                instrument.status
                              )}
                            </span>
                          </td>

                          <td className="px-3 py-4">
                            <button className="rounded bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                              View
                            </button>

                            <button className="ml-2 rounded bg-slate-100 p-1.5 hover:bg-slate-200">
                              <MoreVertical size={15} />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <p className="p-4 text-xs text-slate-500">
                Showing {filteredInstruments.length} of{" "}
                {instruments.length} instruments
              </p>
            </>
          )}
      </section>

      {/* Register Instrument Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Register New Instrument
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add the details of your weighing or measuring
                  instrument.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >

              {formError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">

                {/* Instrument Type */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Instrument Type *
                  </label>

                  <select
                    name="instrument_type"
                    value={form.instrument_type}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0875e1]"
                  >
                    <option value="">
                      Select instrument type
                    </option>

                    {INSTRUMENT_TYPE_GROUPS.map(
                      (group) => (
                        <optgroup
                          key={group.label}
                          label={group.label}
                        >
                          {group.options.map(
                            (instrumentType) => (
                              <option
                                key={instrumentType}
                                value={instrumentType}
                              >
                                {instrumentType}
                              </option>
                            )
                          )}
                        </optgroup>
                      )
                    )}
                  </select>

                  <p className="mt-1.5 text-xs text-slate-500">
                    Select the applicable weight, measure,
                    weighing instrument or measuring instrument
                    category.
                  </p>
                </div>

                {/* Manufacturer */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Manufacturer *
                  </label>

                  <input
                    name="manufacturer"
                    value={form.manufacturer}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Essae"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#0875e1]"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Model
                  </label>

                  <input
                    name="model"
                    value={form.model}
                    onChange={handleFormChange}
                    placeholder="e.g. DS-252"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#0875e1]"
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Serial Number *
                  </label>

                  <input
                    name="serial_number"
                    value={form.serial_number}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. EW-10234"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#0875e1]"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Capacity *
                  </label>

                  <input
                    name="capacity"
                    type="number"
                    step="any"
                    min="0"
                    value={form.capacity}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. 30"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#0875e1]"
                  />
                </div>

                {/* Capacity Unit */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Capacity Unit *
                  </label>

                  <select
                    name="capacity_unit"
                    value={form.capacity_unit}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0875e1]"
                  >
                    <option value="">
                      Select unit
                    </option>

                    {CAPACITY_UNITS.map((unit) => (
                      <option
                        key={unit}
                        value={unit}
                      >
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Least Count */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Least Count *
                  </label>

                  <input
                    name="least_count"
                    type="number"
                    step="any"
                    min="0"
                    value={form.least_count}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. 0.01"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#0875e1]"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Use the same measurement unit as the capacity.
                  </p>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Location *
                  </label>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Main Shop, Delhi"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#0875e1]"
                  />
                </div>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t pt-4">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-lg border px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#0875e1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Registering..."
                    : "Register Instrument"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}