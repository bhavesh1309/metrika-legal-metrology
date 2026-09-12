import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

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

  return role.toLowerCase();
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/users");

        setUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);

        const detail = err.response?.data?.detail;

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

  const rows = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) {
      return users;
    }

    return users.filter((user) => {
      const displayRole = getDisplayRole(user.role);

      return `${user.full_name} ${user.email} ${displayRole} ${user.role}`
        .toLowerCase()
        .includes(search);
    });
  }, [users, query]);

  return (
    <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-7">
      <h1 className="text-3xl font-bold">Users</h1>

      <p className="mt-1 text-slate-600">
        Manage business owners, officers and admins
      </p>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white">
        {/* SEARCH */}
        <div className="border-b p-4">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={19}
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
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

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="p-3">#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center text-sm text-slate-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center text-sm text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                rows.map((user, i) => {
                  const displayRole = getDisplayRole(user.role);

                  return (
                    <tr
                      className="border-b border-slate-100"
                      key={user.id}
                    >
                      <td className="p-3">{i + 1}</td>

                      <td className="p-3 font-semibold">
                        {user.full_name}
                      </td>

                      <td className="p-3 text-slate-600">
                        {user.email}
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold capitalize ${
                            roleTone[displayRole] ||
                            "bg-slate-50 text-slate-700"
                          }`}
                        >
                          {displayRole}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            user.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <p className="p-4 text-xs text-slate-500">
          Showing {rows.length} of {users.length} users
        </p>
      </section>
    </div>
  );
}