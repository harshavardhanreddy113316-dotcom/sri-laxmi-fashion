import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { toast } from "react-toastify";
import {
  collection,
  addDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import Checkout from "../pages/Checkout";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  ToastContainer: () => null,
}));

vi.mock("../firebase", () => ({ db: {} }));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((_db, name) => ({ path: name })),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDoc: vi.fn(),
}));

vi.mock("axios", () => ({ default: { post: vi.fn() } }));

const cartItems = [
  {
    id: "prod-1",
    name: "Silk Saree",
    price: 999,
    quantity: 1,
    image: "",
  },
];

let clearCart;
let capturedOptions;

// Stands in for the real Razorpay checkout widget: it only captures the
// options object so tests can invoke the payment-success handler directly.
// No network request and no real payment is ever made.
class FakeRazorpay {
  constructor(options) {
    capturedOptions = options;
  }

  on() {}

  open() {}
}

function fillAddressForm({ landmark } = {}) {
  fireEvent.change(
    screen.getByPlaceholderText("Full Name"),
    { target: { value: "Test Customer" } }
  );
  fireEvent.change(
    screen.getByPlaceholderText("Mobile Number"),
    { target: { value: "9876543210" } }
  );
  fireEvent.change(
    screen.getByPlaceholderText("House / Flat No"),
    { target: { value: "12-3-45" } }
  );
  fireEvent.change(
    screen.getByPlaceholderText("Street / Area"),
    { target: { value: "Main Street" } }
  );
  fireEvent.change(
    screen.getByPlaceholderText("Village / Town / City"),
    { target: { value: "Guntur" } }
  );
  fireEvent.change(
    screen.getByPlaceholderText("District"),
    { target: { value: "Guntur" } }
  );
  fireEvent.change(
    screen.getByPlaceholderText("State"),
    { target: { value: "Andhra Pradesh" } }
  );
  fireEvent.change(
    screen.getByPlaceholderText("PIN Code"),
    { target: { value: "522001" } }
  );
  if (landmark) {
    fireEvent.change(
      screen.getByPlaceholderText("Landmark (Optional)"),
      { target: { value: landmark } }
    );
  }
}

function renderCheckout() {
  clearCart = vi.fn();
  return render(
    <CartContext.Provider
      value={{ cartItems, clearCart }}
    >
      <Checkout />
    </CartContext.Provider>
  );
}

// Fills the checkout form and clicks "Pay Securely", which must reach the
// point where the Razorpay options are built. Returns once the options
// (and therefore the payment handler) are captured.
async function startPayment(options) {
  fillAddressForm(options);
  fireEvent.click(
    screen.getByRole("button", { name: /Pay Securely/ })
  );
  await waitFor(() => expect(capturedOptions).toBeTruthy());
}

const fakePaymentResponse = {
  razorpay_order_id: "rzp_order_test_1",
  razorpay_payment_id: "rzp_payment_test_1",
  razorpay_signature: "test_signature",
};

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  capturedOptions = undefined;
  window.Razorpay = FakeRazorpay;

  collection.mockImplementation((_db, name) => ({
    path: name,
  }));
  axios.post.mockResolvedValue({
    data: {
      id: "rzp_order_test_1",
      amount: 99900,
      currency: "INR",
    },
  });
  addDoc.mockResolvedValue({ id: "firestore-doc-1" });
  getDoc.mockResolvedValue({ exists: () => false });
  updateDoc.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Checkout order payload", () => {
  it("includes every delivery address field in the Firestore payload", async () => {
    renderCheckout();
    await startPayment();

    await capturedOptions.handler(fakePaymentResponse);

    expect(addDoc).toHaveBeenCalledTimes(1);
    const [collectionRef, payload] = addDoc.mock.calls[0];

    // column-name matching: these are exactly the fields Admin.jsx reads
    expect(collectionRef).toEqual({ path: "orders" });
    expect(payload).toMatchObject({
      customerName: "Test Customer",
      phone: "9876543210",
      house: "12-3-45",
      street: "Main Street",
      city: "Guntur",
      district: "Guntur",
      stateName: "Andhra Pradesh",
      pincode: "522001",
      landmark: "",
      paymentStatus: "Paid",
      status: "Pending",
      razorpayOrderId: "rzp_order_test_1",
      razorpayPaymentId: "rzp_payment_test_1",
    });
    expect(payload.orderId).toMatch(/^SLF\d+/);
    expect(payload.total).toBe(999);
  });

  it("keeps the full address after toFirestoreSafe conversion (no field is dropped)", async () => {
    renderCheckout();
    await startPayment();

    await capturedOptions.handler(fakePaymentResponse);

    const payload = addDoc.mock.calls[0][1];
    const addressKeys = [
      "house",
      "street",
      "city",
      "district",
      "stateName",
      "pincode",
    ];
    for (const key of addressKeys) {
      expect(payload).toHaveProperty(key);
      expect(typeof payload[key]).toBe("string");
      expect(payload[key].length).toBeGreaterThan(0);
    }
  });
});

describe("Payment / order integrity", () => {
  it("does not save an order before the payment success handler runs", async () => {
    renderCheckout();
    await startPayment();

    expect(addDoc).not.toHaveBeenCalled();
    expect(clearCart).not.toHaveBeenCalled();
  });

  it("saves the order only once after a successful payment", async () => {
    renderCheckout();
    await startPayment();

    await capturedOptions.handler(fakePaymentResponse);

    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(clearCart).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("lastOrderId")).toMatch(
      /^SLF\d+/
    );
  });

  it("surfaces a Firestore write failure instead of pretending the order succeeded", async () => {
    addDoc.mockRejectedValueOnce(
      new Error("firestore permission denied")
    );

    renderCheckout();
    await startPayment();
    await capturedOptions.handler(fakePaymentResponse);

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/could not save your order/)
    );
    // the customer's cart and confirmation id must not be cleared/committed
    expect(clearCart).not.toHaveBeenCalled();
    expect(localStorage.getItem("lastOrderId")).toBeNull();
  });

  it("never saves an order when the payment never completes", async () => {
    renderCheckout();
    await startPayment();

    // user closed the modal: handler was never invoked
    expect(addDoc).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe("Privacy: no customer data or secrets are logged", () => {
  it("logs no customer name, phone, address, or Razorpay key id", async () => {
    const spies = [
      vi.spyOn(console, "log").mockImplementation(() => {}),
      vi.spyOn(console, "warn").mockImplementation(() => {}),
      vi.spyOn(console, "error").mockImplementation(() => {}),
    ];

    renderCheckout();
    await startPayment({ landmark: "Near SBI ATM" });
    await capturedOptions.handler(fakePaymentResponse);

    const loggedText = spies
      .flatMap((spy) => spy.mock.calls)
      .flat()
      .map((arg) => {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(" ");

    expect(loggedText).not.toContain("Test Customer");
    expect(loggedText).not.toContain("9876543210");
    expect(loggedText).not.toContain("12-3-45");
    expect(loggedText).not.toContain("Main Street");
    expect(loggedText).not.toContain("522001");
    expect(loggedText).not.toContain("Near SBI ATM");
    expect(loggedText).not.toMatch(/key[ _-]?id/i);
    // the payment signature must never be printed
    expect(loggedText).not.toContain(
      fakePaymentResponse.razorpay_signature
    );

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (keyId) {
      expect(loggedText).not.toContain(keyId);
    }
  });
});
