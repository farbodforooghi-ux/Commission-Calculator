# Commission Calculator

A small, focused Next.js app to calculate commissions. Built with TypeScript for clarity and safety, and designed so you can quickly read the code and change the commission rules.

Why this repo exists
- Quickly compute commission amounts for sales scenarios.
- Provide a simple UI and clear, typed calculation logic so formulas are easy to change.
- Serve as a lightweight starter for adding features like CSV import/export, rule engines, or API integrations.

Key features
- Fast client-side calculations with TypeScript types.
- Minimal, usable UI for entering values and seeing results immediately.
- Clear separation between UI and calculation logic for easy customization and testing.

Tech stack
- Next.js (React framework)
- TypeScript (primary language; ~92% of the repo)
- Plain CSS for styling

Quick start (local)
1. Install dependencies:
   npm install
   # or
   yarn
   # or
   pnpm install

2. Run the development server:
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev

3. Open http://localhost:3000 in your browser.

Available scripts
- dev — run the dev server (hot reload)
- build — create a production build
- start — run the production build
- lint — run TypeScript / ESLint checks (if configured)

Where to edit
- app/page.tsx — main UI and interaction
- components/ — reusable UI components (if present)
- lib/ or utils/ — core calculation logic (adjust formulas here)

Testing & quality
- If you add or change calculation logic, add unit tests around the formulas.
- Keep UI and business logic separated so tests can run without rendering the UI.

Contributing
- Keep changes focused and documented.
- If you change calculation rules, include examples (input → expected output).
- Open an issue or PR with a clear description and sample inputs/outputs.


---

## Original Next.js README (default)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load the fonts used in the app.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app). Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
