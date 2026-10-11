# AD361 – Introduction to Testing and Static Testing Lab

A TypeScript lab for AD361 that combines **dynamic testing** (Jest unit tests) with **static testing** (manual code review, the TypeScript compiler, and ESLint) on a small grocery receipt program.

The starting file, `receipt.ts`, was supplied with the assignment and is kept **unchanged**. It contains syntax errors, logic defects, and requirement violations. This project finds those problems, documents them, and fixes them in a separate file, `fixed_receipt.ts`.

## Program requirements

1. Items can be added to the grocery list.
2. Items can be deleted from the grocery list.
3. The subtotal is calculated without tax.
4. The total is calculated with tax.
5. A receipt can be printed.

## Results at a glance

| Check | Original `receipt.ts` | `fixed_receipt.ts` |
|---|---|---|
| Jest (`npx jest receipt.test.ts`) | ❌ Test suite failed to run (0 tests ran) | ✅ 33 / 33 tests pass, 100% coverage |
| ESLint | ❌ Parsing error (line 17). After the syntax was patched in a copy: 4 more errors | ✅ 0 problems |
| TypeScript compiler (strict) | ❌ 8 syntax errors. After the syntax was patched in a copy: 7 type errors | ✅ 0 errors |
| Issues logged in `issue_log.md` | 26 found (3 syntax, 16 logic, 7 clarity) | 26 Fixed |

## Project structure

```
AD361-Static-Testing-Lab/
├── receipt.ts            # Original assignment code (UNCHANGED, does not compile)
├── fixed_receipt.ts      # Corrected implementation
├── receipt.test.ts       # Jest tests: happy path, unhappy path, edge cases
├── issue_log.md          # Code review log: Location, Issue, Explanation, Suggested Fix, Status
├── screenshots/          # Screenshots of the original and final tool results
├── results/              # Raw text output of every command used as evidence
│   └── syntax-only/      # Copy of receipt.ts with ONLY the syntax errors patched (for the 2nd ESLint pass)
├── package.json          # Scripts and dev dependencies
├── jest.config.js        # Jest + ts-jest configuration
├── tsconfig.json         # TypeScript configuration (strict mode)
├── eslint.config.mjs     # ESLint flat config (eslint:recommended + typescript-eslint)
└── .gitignore
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (developed with Node 22)
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
| `npx jest receipt.test.ts` or `npm test` | Runs the unit tests (currently against `fixed_receipt.ts`) |
| `npx jest --verbose` | Runs the tests and lists every test name |
| `npx jest --coverage` | Runs the tests with a code-coverage report |
| `npx eslint receipt.ts` or `npm run lint` | Lints the **original** file (expected to fail with a parsing error) |
| `npm run lint:fixed` | Lints `fixed_receipt.ts` and `receipt.test.ts` (expected: no problems) |
| `npm run typecheck` | Strict TypeScript type check of the fixed code and tests |

### Reproducing the original failing test run

The test file now imports from `./fixed_receipt`. To see the tests fail against the original code again, run:

```bash
sed -i 's#"./fixed_receipt"#"./receipt"#' receipt.test.ts   # point the tests at the original file
npx jest receipt.test.ts                                    # fails: test suite cannot compile
git checkout receipt.test.ts                                # restore the import
```

(On macOS, use `sed -i ''` instead of `sed -i`.) The first commit in the history also shows the test file importing `./receipt`.

## Lab workflow

1. **Read the requirements and `receipt.ts`** without changing the file.
2. **Write the tests first** in `receipt.test.ts`, based on the requirements: 33 tests covering the happy path, the unhappy path (invalid input), and edge cases (empty list, duplicate names, zero tax, floating-point rounding).
3. **Run Jest on the original code.** The suite fails to run. The test file can't compile because the original module is broken and doesn't export the functions the requirements need. See `results/01-original-jest.txt`.
4. **Manual code review.** Read every line against the requirements, then run the TypeScript compiler (`results/02-original-tsc.txt`).
5. **Write `issue_log.md`.** It has 26 issues, each with a location, explanation, suggested fix, and status. It also includes worked examples of *root cause*, *error*, *defect*, and *failure*.
6. **Run ESLint on the original code.** It stops at the first parse error. A second pass on a copy with **only** the syntax errors patched (`results/syntax-only/`) shows 4 more ESLint errors and 7 type errors. Running that copy shows the actual runtime failures (`results/08-syntax-only-runtime-probe.txt`).
7. **Write `fixed_receipt.ts`** with every fix.
8. **Point the tests at `fixed_receipt.ts`** (a one-line import change).
9. **Run Jest again:** all 33 tests pass.
10. **Mark every issue `Fixed`** in `issue_log.md`.

The commit history follows these steps in order.

### API of `fixed_receipt.ts`

A tax rate is a decimal: `0.1` means 10%. Money values are rounded to cents.

| Function | Returns | Notes |
|---|---|---|
| `addItem(name, price)` | `void` | Throws if the name is empty or the price is negative or not a number |
| `deleteItem(name)` | `boolean` | Deletes the first matching item. Returns `false` if there is no match |
| `getItems()` | `Item[]` | A copy of the grocery list |
| `resetItems()` | `void` | Restores the 4 starting items (used by the tests) |
| `subtotal()` | `number` | Sum of prices, without tax |
| `tax(taxRate)` | `number` | Tax amount: subtotal × rate |
| `total(taxRate)` | `number` | Subtotal + tax |
| `printReceipt(taxRate)` | `void` | Prints each item, then the subtotal, tax, and total |

Example receipt for `printReceipt(0.1)`:

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
| `screenshots/01-original-jest-failing.png` | Jest on the original `receipt.ts`: suite fails to run |
| `screenshots/02-original-eslint.png` | ESLint on the original `receipt.ts`: parsing error |
| `screenshots/03-syntax-only-eslint.png` | ESLint second pass on the syntax-only copy: 4 errors |
| `screenshots/06-original-tsc-syntax-errors.png` | TypeScript compiler on the original `receipt.ts`: 8 syntax errors |
| `screenshots/04-final-jest-passing.png` | Jest on `fixed_receipt.ts`: 33 / 33 tests pass |
| `screenshots/05-final-eslint-clean.png` | ESLint on the fixed code: no problems |

**How the screenshots were made:** each command was run in a terminal and its full output was saved to `results/`. The screenshots are images of that saved output, drawn by `results/render-screenshots.js` with a headless browser. Nothing in them was typed or edited by hand. You can re-run any command above to get the same results.

## AI transparency statement

This project was completed with help from **Claude** (Anthropic), an AI coding assistant, running in Claude Code. The AI:

- set up the project configuration (`package.json`, Jest, TypeScript, ESLint, `.gitignore`)
- wrote the Jest tests from the program requirements
- ran Jest, the TypeScript compiler, and ESLint, and saved their real output
- carried out the manual code review and wrote `issue_log.md`
- wrote `fixed_receipt.ts` and this README
- produced the screenshots from the saved command output

Every test result, lint result, and runtime failure in this repository comes from commands that were actually run. None of it was invented. I reviewed the AI's work, the code, and the issue log before submitting, and I am responsible for the final submission.

The original `receipt.ts` ends with the comment *"AI was used to clean up this code."* That code did not compile. This shows why AI output must be tested and reviewed rather than trusted, which is the point of this lab (see issue #26 in `issue_log.md`).

## Author

Yisakor Mirany. AD361, Introduction to Testing and Static Testing.
