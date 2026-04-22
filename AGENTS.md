# AGENTS.md

## Project
Sugarbay is a music band website and e-commerce platform built with:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- Neon PostgreSQL
- Stripe
- ImageKit

## Goals
Build a scalable, production-ready foundation for:
- public content pages
- concerts
- band news and bio
- music catalog
- media galleries
- store
- auth
- cart
- checkout and Stripe payment

## Rules
- Use TypeScript strict mode
- Prefer server components unless client interactivity is required
- Keep logic modular
- Avoid large monolithic files
- Reuse components and utilities
- Keep styling in Tailwind
- Validate inputs on both client and server
- Protect private routes
- Never hardcode secrets
- PayPal is UI-only for now, Stripe is the real payment integration

## Code style
- Clear naming
- Small reusable components
- Feature-oriented organization where useful
- Strong typing
- Avoid dead code
- Add comments only when they clarify non-obvious logic

## When changing code
- Inspect nearby files first
- Match existing conventions
- Do not rewrite unrelated areas
- Keep the app runnable
- Explain created and modified files