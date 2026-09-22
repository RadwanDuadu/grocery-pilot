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

The application includes an editable weekly list, a searchable meat-free catalogue with sample Tesco and SuperValu listings, product artwork, category and retailer filters, delivered-cost calculations, secure database-backed accounts and sessions, persistent Eircodes and lists, a PostgreSQL/Prisma data layer, a retailer connector boundary, timestamped checkout review, an assisted-checkout fallback with copyable lists and supported retailer search links, persisted checkout attempts, tests, and GitHub Actions CI.

All retailer prices, availability, fees, and delivery slots in the prototype are sample data. Checkout attempts are recorded for testing, but no baskets, orders, card details, or payments are submitted to a retailer.

## Run locally

Requirements: Node.js 22, npm, and PostgreSQL 17. A Docker Compose file is included for environments with Docker.

On macOS with Homebrew:

```bash
brew install postgresql@17
brew services start postgresql@17
/opt/homebrew/opt/postgresql@17/bin/psql -d postgres -c "CREATE ROLE grocery_pilot WITH LOGIN PASSWORD 'grocery_pilot_dev';"
/opt/homebrew/opt/postgresql@17/bin/createdb --owner=grocery_pilot grocery_pilot
```

The included credentials are for local development only. Use a secret-managed, randomly generated password in staging and production.

```bash
npm install --legacy-peer-deps
npm run db:generate
npx prisma migrate deploy
npm run dev
```

Open `http://localhost:3000`.

Verification commands:

```bash
npm run typecheck
npm test
npm run build
```

Copy `.env.example` to `.env` before starting. Without PostgreSQL the comparison demo remains available, but registration, sign-in, and saved lists return a clear database-setup message.

## Next steps

1. Select the initial delivery area.
2. Confirm commercial/API access with Tesco and SuperValu.
3. Interview prospective users and validate the account and saved-list flow.
4. Add email verification and password-reset delivery before public launch.
5. Replace the sample catalogue with approved retailer data.
