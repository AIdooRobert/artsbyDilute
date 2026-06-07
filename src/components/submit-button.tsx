"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Working...",
  className = "button-primary",
  disabled = false,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button className={className} disabled={disabled || pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
