import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  User,
  BriefcaseBusiness,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  Building2,
  Clock3,
} from "lucide-react";

import api from "../../services/api";

const roleTone = {
  business: "bg-blue-50 text-blue-700",
  officer: "bg-emerald-50 text-emerald-700",
  admin: "bg-violet-50 text-violet-700",
};

function getDisplayRole(role) {
  if (role === "CUSTOMER") {
    return "business";
  }

  if (role === "LMO" || role === "GATC") {
    return "officer";
  }

  if (role === "ADMIN") {
    return "admin";
  }

  return role?.toLowerCase() || "";
}

function formatRole(role) {
  if (role === "CUSTOMER") {
    return "Business";
  }

  if (role === "LMO") {
    return "LMO";
  }

  if (role === "GATC") {
    return "GATC";
  }

  if (role === "ADMIN") {
    return "Admin";
  }

  return role || "—";
}

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

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-3">
      <div className="mt-0.5 text-slate-400">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-semibold text-slate-800">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function DetailsModal({ user, onClose }) {
  if (!user) {
    return null;
  }

  const displayRole = getDisplayRole(user.role);
  const isOfficer = displayRole === "officer";
  const isBusiness = displayRole === "business";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="border-b border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close details"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4 pr-10">
            <div
              className={`grid h-12 w-12 place-items-center rounded-full ${
                isOfficer
                  ? "bg-emerald-50 text-emerald-600"
                  : isBusiness
                  ? "bg-blue-50 text-blue-600"
                  : "bg-violet-50 text-violet-600"
              }`}
            >
              {isOfficer ? (
                <ShieldCheck size={23} />
              ) : isBusiness ? (
                <BriefcaseBusiness size={23} />
              ) : (
                <User size={23} />
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {user.full_name}
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    roleTone[displayRole] ||
                    "bg-slate-50 text-slate-700"
                  }`}
                >
                  {formatRole(user.role)}
                </span>

                <StatusBadge active={user.is_active} />
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">

          {/* BUSINESS DETAILS */}
          {isBusiness && (
            <>
              <h3 className="mb-3 text-sm font-bold text-slate-800">
                Business User Details
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow
                  icon={User}
                  label="Full Name"
                  value={user.full_name}
                />

                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={user.email}
                />

                <DetailRow
                  icon={Phone}
                  label="Phone"
                  value={user.phone}
                />

                <DetailRow
                  icon={BadgeCheck}
                  label="Role"
                  value="Business Owner"
                />

                <DetailRow
                  icon={Clock3}
                  label="Registered On"
                  value={formatDate(user.created_at)}
                />

                <DetailRow
                  icon={ShieldCheck}
                  label="Account Status"
                  value={
                    user.is_active
                      ? "Active"
                      : "Inactive"
                  }
                />
              </div>
            </>
          )}

          {/* OFFICER DETAILS */}
          {isOfficer && (
            <>
              <h3 className="mb-3 text-sm font-bold text-slate-800">
                Officer Details
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow
                  icon={User}
                  label="Full Name"
                  value={user.full_name}
                />

                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={user.email}
                />

                <DetailRow
                  icon={Phone}
                  label="Phone"
                  value={user.phone}
                />

                <DetailRow
                  icon={ShieldCheck}
                  label="Officer Type"
                  value={formatRole(user.role)}
                />

                <DetailRow
                  icon={BadgeCheck}
                  label="Employee Code"
                  value={user.employee_code}
                />

                <DetailRow
                  icon={BriefcaseBusiness}
                  label="Designation"
                  value={user.designation}
                />

                <DetailRow
                  icon={MapPin}
                  label="District"
                  value={user.district}
                />

                <DetailRow
                  icon={MapPin}
                  label="State"
                  value={user.state}
                />

                <DetailRow
                  icon={Building2}
                  label="Specialization"
                  value={user.specialization}
                />

                <DetailRow
                  icon={Clock3}
                  label="Availability"
                  value={
                    user.is_available === undefined ||
                    user.is_available === null
                      ? "—"
                      : user.is_available
                      ? "Available"
                      : "Unavailable"
                  }
                />

                <DetailRow
                  icon={Clock3}
                  label="Registered On"
                  value={formatDate(user.created_at)}
                />

                <DetailRow
                  icon={ShieldCheck}
                  label="Account Status"
                  value={
                    user.is_active
                      ? "Active"
                      : "Inactive"
                  }
                />
              </div>
            </>
          )}

          {/* ADMIN / FALLBACK DETAILS */}
          {!isBusiness && !isOfficer && (
            <>
              <h3 className="mb-3 text-sm font-bold text-slate-800">
                User Details
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow
                  icon={User}
                  label="Full Name"
                  value={user.full_name}
                />

                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={user.email}
                />

                <DetailRow
                  icon={Phone}
                  label="Phone"
                  value={user.phone}
                />

                <DetailRow
                  icon={BadgeCheck}
                  label="Role"
                  value={formatRole(user.role)}
                />

                <DetailRow
                  icon={Clock3}
                  label="Registered On"
                  value={formatDate(user.created_at)}
                />

                <DetailRow
                  icon={ShieldCheck}
                  label="Account Status"
                  value={
                    user.is_active
                      ? "Active"
                      : "Inactive"
                  }
                />
              </div>
            </>
          )}

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

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] =
    useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get("/admin/users");

        setUsers(response.data || []);
      } catch (err) {
        console.error(
          "Failed to fetch users:",
          err
        );

        const detail =
          err.response?.data?.detail;

        if (typeof detail === "string") {
          setError(detail);
        } else {
          setError("Failed to load users.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const businessUsers = useMemo(() => {
    const search = query
      .toLowerCase()
      .trim();

    const filtered = users.filter(
      (user) =>
        getDisplayRole(user.role) ===
        "business"
    );

    if (!search) {
      return filtered;
    }

    return filtered.filter((user) => {
      return `${user.full_name}
        ${user.email}
        ${user.phone || ""}
        ${user.role}`
        .toLowerCase()
        .includes(search);
    });
  }, [users, query]);

  const officers = useMemo(() => {
    const search = query
      .toLowerCase()
      .trim();

    const filtered = users.filter(
      (user) =>
        getDisplayRole(user.role) ===
        "officer"
    );

    if (!search) {
      return filtered;
    }

    return filtered.filter((user) => {
      return `${user.full_name}
        ${user.email}
        ${user.phone || ""}
        ${user.role}
        ${user.employee_code || ""}
        ${user.designation || ""}
        ${user.district || ""}
        ${user.state || ""}
        ${user.specialization || ""}`
        .toLowerCase()
        .includes(search);
    });
  }, [users, query]);

  const admins = useMemo(() => {
    return users.filter(
      (user) =>
        getDisplayRole(user.role) ===
        "admin"
    );
  }, [users]);

  function renderEmptyRow(message, columns) {
    return (
      <tr>
        <td
          colSpan={columns}
          className="p-8 text-center text-sm text-slate-500"
        >
          {message}
        </td>
      </tr>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-7">

        {/* PAGE HEADER */}
        <div>
          <h1 className="text-3xl font-bold">
            Users
          </h1>

          <p className="mt-1 text-slate-600">
            Manage business owners and verification officers
          </p>
        </div>

        {/* SEARCH */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white">

          <div className="border-b p-4">
            <div className="relative max-w-md">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={19}
              />

              <input
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                placeholder="Search users, officers, district..."
                className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#6366f1]"
              />
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="m-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          {/* =========================
              BUSINESS USERS
              ========================= */}
          <div className="border-b border-slate-200">

            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness
                    size={18}
                    className="text-blue-600"
                  />

                  <h2 className="text-base font-bold text-slate-900">
                    Business Users
                  </h2>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {businessUsers.length}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Registered businesses and business owners
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">

                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="p-3 pl-5">
                      #
                    </th>

                    <th className="p-3">
                      Name
                    </th>

                    <th className="p-3">
                      Email
                    </th>

                    <th className="p-3">
                      Phone
                    </th>

                    <th className="p-3">
                      Status
                    </th>

                    <th className="p-3 pr-5 text-right">
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-8 text-center text-sm text-slate-500"
                      >
                        Loading business users...
                      </td>
                    </tr>
                  ) : businessUsers.length === 0 ? (
                    renderEmptyRow(
                      "No business users found.",
                      6
                    )
                  ) : (
                    businessUsers.map(
                      (user, i) => (
                        <tr
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                          key={user.id}
                        >
                          <td className="p-3 pl-5 text-slate-500">
                            {i + 1}
                          </td>

                          <td className="p-3 font-semibold text-slate-800">
                            {user.full_name}
                          </td>

                          <td className="p-3 text-slate-600">
                            {user.email}
                          </td>

                          <td className="p-3 text-slate-600">
                            {user.phone || "—"}
                          </td>

                          <td className="p-3">
                            <StatusBadge
                              active={
                                user.is_active
                              }
                            />
                          </td>

                          <td className="p-3 pr-5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedUser(
                                  user
                                )
                              }
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>

              </table>
            </div>

            <p className="px-5 py-4 text-xs text-slate-500">
              Showing {businessUsers.length} business user
              {businessUsers.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          {/* =========================
              OFFICERS
              ========================= */}
          <div>

            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={18}
                    className="text-emerald-600"
                  />

                  <h2 className="text-base font-bold text-slate-900">
                    Verification Officers
                  </h2>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {officers.length}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  LMO and GATC officers responsible for field verification
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">

                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="p-3 pl-5">
                      #
                    </th>

                    <th className="p-3">
                      Officer
                    </th>

                    <th className="p-3">
                      Type
                    </th>

                    <th className="p-3">
                      Employee Code
                    </th>

                    <th className="p-3">
                      District
                    </th>

                    <th className="p-3">
                      Specialization
                    </th>

                    <th className="p-3">
                      Status
                    </th>

                    <th className="p-3 pr-5 text-right">
                      Details
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
                        Loading officers...
                      </td>
                    </tr>
                  ) : officers.length === 0 ? (
                    renderEmptyRow(
                      "No verification officers found.",
                      8
                    )
                  ) : (
                    officers.map(
                      (user, i) => (
                        <tr
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                          key={user.id}
                        >
                          <td className="p-3 pl-5 text-slate-500">
                            {i + 1}
                          </td>

                          <td className="p-3 font-semibold text-slate-800">
                            {user.full_name}
                          </td>

                          <td className="p-3">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              {formatRole(
                                user.role
                              )}
                            </span>
                          </td>

                          <td className="p-3 text-slate-600">
                            {user.employee_code ||
                              "—"}
                          </td>

                          <td className="p-3 text-slate-600">
                            {user.district ||
                              "—"}
                          </td>

                          <td className="max-w-[220px] truncate p-3 text-slate-600">
                            {user.specialization ||
                              "—"}
                          </td>

                          <td className="p-3">
                            <StatusBadge
                              active={
                                user.is_active
                              }
                            />
                          </td>

                          <td className="p-3 pr-5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedUser(
                                  user
                                )
                              }
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>

              </table>
            </div>

            <p className="px-5 py-4 text-xs text-slate-500">
              Showing {officers.length} verification officer
              {officers.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          {/* =========================
              ADMIN ACCOUNTS
              ========================= */}
          {admins.length > 0 && (
            <div className="border-t border-slate-200">

              <div className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <User
                    size={18}
                    className="text-violet-600"
                  />

                  <h2 className="text-base font-bold text-slate-900">
                    Administrator Accounts
                  </h2>

                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                    {admins.length}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  System administrator accounts
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">

                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="p-3 pl-5">
                        #
                      </th>

                      <th className="p-3">
                        Name
                      </th>

                      <th className="p-3">
                        Email
                      </th>

                      <th className="p-3">
                        Status
                      </th>

                      <th className="p-3 pr-5 text-right">
                        Details
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {admins.map(
                      (user, i) => (
                        <tr
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                          key={user.id}
                        >
                          <td className="p-3 pl-5 text-slate-500">
                            {i + 1}
                          </td>

                          <td className="p-3 font-semibold">
                            {user.full_name}
                          </td>

                          <td className="p-3 text-slate-600">
                            {user.email}
                          </td>

                          <td className="p-3">
                            <StatusBadge
                              active={
                                user.is_active
                              }
                            />
                          </td>

                          <td className="p-3 pr-5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedUser(
                                  user
                                )
                              }
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>

                </table>
              </div>

              <p className="px-5 py-4 text-xs text-slate-500">
                Showing {admins.length} administrator
                {admins.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* DETAILS MODAL */}
      <DetailsModal
        user={selectedUser}
        onClose={() =>
          setSelectedUser(null)
        }
      />
    </>
  );
}