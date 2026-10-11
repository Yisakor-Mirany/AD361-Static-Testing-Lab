// Program requirements:
// Items can be added to the grocery list.
// Items can be deleted from the grocery list.
// The subtotal is calculated without tax.
// The total is calculated with tax.
// A receipt can be printed.
//
// Corrected version of receipt.ts. See issue_log.md for every change.
// A tax rate is a decimal fraction: 0.1 means 10%.

export interface Item {
  name: string;
  price: number;
}

const STARTING_ITEMS: Item[] = [
  { name: "paper towels", price: 21.99 },
  { name: "sandwich", price: 8.75 },
  { name: "eggs", price: 6.75 },
  { name: "avocado oil", price: 10.0 },
];

let items: Item[] = [];
resetItems();

// Rounds a money amount to whole cents, e.g. 4.749 -> 4.75.
function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

// Formats a money amount for the receipt, e.g. 10 -> "$10.00".
function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function checkTaxRate(taxRate: number): void {
  if (!Number.isFinite(taxRate) || taxRate < 0) {
    throw new Error(`Tax rate must be a number that is 0 or more, got ${taxRate}`);
  }
}

// Puts the grocery list back to the starting items.
export function resetItems(): void {
  items = STARTING_ITEMS.map((item) => ({ ...item }));
}

// Returns a copy of the grocery list, so callers cannot change it directly.
export function getItems(): Item[] {
  return items.map((item) => ({ ...item }));
}

export function addItem(name: string, price: number): void {
  if (name.trim() === "") {
    throw new Error("Item name must not be empty");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`Price must be a number that is 0 or more, got ${price}`);
  }
  items.push({ name, price });
}

// Deletes the first item with the given name.
// Returns true if an item was deleted, or false if no item had that name.
export function deleteItem(name: string): boolean {
  const index = items.findIndex((item) => item.name === name);
  if (index === -1) {
    return false;
  }
  items.splice(index, 1);
  return true;
}

// Sum of all item prices, without tax.
export function subtotal(): number {
  let sum = 0;
  for (const item of items) {
    sum = sum + item.price;
  }
  return roundToCents(sum);
}

// Tax amount only: subtotal x tax rate.
export function tax(taxRate: number): number {
  checkTaxRate(taxRate);
  return roundToCents(subtotal() * taxRate);
}

// Subtotal plus tax.
export function total(taxRate: number): number {
  return roundToCents(subtotal() + tax(taxRate));
}

export function printReceipt(taxRate: number): void {
  // Calculate everything first so a bad tax rate throws before anything prints.
  const receiptTotal = total(taxRate);

  console.log("************************");
  for (const item of items) {
    console.log(`${item.name} : ${formatMoney(item.price)}`);
  }
  console.log("************************");
  console.log(`Subtotal: ${formatMoney(subtotal())}`);
  console.log(`Tax: ${formatMoney(tax(taxRate))}`);
  console.log(`Total: ${formatMoney(receiptTotal)}`);
}