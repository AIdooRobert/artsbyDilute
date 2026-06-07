import Link from "next/link";
import { LogIn } from "lucide-react";
import { login } from "@/app/actions/auth";

export function LoginForm({
  role,
  error,
}: {
  role: "admin" | "photographer" | "client";
  error?: string;
}) {
  const loginAction = login.bind(null, role);
  const isAdmin = role === "admin";

  return (
    <>
      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      ) : null}
      <form action={loginAction} className="grid gap-5">
        <label className="grid gap-2 text-sm font-bold">
          {isAdmin ? "Email address" : "Email or username"}
          <input
            name="identifier"
            type="text"
            className="field"
            autoComplete="username"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Password
          <input
            name="password"
            type="password"
            className="field"
            autoComplete="current-password"
            required
          />
        </label>
        <button className="button-primary w-full">
          <LogIn size={17} /> Sign in
        </button>
      </form>
      {role === "photographer" || role === "admin" ? (
        <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-black/8 pt-5 text-sm">
          <Link href={`/${role}/forgot-password`} className="font-bold text-copper">
            Forgot password?
          </Link>
          {role === "photographer" ? (
            <Link href="/pricing" className="font-bold text-black/60">
              Create an account
            </Link>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
