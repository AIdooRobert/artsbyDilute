import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Admin login" };

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthShell title="Admin console" copy="Sign in with an administrator email to manage the entire SnapFolio platform.">
      <LoginForm role="admin" error={query.error} />
    </AuthShell>
  );
}
