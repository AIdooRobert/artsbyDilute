"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff, RefreshCw, Share2 } from "lucide-react";
import { prepareClientAccess } from "@/app/actions/photographer";

type Status = {
  type: "idle" | "progress" | "success" | "error";
  message: string;
};

function generatePassword() {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const values = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through for browsers that expose Clipboard API but deny access.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command was rejected.");
}

export function ClientAccessShare({
  clientId,
  clientName,
  username,
}: {
  clientId: string;
  clientName: string;
  username: string;
}) {
  const [password, setPassword] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });

  async function handlePrepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setStatus({
        type: "error",
        message: "Use a password with at least 8 characters.",
      });
      return;
    }

    setIsPreparing(true);
    setShareMessage("");
    setStatus({ type: "progress", message: "Updating client access..." });

    try {
      const result = await prepareClientAccess(clientId, password);
      if (result.error) {
        setStatus({ type: "error", message: result.error });
        return;
      }

      const loginUrl = new URL("/client/login", window.location.origin).toString();
      setShareMessage(
        [
          `Hello ${clientName}, your private gallery is ready.`,
          "",
          `Login link: ${loginUrl}`,
          `Username: ${username}`,
          `Password: ${password}`,
        ].join("\n"),
      );
      setStatus({
        type: "success",
        message: "Access details are ready to copy or share.",
      });
    } catch (error) {
      console.error("Unable to prepare client access", error);
      setStatus({
        type: "error",
        message: "Unable to update the client password. Please try again.",
      });
    } finally {
      setIsPreparing(false);
    }
  }

  async function handleCopy() {
    try {
      await copyText(shareMessage);
      setStatus({ type: "success", message: "Client access details copied." });
      return true;
    } catch {
      setStatus({
        type: "error",
        message: "Copy failed. Select the message and copy it manually.",
      });
      return false;
    }
  }

  async function handleShare() {
    if (!navigator.share) {
      const copied = await handleCopy();
      if (copied) {
        setStatus({
          type: "success",
          message: "Sharing is unavailable on this device, so the details were copied.",
        });
      }
      return;
    }

    try {
      await navigator.share({
        title: `${clientName}'s private gallery`,
        text: shareMessage,
      });
      setStatus({ type: "success", message: "Client access details shared." });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus({ type: "idle", message: "" });
        return;
      }
      setStatus({ type: "error", message: "Unable to open the share menu." });
    }
  }

  function handleGeneratePassword() {
    setPassword(generatePassword());
    setShareMessage("");
    setPasswordVisible(true);
    setStatus({ type: "idle", message: "" });
  }

  return (
    <div className="grid gap-3">
      <div>
        <h4 className="text-sm font-black">Share client access</h4>
        <p className="mt-1 text-xs leading-5 text-black/48">
          Set a new password, then copy the login link and credentials or send
          them through your device&apos;s share menu.
        </p>
      </div>

      <form onSubmit={handlePrepare} className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="grid gap-2 text-xs font-bold">
          New client password
          <span className="relative">
            <input
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setShareMessage("");
                setStatus({ type: "idle", message: "" });
              }}
              type={passwordVisible ? "text" : "password"}
              className="field w-full pr-20"
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
              disabled={isPreparing}
            />
            <span className="absolute right-1 top-1/2 flex -translate-y-1/2">
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="grid size-9 place-items-center rounded-full text-black/45 hover:bg-black/5"
                aria-label="Generate password"
                title="Generate password"
                disabled={isPreparing}
              >
                <RefreshCw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                className="grid size-9 place-items-center rounded-full text-black/45 hover:bg-black/5"
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                disabled={isPreparing}
              >
                {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </span>
        </label>
        <button
          type="submit"
          className="button-secondary self-end disabled:cursor-wait disabled:opacity-60"
          disabled={isPreparing}
        >
          {isPreparing ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
          Prepare sharing
        </button>
      </form>

      {shareMessage ? (
        <div className="grid gap-3">
          <textarea
            value={shareMessage}
            readOnly
            rows={6}
            className="field min-h-36 resize-y text-sm leading-6"
            aria-label="Client access message"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleCopy} className="button-secondary">
              <Copy size={16} /> Copy details
            </button>
            <button type="button" onClick={handleShare} className="button-primary">
              <Share2 size={16} /> Share details
            </button>
          </div>
        </div>
      ) : null}

      {status.type !== "idle" ? (
        <p
          aria-live="polite"
          className={`text-xs font-semibold ${
            status.type === "error"
              ? "text-red-700"
              : status.type === "success"
                ? "text-emerald-700"
                : "text-black/50"
          }`}
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
