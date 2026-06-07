import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Photographer login" };

export default async function PhotographerLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthShell title="Welcome back" copy="Sign in to manage your clients, galleries, plan, and studio branding.">
      {query.reset ? (
        <p className="mb-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          Your password has been updated.
        </p>
      ) : null}
      <LoginForm role="photographer" error={query.error} />
    </AuthShell>
  );
}
