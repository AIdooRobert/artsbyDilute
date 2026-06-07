import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Client gallery login" };

export default async function ClientLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthShell
      title="Open your gallery"
      copy="Use the private username and password supplied by your photographer."
    >
      <LoginForm role="client" error={query.error} />
      <p className="mt-6 border-t border-black/8 pt-5 text-center text-xs leading-5 text-black/45">
        Need help with your credentials? Contact your photographer directly.
      </p>
    </AuthShell>
  );
}
