import { Mail } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth-shell";
import { SubmitButton } from "@/components/submit-button";

export const metadata = { title: "Reset superadmin password" };

export default async function AdminForgotPassword({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const query = await searchParams;
  const action = requestPasswordReset.bind(null, "admin");

  return (
    <AuthShell
      title="Reset superadmin password"
      copy="Enter the administrator email. Supabase will send a secure password reset link."
      backHref="/admin/login"
    >
      {query.sent ? (
        <p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          If that account exists, a reset link has been sent.
        </p>
      ) : (
        <form action={action} className="grid gap-5">
          <label className="grid gap-2 text-sm font-bold">
            Email address
            <input name="email" type="email" className="field" required />
          </label>
          <SubmitButton
            className="button-primary w-full disabled:cursor-wait disabled:opacity-60"
            pendingLabel="Sending reset link..."
          >
            <Mail size={17} /> Send reset link
          </SubmitButton>
        </form>
      )}
    </AuthShell>
  );
}
