# Grocery Pilot

Grocery Pilot is a conversational grocery comparison and ordering assistant for Ireland. It is designed to compare a predefined household shopping list across nearby retailers, include delivery costs, handle substitutions, and ask for explicit confirmation before checkout.

## Initial scope

- Reusable household grocery lists
- Natural-language list editing through WhatsApp and the web
- Eircode-based retailer and delivery eligibility
- Delivered-basket comparison, including fees and surcharges
- Product matching by brand, size, dietary preference, and unit price
- Missing-item and substitution review
- Secure handoff to retailer checkout
- Explicit purchase confirmation and an order audit trail

The first pilot should target Tesco and SuperValu in one Irish delivery area. Aldi can be added through an approved marketplace integration where available. Direct ordering must use retailer-approved APIs or partnerships rather than unapproved account automation.

## Proposed architecture

- Web: Next.js with TypeScript
- API: NestJS/TypeScript or FastAPI/Python
- Database: PostgreSQL
- Cache and jobs: Redis
- Messaging: WhatsApp Business Platform
- Payments: retailer-managed checkout initially
- Hosting: EU region

The detailed product, safety, integration, and delivery plan is in [docs/product-plan.md](docs/product-plan.md).

## Prototype status

The first comparison prototype is implemented. It includes an editable weekly list, sample Tesco and SuperValu catalogues, delivered-cost calculations, missing-essential ranking, a PostgreSQL-ready Prisma schema, tests, and GitHub Actions CI.

All retailer prices, availability, fees, and delivery slots in the prototype are sample data. No orders or payments are submitted.

## Run locally

Requirements: Node.js 22 and npm.

```bash
npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:3000`.

Verification commands:

```bash
npm run typecheck
npm test
npm run build
```

Copy `.env.example` to `.env` before connecting a PostgreSQL database. The interactive prototype currently uses deterministic sample data, so a database is not required to view it.

## Next steps

1. Select the initial delivery area.
2. Confirm commercial/API access with Tesco and SuperValu.
3. Connect PostgreSQL and persist household grocery lists.
4. Add authentication and secure household accounts.
5. Interview prospective users and validate the comparison flow.
