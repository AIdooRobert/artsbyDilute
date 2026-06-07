"use client";

import { ArrowRight } from "lucide-react";
import { useActionState } from "react";
import {
  registerPhotographer,
  type PhotographerSignupState,
} from "@/app/actions/auth";
import { PasswordField } from "@/components/password-field";
import { SubmitButton } from "@/components/submit-button";

export function PhotographerSignupForm({
  planSlug,
  initialError,
}: {
  planSlug: string;
  initialError?: string;
}) {
  const initialState: PhotographerSignupState = {
    error: initialError,
    values: {},
  };
  const [state, action] = useActionState(registerPhotographer, initialState);

  return (
    <>
      {state.error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
          {state.error}
        </div>
      ) : null}
      <form action={action} className="grid gap-4">
        <input type="hidden" name="plan_id" value={planSlug} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Your name
            <input
              name="photographer_name"
              className="field"
              defaultValue={state.values.photographerName}
              autoComplete="name"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Business name
            <input
              name="business_name"
              className="field"
              defaultValue={state.values.businessName}
              autoComplete="organization"
              required
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold">
          Email address
          <input
            name="email"
            type="email"
            className="field"
            defaultValue={state.values.email}
            autoComplete="email"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Username
          <input
            name="username"
            className="field"
            minLength={3}
            defaultValue={state.values.username}
            autoComplete="username"
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            name="password"
            label="Password"
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
        </div>
        <SubmitButton
          className="button-primary mt-2 w-full disabled:cursor-wait disabled:opacity-60"
          pendingLabel="Creating your studio..."
        >
          Continue to payment <ArrowRight size={17} />
        </SubmitButton>
      </form>
    </>
  );
}
