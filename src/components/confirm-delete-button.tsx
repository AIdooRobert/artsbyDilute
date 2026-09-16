"use client";

import { useTransition, type ReactNode } from "react";

export function ConfirmDeleteButton({
  action,
  fields,
  message,
  className,
  label,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  message: string;
  className?: string;
  label: string;
  children: ReactNode;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (pending || !window.confirm(message)) return;

    const formData = new FormData();
    for (const [name, value] of Object.entries(fields)) {
      formData.set(name, value);
    }
    startTransition(async () => {
      await action(formData);
    });
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={pending ? "Deleting…" : label}
      aria-busy={pending}
      disabled={pending}
      onClick={handleDelete}
    >
      {children}
    </button>
  );
}
