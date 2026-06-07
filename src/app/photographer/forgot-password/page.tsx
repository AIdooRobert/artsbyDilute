import { Mail } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth-shell";

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const query = await searchParams;
  const action = requestPasswordReset.bind(null, "photographer");
  return (
    <AuthShell
      title="Reset your password"
      copy="Enter your photographer email. Supabase will send a secure password reset link."
      backHref="/photographer/login"
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
          <button className="button-primary w-full">
            <Mail size={17} /> Send reset link
          </button>
        </form>
      )}
    </AuthShell>
  );
}
