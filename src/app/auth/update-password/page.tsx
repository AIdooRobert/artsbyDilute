import { KeyRound } from "lucide-react";
import { updatePassword } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth-shell";

export default async function UpdatePassword({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  const query = await searchParams;
  const role = query.role === "admin" ? "admin" : "photographer";
  return (
    <AuthShell title="Choose a new password" copy="Use at least eight characters.">
      {query.error ? (
        <p className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">
          {query.error}
        </p>
      ) : null}
      <form action={updatePassword} className="grid gap-5">
        <input type="hidden" name="role" value={role} />
        <label className="grid gap-2 text-sm font-bold">
          New password
          <input name="password" type="password" className="field" minLength={8} required />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Confirm password
          <input name="confirm_password" type="password" className="field" minLength={8} required />
        </label>
        <button className="button-primary w-full">
          <KeyRound size={17} /> Update password
        </button>
      </form>
    </AuthShell>
  );
}
