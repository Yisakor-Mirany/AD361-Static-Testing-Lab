# Issue Log: `src/receipt.ts`

This log records every problem found in the original `src/receipt.ts`. The original file was **not modified**. All fixes go in `src/fixed_receipt.ts`.

## How the issues were found

| Technique | Command / method | Evidence |
|---|---|---|
| Dynamic testing (Jest) | `npx jest receipt.test.ts` with the tests importing `./receipt` | `screenshots/01-original-jest-failing.png` |
| Static analysis (ESLint) | `npx eslint src/receipt.ts` | `screenshots/02-original-eslint.png` |
| Static analysis (TypeScript compiler) | `npx tsc --noEmit --strict src/receipt.ts` | `screenshots/03-original-tsc.png` |
| ESLint, second pass | `npx eslint review/receipt_syntax_only.ts` | `screenshots/04-syntax-only-eslint.png` |
| TypeScript compiler, second pass | `npx tsc --noEmit --strict review/receipt_syntax_only.ts` | `screenshots/05-syntax-only-tsc.png` |
| Manual code review | Read the code line by line against the 5 requirements | This log |

**Why a second pass was needed:** ESLint stops at the first parse error. On the original file it reports only **one** problem (`17:27 Parsing error: ':' expected`). I made a copy, `review/receipt_syntax_only.ts`, and fixed **only** the 3 syntax errors (lines 17, 48 and 49) so ESLint and `tsc` could report the problems hidden behind the parse error. The copy has the same line numbers as the original.

## Root cause, error, defect, and failure: examples from this code

| Term | Meaning | Example from `receipt.ts` |
|---|---|---|
| **Error** (mistake) | A human mistake made while writing the code | The developer believed `ITEMS.indexOf("name")` finds an item by its name. It actually searches the array for the literal string `"name"`. They also believed `ITEMS.pop()` removes the chosen item, but it always removes the last one. |
| **Defect** (fault / bug) | The wrong code that the mistake left in the program | Line 23, `ITEMS.pop();`, in `deleteItem`. The `name` parameter is never used, so the function cannot delete the right item. |
| **Failure** | The incorrect behavior a user sees when the defect runs | Once the syntax errors are fixed and the code runs, `deleteItem("sandwich")` leaves the sandwich in the list and removes **avocado oil** instead. `printReceipt` prints the source code of the `total` function as the subtotal, then crashes with `TypeError: 3 is not iterable`. |
| **Root cause** | The underlying reason the mistakes happened and were not caught | The code was never compiled, linted, or tested before it was handed in. The final comment says AI was used to "clean up" the code, but nobody checked the AI's output. Running `tsc` or `eslint` once would have found the syntax errors right away, and one unit test for `deleteItem` would have caught the wrong-item bug. **Prevention:** run `npm test` and `npm run lint` before every commit, and review AI-generated code like any other code. |

## Issues

**Type** is one of: **Syntax** (the file won't compile), **Logic** (wrong result), **Clarity** (unclear or hard-to-maintain code), or **Requirement** (breaks one of the 5 program requirements). **Found by** names the tool or method that revealed the issue.

| # | Location | Type | Issue | Explanation | Suggested Fix | Found by | Status |
|---|---|---|---|---|---|---|---|
| 1 | Line 17 | Syntax | `{ "name" = name, "price" = price }` uses `=` inside an object literal | Object properties are written `key: value`. `=` is a parse error (TS1005 `':' expected`), so the **whole file fails to compile** and no test can run. | `{ name: name, price: price }` or the shorthand `{ name, price }` | tsc, ESLint, Jest | Fixed |
| 2 | Line 48 | Syntax | `` `Tax: $ + ${String(taxRate)}" `` opens with a backtick but closes with `"` | The template literal is never closed, so the next line fails to parse as well. | Close it with a backtick | tsc, manual review | Fixed |
| 3 | Line 49 | Syntax | `` `Total: $ + ${tax(...)}" `` has the same mismatched quotes | Same as #2. It causes TS1005, TS1002 (`Unterminated string literal`) and TS1128 (`Declaration or statement expected`) on line 50. | Close it with a backtick | tsc, manual review | Fixed |
| 4 | Line 12 | Logic | Stray `,` on its own line inside the `ITEMS` array | It creates an empty slot (a "hole"). `ITEMS[3]` is `undefined`, the array has 5 slots for 4 items, and code that reads `.price` on that slot crashes. ESLint: `no-sparse-arrays`. tsc: `Object is possibly 'undefined'` (TS2532). | Delete the stray comma | ESLint (2nd pass), tsc (2nd pass) | Fixed |
| 5 | Line 22 | Logic | `ITEMS.indexOf("name")` searches for the literal string `"name"` | `ITEMS` holds objects, so `indexOf` with a string always returns `-1`. It also ignores the `name` parameter (quotes turn a variable name into a string). tsc: TS2345. | `ITEMS.findIndex((item) => item.name === name)` | tsc (2nd pass), manual review | Fixed |
| 6 | Lines 21–22 | Clarity | Parameter `name` and variable `idx` are never used | Unused variables are dead code and signal a bug: the function computes an index and then never uses it. ESLint: `@typescript-eslint/no-unused-vars` (×2). | Use the index found in #5 | ESLint (2nd pass) | Fixed |
| 7 | Line 23 | Logic / Requirement 2 | `ITEMS.pop()` always removes the **last** item | `deleteItem("sandwich")` removes avocado oil instead. Requirement 2 ("Items can be deleted") is not met. | `ITEMS.splice(index, 1)` using the index from #5 | Manual review | Fixed |
| 8 | Lines 21–25 | Logic | Deleting an item that does not exist still removes an item | No "not found" check. `deleteItem("caviar")` would silently delete the last item. | If `index === -1`, return `false` and change nothing. Return `true` when an item is deleted. | Manual review | Fixed |
| 9 | Line 24 | Clarity | `deleteItem` returns the internal `ITEMS` array | Callers get a live reference and can change the grocery list without going through `addItem` or `deleteItem`. The return value is also inconsistent with `addItem`, which returns nothing. | Return a `boolean`. Add a separate `getItems()` that returns a copy of the list. | Manual review | Fixed |
| 10 | Line 28 | Logic | `for (const i of 3)` | A number can't be looped over. tsc: TS2495. At runtime: `TypeError: 3 is not iterable`. | `for (const item of ITEMS)` | tsc (2nd pass), manual review | Fixed |
| 11 | Line 28 | Logic / Requirement 3 | Hard-coded `3` would only add up the first 3 items | Even if the loop worked, avocado oil and any newly added items would be left out of the subtotal. | Loop over every item in the list | Manual review | Fixed |
| 12 | Line 29 | Logic | `total = total + ITEMS[i]["price"]` assigns to the function's own name | There is no running-sum variable. This overwrites the exported `total` function. tsc: TS2630 `Cannot assign to 'total' because it is a function` and TS2365. | Declare `let sum = 0;` and add to `sum` | tsc (2nd pass), manual review | Fixed |
| 13 | Line 31 | Logic | `return total;` returns the function, not a number | Callers get a function object instead of a price. | `return sum;` | Manual review | Fixed |
| 14 | Line 27 | Clarity / Requirement 3 & 4 | The function named `total()` actually calculates the **subtotal** | The requirements say the *subtotal* is without tax and the *total* is with tax. Calling the subtotal `total` is misleading and leaves no correctly named function for either requirement. | Rename it to `subtotal()`. Add `total(taxRate)` for the amount with tax. | Manual review | Fixed |
| 15 | Line 35 | Logic / Requirement 4 | `total() + taxRate` **adds** the rate instead of multiplying | With an 8% rate the result would be `47.49 + 0.08 = 47.57` instead of `51.29`. tsc: TS2365. | `subtotal() * taxRate` for the tax amount, and `subtotal() + tax` for the total | tsc (2nd pass), manual review | Fixed |
| 16 | Lines 34–36 | Clarity | Function `tax` declares a local variable also named `tax`, and its intended result is the total, not the tax | Reusing the function's name for a variable is confusing. Callers can't tell whether `tax()` returns the tax amount or the total. | `tax(taxRate)` returns only the tax amount. `total(taxRate)` returns subtotal + tax. | Manual review | Fixed |
| 17 | Line 42 | Logic | `for (const i of ITEMS)` then uses `ITEMS[i]` | `for...of` gives the **item**, not an index, so `ITEMS[i]` is wrong. ESLint reports `i` as unused (because of #18). | `for (const item of ITEMS)` and use `item.name`, `item.price` | ESLint (2nd pass), manual review | Fixed |
| 18 | Line 43 | Logic / Requirement 5 | `'${ITEMS[i][name]} : $${ITEMS[i][price]}}'` uses single quotes | `${...}` only works inside backticks, so the receipt prints the literal text `${ITEMS[i][name]} : $${ITEMS[i][price]}}` for every item. The line also has an extra `}`, and `[name]`/`[price]` without quotes would be variable lookups, not property names. | `` `${item.name} : $${item.price.toFixed(2)}` `` | Manual review | Fixed |
| 19 | Line 47 | Logic / Requirement 5 | `String(total)` converts the function itself to text | The receipt prints `Subtotal: $function total() { ... }`, which is the source code, instead of a number. | Call the function: `subtotal()` | Manual review | Fixed |
| 20 | Line 48 | Logic / Requirement 5 | The "Tax" line prints the tax **rate** and a stray `" + "` | It prints `Tax: $ + 0.1` instead of the tax amount in dollars. | `` `Tax: $${tax(taxRate).toFixed(2)}` `` | Manual review | Fixed |
| 21 | Line 49 | Logic | `tax(String(taxRate))` passes a string where a number is expected | tsc: TS2345. At runtime `+` would join strings (`"47.49" + "0.1"` → `"47.490.1"`) instead of adding numbers. | Pass the number: `total(taxRate)` | tsc (2nd pass), manual review | Fixed |
| 22 | Lines 16–19, 34–50 | Logic | No input validation | Negative prices, empty names, `NaN` prices, or a negative or `NaN` tax rate are all accepted and give nonsense totals. | Throw an `Error` for an empty name, a negative or non-finite price, or a negative or non-finite tax rate | Manual review, unit tests | Fixed |
| 23 | Lines 27–50 | Logic | No rounding of money values | Floating-point maths gives values like `0.1 + 0.2 = 0.30000000000000004`, and prices would print as `10` instead of `10.00`. | Round to cents with `Math.round(x * 100) / 100` and display with `toFixed(2)` | Manual review, unit tests | Fixed |
| 24 | Lines 8–14, 16 | Clarity | No type for an item, and no return types on functions | Without an `Item` type, mistakes like #5 and #21 are harder to spot. `ITEMS` is written in UPPER_CASE (a constant style) but it is changed at runtime. | Add `interface Item { name: string; price: number }`, use `Item[]`, add return types, and name the list `items` | Manual review | Fixed |
| 25 | Whole file | Clarity | Shared global list with no way to read or reset it | Tests can't check the list or start from a known state, so the module is hard to test. | Add `getItems()` (returns a copy) and `resetItems()` | Manual review, writing tests | Fixed |
| 26 | Line 52 | Clarity | `// AI transparency: AI was used to clean up this code.` | The comment claims the code was cleaned up, but the file doesn't compile. It says nothing about what the AI changed or how the result was checked. | Replace it with an accurate statement (see the README AI transparency section) and verify AI output before submitting | Manual review | Fixed |

## Summary

| Type | Count |
|---|---|
| Syntax | 3 |
| Logic (including requirement violations) | 16 |
| Clarity | 7 |
| **Total** | **26** |

Requirement violations: #7 (requirement 2), #11 and #14 (requirement 3), #14 and #15 (requirement 4), and #18–#20 (requirement 5). Requirement 1 (add items) is blocked by syntax error #1.
## Verification of fixes

All 26 issues are fixed in `src/fixed_receipt.ts`. After the import in `src/receipt.test.ts` was changed from `./receipt` to `./fixed_receipt`:

- `npx jest receipt.test.ts --verbose`: **33 passed, 33 total** (`screenshots/06-final-jest-passing.png`). Coverage of `fixed_receipt.ts` is 100% of statements, branches, functions, and lines.
- `npx eslint src/fixed_receipt.ts`: **0 problems**.
- `npx tsc --noEmit --strict src/fixed_receipt.ts`: **0 errors**.

No test was weakened to make it pass. The tests were written from the requirements first, then run against the original code, where they failed (`screenshots/01-original-jest-failing.png`).
