import assert from "node:assert/strict";
import test from "node:test";
import { getPaystackMode } from "../src/lib/paystack";
import {
  hasReusablePaymentAuthorization,
  PAYMENT_SESSION_TTL_MS,
} from "../src/lib/payments";

test("detects Paystack configuration mode without exposing the key", () => {
  const original = process.env.PAYSTACK_SECRET_KEY;

  delete process.env.PAYSTACK_SECRET_KEY;
  assert.equal(getPaystackMode(), "unconfigured");

  process.env.PAYSTACK_SECRET_KEY = "sk_test_example";
  assert.equal(getPaystackMode(), "test");

  process.env.PAYSTACK_SECRET_KEY = "sk_live_example";
  assert.equal(getPaystackMode(), "live");

  if (original) process.env.PAYSTACK_SECRET_KEY = original;
  else delete process.env.PAYSTACK_SECRET_KEY;
});

test("reuses only unexpired Paystack authorization URLs", () => {
  const now = Date.now();
  const base = {
    id: "subscription-id",
    transaction_id: "reference",
    authorization_url: "https://checkout.paystack.com/example",
  };

  assert.equal(
    hasReusablePaymentAuthorization(
      {
        ...base,
        expires_at: new Date(now + PAYMENT_SESSION_TTL_MS).toISOString(),
      },
      now,
    ),
    true,
  );
  assert.equal(
    hasReusablePaymentAuthorization(
      {
        ...base,
        expires_at: new Date(now - 1).toISOString(),
      },
      now,
    ),
    false,
  );
  assert.equal(
    hasReusablePaymentAuthorization(
      {
        ...base,
        authorization_url: null,
        expires_at: new Date(now + PAYMENT_SESSION_TTL_MS).toISOString(),
      },
      now,
    ),
    false,
  );
});
