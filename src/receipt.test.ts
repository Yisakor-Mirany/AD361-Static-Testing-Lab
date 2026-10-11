// Unit tests for the grocery receipt program.
//
// Program requirements (from receipt.ts):
//   1. Items can be added to the grocery list.
//   2. Items can be deleted from the grocery list.
//   3. The subtotal is calculated without tax.
//   4. The total is calculated with tax.
//   5. A receipt can be printed.
//
// Conventions used by these tests:
//   - A tax rate is a decimal fraction (0.1 means 10%).
//   - Money values are rounded to 2 decimal places (cents).
//   - The starting list holds 4 items whose prices add up to $47.49.

import {
  addItem,
  deleteItem,
  getItems,
  printReceipt,
  resetItems,
  subtotal,
  tax,
  total,
} from "./fixed_receipt";

const STARTING_SUBTOTAL = 47.49; // 21.99 + 8.75 + 6.75 + 10.00

// Every test starts from the same known grocery list.
beforeEach(() => {
  resetItems();
});

describe("getItems", () => {
  test("returns the 4 starting items", () => {
    expect(getItems()).toEqual([
      { name: "paper towels", price: 21.99 },
      { name: "sandwich", price: 8.75 },
      { name: "eggs", price: 6.75 },
      { name: "avocado oil", price: 10.0 },
    ]);
  });

  test("returns a copy, so callers cannot change the list by accident", () => {
    const items = getItems();
    items.pop();
    expect(getItems()).toHaveLength(4);
  });
});

describe("addItem (requirement 1)", () => {
  // Happy path
  test("adds a new item to the end of the list", () => {
    addItem("milk", 3.49);
    const items = getItems();
    expect(items).toHaveLength(5);
    expect(items[4]).toEqual({ name: "milk", price: 3.49 });
  });

  test("increases the subtotal by the new item's price", () => {
    addItem("milk", 3.49);
    expect(subtotal()).toBe(50.98);
  });

  // Edge cases
  test("allows a free item (price 0)", () => {
    addItem("free sample", 0);
    expect(getItems()).toHaveLength(5);
    expect(subtotal()).toBe(STARTING_SUBTOTAL);
  });

  test("allows two items with the same name", () => {
    addItem("eggs", 6.75);
    expect(getItems().filter((item) => item.name === "eggs")).toHaveLength(2);
  });

  // Unhappy path
  test("rejects an empty item name", () => {
    expect(() => addItem("", 1.0)).toThrow();
    expect(() => addItem("   ", 1.0)).toThrow();
    expect(getItems()).toHaveLength(4);
  });

  test("rejects a negative price", () => {
    expect(() => addItem("refund", -5)).toThrow();
    expect(getItems()).toHaveLength(4);
  });

  test("rejects a price that is not a real number", () => {
    expect(() => addItem("mystery", NaN)).toThrow();
    expect(() => addItem("mystery", Infinity)).toThrow();
    expect(getItems()).toHaveLength(4);
  });
});

describe("deleteItem (requirement 2)", () => {
  // Happy path
  test("deletes the item with the given name", () => {
    expect(deleteItem("sandwich")).toBe(true);
    const names = getItems().map((item) => item.name);
    expect(names).toEqual(["paper towels", "eggs", "avocado oil"]);
  });

  test("deletes an item from the start of the list, not just the end", () => {
    deleteItem("paper towels");
    const names = getItems().map((item) => item.name);
    expect(names).toEqual(["sandwich", "eggs", "avocado oil"]);
  });

  test("lowers the subtotal by the deleted item's price", () => {
    deleteItem("eggs");
    expect(subtotal()).toBe(40.74);
  });

  // Unhappy path
  test("returns false and changes nothing when the item does not exist", () => {
    expect(deleteItem("caviar")).toBe(false);
    expect(getItems()).toHaveLength(4);
  });

  // Edge cases
  test("deletes only one item when two items share a name", () => {
    addItem("eggs", 6.75);
    deleteItem("eggs");
    expect(getItems().filter((item) => item.name === "eggs")).toHaveLength(1);
  });

  test("returns false when the list is already empty", () => {
    deleteItem("paper towels");
    deleteItem("sandwich");
    deleteItem("eggs");
    deleteItem("avocado oil");
    expect(getItems()).toHaveLength(0);
    expect(deleteItem("eggs")).toBe(false);
  });
});

describe("subtotal (requirement 3)", () => {
  // Happy path
  test("adds up the price of every item, without tax", () => {
    expect(subtotal()).toBe(STARTING_SUBTOTAL);
  });

  test("includes every item, not just the first 3", () => {
    addItem("milk", 3.49);
    addItem("bread", 4.0);
    expect(subtotal()).toBe(54.98);
  });

  // Edge cases
  test("is 0 when the list is empty", () => {
    getItems().forEach((item) => deleteItem(item.name));
    expect(subtotal()).toBe(0);
  });

  test("is rounded to cents (no floating point leftovers)", () => {
    getItems().forEach((item) => deleteItem(item.name));
    addItem("a", 0.1);
    addItem("b", 0.2);
    expect(subtotal()).toBe(0.3); // plain JS gives 0.30000000000000004
  });

  test("returns the same value when called twice in a row", () => {
    expect(subtotal()).toBe(subtotal());
  });
});

describe("tax", () => {
  test("is the subtotal multiplied by the tax rate", () => {
    expect(tax(0.1)).toBe(4.75); // 47.49 * 0.1 = 4.749 -> 4.75
  });

  test("is 0 when the tax rate is 0", () => {
    expect(tax(0)).toBe(0);
  });

  test("rejects a negative tax rate", () => {
    expect(() => tax(-0.1)).toThrow();
  });
});

describe("total (requirement 4)", () => {
  // Happy path
  test("is the subtotal plus tax", () => {
    expect(total(0.1)).toBe(52.24); // 47.49 + 4.749 = 52.239 -> 52.24
  });

  test("uses a decimal tax rate, not a flat amount added on", () => {
    // 8% of 47.49 is 3.7992, so the total is 51.2892 -> 51.29.
    // The original code added the rate itself (47.49 + 0.08).
    expect(total(0.08)).toBe(51.29);
  });

  // Edge cases
  test("equals the subtotal when the tax rate is 0", () => {
    expect(total(0)).toBe(STARTING_SUBTOTAL);
  });

  test("is 0 when the list is empty", () => {
    getItems().forEach((item) => deleteItem(item.name));
    expect(total(0.1)).toBe(0);
  });

  // Unhappy path
  test("rejects a negative tax rate", () => {
    expect(() => total(-0.05)).toThrow();
  });

  test("rejects a tax rate that is not a real number", () => {
    expect(() => total(NaN)).toThrow();
  });
});

describe("printReceipt (requirement 5)", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  function printedLines(): string[] {
    return logSpy.mock.calls.map((call) => String(call[0]));
  }

  // Happy path
  test("prints every item, the subtotal, the tax, and the total", () => {
    printReceipt(0.1);
    expect(printedLines()).toEqual([
      "************************",
      "paper towels : $21.99",
      "sandwich : $8.75",
      "eggs : $6.75",
      "avocado oil : $10.00",
      "************************",
      "Subtotal: $47.49",
      "Tax: $4.75",
      "Total: $52.24",
    ]);
  });

  test("includes items that were added", () => {
    addItem("milk", 3.49);
    printReceipt(0);
    expect(printedLines()).toContain("milk : $3.49");
    expect(printedLines()).toContain("Total: $50.98");
  });

  // Edge case
  test("prints a receipt with $0.00 totals when the list is empty", () => {
    getItems().forEach((item) => deleteItem(item.name));
    printReceipt(0.1);
    expect(printedLines()).toEqual([
      "************************",
      "************************",
      "Subtotal: $0.00",
      "Tax: $0.00",
      "Total: $0.00",
    ]);
  });

  // Unhappy path
  test("rejects a negative tax rate and prints nothing", () => {
    expect(() => printReceipt(-1)).toThrow();
    expect(logSpy).not.toHaveBeenCalled();
  });
});