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

## Status

Planning and retailer-integration validation.

## Next steps

1. Select the initial delivery area.
2. Confirm commercial/API access with Tesco and SuperValu.
3. Interview prospective users and validate the conversation flow.
4. Build a comparison-only prototype before enabling purchasing.

