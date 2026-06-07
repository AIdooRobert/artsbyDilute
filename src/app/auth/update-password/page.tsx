import { KeyRound } from "lucide-react";
import { updatePassword } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth-shell";
import { PasswordField } from "@/components/password-field";
import { SubmitButton } from "@/components/submit-button";

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
        <PasswordField
          name="password"
          label="New password"
          autoComplete="new-password"
          minLength={8}
          showStrength
        />
        <PasswordField
          name="confirm_password"
          label="Confirm password"
          autoComplete="new-password"
          minLength={8}
        />
        <SubmitButton
          className="button-primary w-full disabled:cursor-wait disabled:opacity-60"
          pendingLabel="Updating password..."
        >
          <KeyRound size={17} /> Update password
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
