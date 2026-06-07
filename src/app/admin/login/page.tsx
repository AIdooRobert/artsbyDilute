import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Admin login" };

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthShell title="Superadmin console" copy="Sign in to manage the portfolio and the complete SnapFolio platform.">
      {query.reset ? (
        <p className="mb-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          Your password has been updated.
        </p>
      ) : null}
      <LoginForm role="admin" error={query.error} />
    </AuthShell>
  );
}
