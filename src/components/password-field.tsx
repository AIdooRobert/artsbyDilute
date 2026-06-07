"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordField({
  name,
  label,
  autoComplete,
  minLength,
  showStrength = false,
}: {
  name: string;
  label: string;
  autoComplete: string;
  minLength?: number;
  showStrength?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const score = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;
  const strength = ["Too short", "Weak", "Fair", "Good", "Strong"][score];

  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <span className="relative">
        <input
          name={name}
          type={visible ? "text" : "password"}
          className="field w-full pr-12"
          autoComplete={autoComplete}
          minLength={minLength}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          type="button"
          className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-black/45 hover:bg-black/5"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {showStrength && password ? (
        <span className="text-xs font-semibold text-black/45">
          Password strength: {strength}
        </span>
      ) : null}
    </label>
  );
}
