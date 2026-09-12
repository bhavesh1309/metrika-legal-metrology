import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  Scale,
  User2Icon,
  Phone,
  Building2,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import { useAuth } from "../../context/useAuth";
import api from "../../services/api";

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();

  const [isLogin, setIsLogin] = useState(true);

  const [loginRole, setLoginRole] = useState("CUSTOMER");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * If already logged in, send the user to the correct workspace.
   */
  if (isAuthenticated) {
    if (user?.role === "CUSTOMER") {
      return <Navigate to="/business/dashboard" replace />;
    }

    if (user?.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user?.role === "LMO" || user?.role === "GATC") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      /*
       * LOGIN
       */
      if (isLogin) {
        const response = await api.post("/auth/login", {
          email,
          password,
        });

        const token = response.data.access_token;

        /*
         * Decode the JWT ourselves so we can verify
         * that the selected login type matches the
         * actual account role.
         */
        const payload = JSON.parse(
          atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );

        const actualRole = payload.role;

        const roleMatches =
          (loginRole === "CUSTOMER" && actualRole === "CUSTOMER") ||
          (loginRole === "ADMIN" && actualRole === "ADMIN") ||
          (loginRole === "OFFICER" &&
            (actualRole === "LMO" || actualRole === "GATC"));

        if (!roleMatches) {
          setError(
            "This account does not belong to the selected login type."
          );
          return;
        }

        login(token);
        return;
      }

      /*
       * CUSTOMER REGISTRATION
       *
       * Officers and Admins are not self-registered.
       */
      await api.post("/auth/register", {
        full_name: fullName,
        email,
        phone: phone || null,
        password,
        role: "CUSTOMER",
      });

      /*
       * Automatically log the newly registered customer in.
       */
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      login(response.data.access_token);
    } catch (err) {
      console.error(err);

      const detail = err.response?.data?.detail;

      let message = "Something went wrong. Please try again.";

      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail
          .map((item) => item.msg)
          .filter(Boolean)
          .join(", ");
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsLogin(!isLogin);
    setError("");
    setPassword("");
  }

  function selectRole(role) {
    setLoginRole(role);
    setError("");
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">

      {/* LEFT SIDE */}
      <section className="hidden bg-[#06234a] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl">
            ⚖️
          </div>

          <div>
            <h1 className="font-bold">Legal Metrology</h1>

            <p className="text-xs text-slate-300">
              Department of Consumer Affairs
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-emerald-300">
            Online Verification System
          </p>

          <h2 className="mt-4 max-w-md text-4xl font-bold leading-tight">
            Trust in every measurement.
          </h2>

          <p className="mt-5 max-w-lg leading-7 text-slate-300">
            Manage verification applications, field inspections and statutory
            certificates in one secure workspace.
          </p>
        </div>

        <p className="text-xs text-slate-400">
          Government of India · Legal Metrology Portal
        </p>
      </section>

      {/* RIGHT SIDE */}
      <section className="flex items-center justify-center p-6">
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"
        >

          {/* MOBILE LOGO */}
          <div className="mb-7 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f4f0] text-[#08755d]">
              <Scale />
            </div>

            <h1 className="mt-4 text-xl font-bold">
              Legal Metrology Portal
            </h1>
          </div>

          <h2 className="text-2xl font-bold">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {isLogin
              ? "Sign in to continue to your workspace."
              : "Register as a business user to access the portal."}
          </p>

          {/* LOGIN ROLE SELECTOR */}
          {isLogin && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Sign in as
              </p>

              <div className="grid grid-cols-3 gap-2">

                {/* CUSTOMER */}
                <button
                  type="button"
                  onClick={() => selectRole("CUSTOMER")}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                    loginRole === "CUSTOMER"
                      ? "border-[#0a765f] bg-[#e7f4f0] text-[#0a765f]"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <Building2 size={19} />
                  Business
                </button>

                {/* OFFICER */}
                <button
                  type="button"
                  onClick={() => selectRole("OFFICER")}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                    loginRole === "OFFICER"
                      ? "border-[#0a765f] bg-[#e7f4f0] text-[#0a765f]"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <UserCog size={19} />
                  Officer
                </button>

                {/* ADMIN */}
                <button
                  type="button"
                  onClick={() => selectRole("ADMIN")}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                    loginRole === "ADMIN"
                      ? "border-[#0a765f] bg-[#e7f4f0] text-[#0a765f]"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <ShieldCheck size={19} />
                  Admin
                </button>

              </div>
            </div>
          )}

          {/* CUSTOMER REGISTRATION */}
          {!isLogin && (
            <label className="mt-6 block text-sm font-semibold text-slate-700">
              Full name

              <div className="relative mt-2">
                <User2Icon
                  className="absolute left-3 top-3 text-slate-400"
                  size={18}
                />

                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-[#0a765f]"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </label>
          )}

          {/* EMAIL */}
          <label className="mt-5 block text-sm font-semibold text-slate-700">
            Email

            <div className="relative mt-2">
              <Mail
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />

              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-[#0a765f]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>

          {/* PHONE */}
          {!isLogin && (
            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Phone

              <span className="ml-1 font-normal text-slate-400">
                (optional)
              </span>

              <div className="relative mt-2">
                <Phone
                  className="absolute left-3 top-3 text-slate-400"
                  size={18}
                />

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-[#0a765f]"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </label>
          )}

          {/* PASSWORD */}
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Password

            <div className="relative mt-2">
              <LockKeyhole
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />

              <input
                type="password"
                required
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-[#0a765f]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </label>

          {/* ERROR */}
          {error && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#0a5b4a] py-3 text-sm font-bold text-white transition hover:bg-[#074d3e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign in securely"
                : "Create account"}
          </button>

          {/* SIGN UP / SIGN IN */}
          <p className="mt-5 text-center text-xs text-slate-400">
            {isLogin
              ? "Don't have an account? "
              : "Already have an account? "}

            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-[#0a765f] underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>

          {/* REGISTRATION NOTE */}
          {!isLogin && (
            <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
              Officer and Administrator accounts are created by the
              department and cannot be self-registered.
            </p>
          )}
        </form>
      </section>
    </main>
  );
}