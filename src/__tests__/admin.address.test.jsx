import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  act,
} from "@testing-library/react";
import { onSnapshot } from "firebase/firestore";
import { getProducts } from "../services/productService";
import Admin from "../pages/Admin";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  ToastContainer: () => null,
}));

vi.mock("../firebase", () => ({ db: {} }));

vi.mock("../services/productService", () => ({
  getProducts: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock("../components/AddProductModal", () => ({
  default: () => null,
}));

vi.mock("../components/EditProductModal", () => ({
  default: () => null,
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((_db, name) => ({ path: name })),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

// Field names below are exactly the ones Checkout.jsx writes for every order.
const pendingOrder = {
  id: "doc-pending",
  orderId: "SLF10001",
  customerName: "Test Customer",
  phone: "9876543210",
  house: "12-3-45",
  street: "Main Street",
  city: "Guntur",
  district: "Guntur",
  stateName: "Andhra Pradesh",
  pincode: "522001",
  items: [{ name: "Silk Saree", quantity: 1 }],
  total: 999,
  status: "Pending",
  date: "1/10/2026",
};

const deliveredOrder = {
  id: "doc-delivered",
  orderId: "SLF10002",
  customerName: "Delivered Customer",
  phone: "9000000001",
  house: "4-2-10",
  street: "Market Road",
  city: "Vijayawada",
  district: "Krishna",
  stateName: "Andhra Pradesh",
  pincode: "520001",
  items: [{ name: "Kurta", quantity: 2 }],
  total: 1499,
  status: "Delivered",
  date: "2/10/2026",
};

// Historical document without any address keys (must not crash the UI).
const legacyOrder = {
  id: "doc-legacy",
  orderId: "SLF90001",
  customerName: "Legacy Customer",
  phone: "9000000002",
  items: [{ name: "Dupatta", quantity: 1 }],
  total: 299,
  status: "Pending",
  date: "3/10/2026",
};

async function renderAdmin(orders) {
  onSnapshot.mockImplementation((_ref, onResult) => {
    onResult({
      docs: orders.map((order) => ({
        id: order.id,
        data: () => order,
      })),
    });
    return () => {};
  });

  const utils = render(<Admin />);
  // flush the async product load inside act to keep the console clean
  await act(async () => {});
  return utils;
}

function clickSidebar(container, label) {
  const sidebar = container.querySelector(".admin-sidebar");
  fireEvent.click(
    within(sidebar).getByRole("button", { name: label })
  );
}

function addressTexts(container) {
  return [...container.querySelectorAll(".admin-order-meta")]
    .map((el) => el.textContent)
    .join(" | ");
}

function findAddressBlock(container, needle) {
  return [...container.querySelectorAll(".admin-order-meta")].find(
    (el) => el.textContent.includes(needle)
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  getProducts.mockResolvedValue([]);
});

describe("Admin order cards: delivery address", () => {
  it("shows the delivery address on pending order cards", async () => {
    const { container } = await renderAdmin([pendingOrder]);

    clickSidebar(container, /Pending/);

    const texts = addressTexts(container);
    expect(texts).toContain("12-3-45, Main Street");
    expect(texts).toContain("Guntur, Guntur");
    expect(texts).toContain("Andhra Pradesh - 522001");
  });

  it.each([
    ["Packed", "SLF20001"],
    ["Shipped", "SLF20002"],
  ])(
    "shows the delivery address on %s order cards",
    async (status, orderId) => {
      const { container } = await renderAdmin([
        { ...pendingOrder, id: `doc-${status}`, orderId, status },
      ]);

      clickSidebar(container, /Pending/);

      const texts = addressTexts(container);
      expect(texts).toContain("12-3-45, Main Street");
      expect(texts).toContain("Guntur, Guntur");
      expect(texts).toContain("Andhra Pradesh - 522001");
    }
  );

  it("shows the delivery address on delivered order cards", async () => {
    const { container } = await renderAdmin([deliveredOrder]);

    clickSidebar(container, /Delivered/);

    const texts = addressTexts(container);
    expect(texts).toContain("4-2-10, Market Road");
    expect(texts).toContain("Vijayawada, Krishna");
    expect(texts).toContain("Andhra Pradesh - 520001");
  });

  it("renders a partially populated address without broken separators", async () => {
    const partial = {
      ...legacyOrder,
      id: "doc-partial",
      orderId: "SLF90002",
      city: "Nellore",
      pincode: "524001",
    };

    const { container } = await renderAdmin([partial]);
    clickSidebar(container, /Pending/);

    const block = findAddressBlock(container, "Nellore");
    expect(block).toBeTruthy();
    expect(block.textContent).toContain("Nellore");
    expect(block.textContent).toContain("524001");
    // no dangling separators, no undefined/null text
    expect(block.textContent).not.toMatch(/ - | , |, ,/);
    expect(block.textContent).not.toMatch(/undefined|null|NaN/);
  });

  it("treats whitespace-only address fields as missing", async () => {
    const blank = {
      ...legacyOrder,
      id: "doc-blank",
      orderId: "SLF90003",
      house: "   ",
      street: "\t",
      city: " ",
      district: "",
      stateName: "  ",
      pincode: "",
      landmark: " ",
    };

    const { container } = await renderAdmin([blank]);
    clickSidebar(container, /Pending/);

    expect(
      screen.getByText("Address not on file")
    ).toBeInTheDocument();
  });

  it("preserves special characters and shows an optional landmark when present", async () => {
    const special = {
      id: "doc-special",
      orderId: "SLF90004",
      customerName: "Special Customer",
      phone: "9000000003",
      house: "12/3-45 (A&B)",
      street: "St. Mary's Rd, #2",
      city: "Nellore",
      district: "S.P.S.R Nellore",
      stateName: "Andhra Pradesh",
      pincode: "524001",
      landmark: "Opp. RTC Bus Stand",
      items: [{ name: "Saree", quantity: 1 }],
      total: 100,
      status: "Delivered",
      date: "4/10/2026",
    };

    const { container } = await renderAdmin([special]);
    clickSidebar(container, /Delivered/);

    const block = findAddressBlock(container, "A&B");
    expect(block).toBeTruthy();
    expect(block.textContent).toContain("12/3-45 (A&B)");
    expect(block.textContent).toContain("St. Mary's Rd, #2");
    expect(block.textContent).toContain("Landmark: Opp. RTC Bus Stand");
  });

  it("does not invent a landmark line when the landmark is absent", async () => {
    const { container } = await renderAdmin([pendingOrder]);

    clickSidebar(container, /Pending/);

    expect(addressTexts(container)).not.toContain("Landmark:");
  });

  it("renders 'Address not on file' for a pending order without address fields", async () => {
    const { container } = await renderAdmin([legacyOrder]);

    clickSidebar(container, /Pending/);

    expect(
      screen.getByText("Address not on file")
    ).toBeInTheDocument();
    // no broken ", / , / - " placeholder fragments are rendered
    expect(addressTexts(container)).not.toContain(" - ");
  });

  it("renders 'Address not on file' for a delivered order without address fields", async () => {
    const { container } = await renderAdmin([
      { ...legacyOrder, status: "Delivered" },
    ]);

    clickSidebar(container, /Delivered/);

    expect(
      screen.getByText("Address not on file")
    ).toBeInTheDocument();
  });
});

describe("Dashboard → Recent Orders: delivery address access", () => {
  it("shows a compact summary and reveals the full address on demand", async () => {
    const { container } = await renderAdmin([pendingOrder]);

    // compact locality summary is visible without expanding anything
    expect(
      screen.getByText("Guntur, Andhra Pradesh - 522001")
    ).toBeInTheDocument();

    // the full street address is not on screen until requested
    expect(
      container.querySelector(".db-address-details")
    ).toBeNull();
    expect(
      screen.queryByText("12-3-45, Main Street")
    ).toBeNull();

    const toggle = screen.getByRole("button", {
      name: "View Address",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);

    const details = container.querySelector(".db-address-details");
    expect(details).not.toBeNull();
    expect(details.textContent).toContain("12-3-45, Main Street");
    expect(details.textContent).toContain("Guntur, Guntur");
    expect(details.textContent).toContain("Andhra Pradesh - 522001");
    expect(details.textContent).not.toMatch(/undefined|null/);
    expect(
      screen.getByRole("button", { name: "Hide Address" })
    ).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(
      screen.getByRole("button", { name: "Hide Address" })
    );
    expect(
      container.querySelector(".db-address-details")
    ).toBeNull();
  });

  it("offers no View Address action and shows a fallback when the address is missing", async () => {
    await renderAdmin([legacyOrder]);

    expect(
      screen.getByText("Address not on file")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /View Address/ })
    ).toBeNull();
  });

  it("only expands the row that was clicked", async () => {
    const { container } = await renderAdmin([
      pendingOrder,
      { ...deliveredOrder },
    ]);

    const toggles = screen.getAllByRole("button", {
      name: "View Address",
    });
    expect(toggles).toHaveLength(2);

    fireEvent.click(toggles[0]);

    const detailsRows = container.querySelectorAll(
      ".db-address-details"
    );
    expect(detailsRows).toHaveLength(1);
    expect(detailsRows[0].textContent).toContain(
      "12-3-45, Main Street"
    );
    expect(detailsRows[0].textContent).not.toContain(
      "4-2-10, Market Road"
    );
  });

  it("does not crash the dashboard when an order document lacks address fields", async () => {
    await renderAdmin([legacyOrder, pendingOrder]);

    expect(
      screen.getByText(/Welcome back/)
    ).toBeInTheDocument();
    expect(
      screen.getByText("SLF90001")
    ).toBeInTheDocument();
  });

  it("renders order addresses from Firestore only, never from stale localStorage", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          id: "stale",
          orderId: "SLF00000",
          customerName: "Stale Customer",
          house: "Stale House",
        },
      ])
    );

    const { container } = await renderAdmin([pendingOrder]);

    clickSidebar(container, /Pending/);

    expect(screen.queryByText("SLF00000")).toBeNull();
    expect(
      screen.queryByText("Stale Customer")
    ).toBeNull();
    expect(addressTexts(container)).toContain(
      "12-3-45, Main Street"
    );
  });
});
