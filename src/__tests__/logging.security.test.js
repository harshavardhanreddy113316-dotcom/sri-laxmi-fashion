import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";

// Guards against the exact regressions that were fixed: logging full order
// payloads (customer name / phone / address) or Razorpay configuration and
// signatures. Static source checks complement the runtime checks in
// checkout.order.test.jsx.
//
// `client/` is the git repository root, so `../../server/server.js` is the
// tracked backend copy. The sibling `../../../server/server.js` is a local
// duplicate that is not part of the repository and is only checked when
// present.
const SOURCE_PATHS = {
  checkout: "../pages/Checkout.jsx",
  server: "../../server/server.js",
  localServer: "../../../server/server.js",
};

const readIfExists = (relativePath) => {
  const url = new URL(relativePath, import.meta.url);
  return existsSync(url) ? readFileSync(url, "utf8") : null;
};

// Matches a console call whose logged value appears within 60 characters,
// which is comfortably inside a single logging statement.
const logs = (value) =>
  new RegExp(`console\\.\\w+\\([^;]{0,60}?${value}`);

describe("Static privacy guards in source files", () => {
  it("Checkout.jsx never logs the order payload or customer fields", () => {
    const source = readIfExists(SOURCE_PATHS.checkout);
    expect(source).toBeTruthy();

    expect(source).not.toMatch(logs("orderToSave"));
    expect(source).not.toMatch(logs("newOrder"));
    expect(source).not.toMatch(logs("toFirestoreSafe"));
    expect(source).not.toMatch(logs("customerName"));
    expect(source).not.toMatch(logs("landmark"));
  });

  it("Checkout.jsx never logs Razorpay configuration or signatures", () => {
    const source = readIfExists(SOURCE_PATHS.checkout);
    expect(source).toBeTruthy();

    expect(source).not.toMatch(logs("import\\.meta\\.env"));
    expect(source).not.toMatch(logs("VITE_RAZORPAY_KEY_ID"));
    expect(source).not.toMatch(logs("razorpay_signature"));
  });

  it("no backend file logs Razorpay keys, secrets, or env values", () => {
    const sources = [
      readIfExists(SOURCE_PATHS.server),
      readIfExists(SOURCE_PATHS.localServer),
    ].filter(Boolean);

    expect(sources.length).toBeGreaterThan(0);

    for (const source of sources) {
      expect(source).not.toMatch(logs("RAZORPAY_KEY_ID"));
      expect(source).not.toMatch(logs("RAZORPAY_KEY_SECRET"));
      expect(source).not.toMatch(logs("process\\.env"));
      expect(source).not.toMatch(logs("razorpay_signature"));
    }
  });

  it("Checkout.jsx keeps surfacing Firestore write failures to the customer", () => {
    const source = readIfExists(SOURCE_PATHS.checkout);
    expect(source).toBeTruthy();

    expect(source).toContain(
      "could not save your order"
    );
  });
});
