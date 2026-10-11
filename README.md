# AD361 – Introduction to Testing and Static Testing Lab

A TypeScript lab for AD361 that combines **dynamic testing** (Jest unit tests) with **static testing** (manual code review, the TypeScript compiler, and ESLint) on a small grocery receipt program.

The starting file, `src/receipt.ts`, was supplied with the assignment and is kept **unchanged**. It contains syntax errors, logic defects, and requirement violations. This project finds those problems, documents them in `issue_log.md`, and fixes them in a separate file, `src/fixed_receipt.ts`.

## Program requirements

1. Items can be added to the grocery list.
2. Items can be deleted from the grocery list.
3. The subtotal is calculated without tax.
4. The total is calculated with tax.
5. A receipt can be printed.

## Results at a glance

| Check | Original `receipt.ts` | `fixed_receipt.ts` |
|---|---|---|
| Jest | ❌ Test suite failed to run (0 tests ran) | ✅ 33 / 33 tests pass, 100% coverage |
| ESLint | ❌ 1 parsing error (line 17). Second pass after fixing only the syntax: 4 more errors | ✅ 0 problems |
| TypeScript compiler (strict) | ❌ 8 syntax errors. Second pass after fixing only the syntax: 7 type errors | ✅ 0 errors |
| Issues in `issue_log.md` | 26 found (3 syntax, 16 logic, 7 clarity) | 26 Fixed |

## Project structure

```
AD361-Static-Testing-Lab/
├── src/
│   ├── receipt.ts              # Original assignment code (UNCHANGED, does not compile)
│   ├── fixed_receipt.ts        # Corrected implementation
│   └── receipt.test.ts         # Jest tests: happy path, unhappy path, edge cases
├── review/
│   └── receipt_syntax_only.ts  # Copy of receipt.ts with ONLY the 3 syntax errors fixed (for the 2nd ESLint pass)
├── screenshots/                # Evidence of the original and final results
├── issue_log.md                # Code review log: Location, Issue, Explanation, Suggested Fix, Status
├── README.md
├── package.json                # Scripts and dev dependencies
├── jest.config.js              # Jest + ts-jest configuration
├── tsconfig.json               # TypeScript configuration (strict mode)
├── eslint.config.mjs           # ESLint configuration (eslint recommended + typescript-eslint)
└── .gitignore
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (included with Node.js)
- Git

## Installation

```bash
git clone https://github.com/Yisakor-Mirany/AD361-Static-Testing-Lab.git
cd AD361-Static-Testing-Lab
npm install
```

## Testing and linting commands

| Command | What it does |
|---|---|
| `npx jest receipt.test.ts` or `npm test` | Runs the unit tests against `src/fixed_receipt.ts` |
| `npx jest --verbose` | Runs the tests and lists every test name |
| `npx jest --coverage` | Runs the tests with a code-coverage report |
| `npx eslint src/receipt.ts` or `npm run lint` | Lints the **original** file (expected: parsing error) |
| `npm run lint:fixed` | Lints the fixed code and the tests (expected: no problems) |
| `npm run typecheck` | Strict TypeScript check of the fixed code and the tests |

To see the tests fail against the original code again, change the import in `src/receipt.test.ts` from `"./fixed_receipt"` to `"./receipt"` and run `npx jest receipt.test.ts`. Change the import back afterwards.

## Lab workflow

1. **Read the requirements and `receipt.ts`** without changing the file.
2. **Write the tests first** in `src/receipt.test.ts`, based on the requirements: 33 tests covering the happy path, the unhappy path (invalid input), and edge cases (empty list, duplicate names, zero tax, floating-point rounding).
3. **Run Jest on the original code.** The test suite fails to run because the original file has syntax errors and does not provide the functions the requirements need.
4. **Manual code review**, with the TypeScript compiler as a second check.
5. **Write `issue_log.md`.** It has 26 issues, each with a location, explanation, suggested fix, and status. It also includes examples of *root cause*, *error*, *defect*, and *failure*.
6. **Run ESLint on the original code.** It stops at the first parse error. A second pass on a copy with **only** the syntax errors fixed (`review/receipt_syntax_only.ts`) found 4 more ESLint errors and 7 type errors.
7. **Write `src/fixed_receipt.ts`** with every fix.
8. **Point the tests at `fixed_receipt.ts`** by changing one import line.
9. **Run Jest again:** all 33 tests pass, with 100% coverage.
10. **Mark every issue Fixed** in `issue_log.md`.

## How `fixed_receipt.ts` works

A tax rate is a decimal: `0.1` means 10%. Money values are rounded to cents.

| Function | Returns | Notes |
|---|---|---|
| `addItem(name, price)` | nothing | Throws an error if the name is empty or the price is negative or not a number |
| `deleteItem(name)` | `true` / `false` | Deletes the first item with that name. Returns `false` if there is no match |
| `getItems()` | list of items | A copy of the grocery list |
| `resetItems()` | nothing | Restores the 4 starting items (used by the tests) |
| `subtotal()` | number | Sum of prices, without tax |
| `tax(taxRate)` | number | Tax amount: subtotal × rate |
| `total(taxRate)` | number | Subtotal + tax |
| `printReceipt(taxRate)` | nothing | Prints each item, then the subtotal, tax, and total |

Example output of `printReceipt(0.1)`:

```
************************
paper towels : $21.99
sandwich : $8.75
eggs : $6.75
avocado oil : $10.00
************************
Subtotal: $47.49
Tax: $4.75
Total: $52.24
```

## Screenshots

| File | Shows |
|---|---|
| `screenshots/01-original-jest-failing.png` | Jest on the original code: test suite fails to run |
| `screenshots/02-original-eslint.png` | ESLint on the original code: parsing error |
| `screenshots/03-original-tsc.png` | TypeScript compiler on the original code: 8 errors |
| `screenshots/04-syntax-only-eslint.png` | ESLint second pass: 4 additional errors |
| `screenshots/05-syntax-only-tsc.png` | TypeScript second pass: 7 type errors |
| `screenshots/06-final-jest-passing.png` | Jest on the fixed code: 33 / 33 pass, 100% coverage |
## AI transparency statement

I used **Claude** (Anthropic), an AI assistant, to help with this lab. Claude:

- explained the steps and the project setup (`package.json`, Jest, TypeScript, ESLint, `.gitignore`)
- suggested the Jest test cases, written from the program requirements
- helped with the manual code review and the wording of `issue_log.md`
- provided the corrected code in `fixed_receipt.ts` and a draft of this README

I ran every command myself on my own computer and took every screenshot myself. All test and lint results in this repository are real output. I reviewed the code, the tests, and the issue log before submitting, and I am responsible for the final submission.

The original `receipt.ts` ends with the comment *"AI was used to clean up this code"*, yet that code did not compile. This lab showed me why AI output must be tested and reviewed before it is trusted (see issue #26 in `issue_log.md`).

## Author

Yisakor Mirany. AD361, Introduction to Testing and Static Testing.
