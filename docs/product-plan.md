# Grocery Pilot product plan

## Product goal

Create a web and WhatsApp-based assistant that maintains a user's usual grocery list, compares the complete delivered cost across eligible nearby retailers, permits conversational changes, and places an order only after the user reviews and confirms it.

## Example journey

1. The user asks to compare their weekly groceries.
2. Grocery Pilot identifies eligible stores using the saved Eircode.
3. It matches each requested item against each retailer's current catalogue.
4. It displays product costs, promotions, delivery and service charges, missing items, substitutions, and the earliest suitable delivery slot.
5. The user adds, removes, or replaces products conversationally.
6. Grocery Pilot refreshes the selected basket and asks for explicit confirmation.
7. Checkout happens through an approved retailer integration or secure retailer handoff.
8. Grocery Pilot records order status and asks whether new items should be added to the permanent list.

## Key product rules

- Never modify a permanent list without confirmation.
- Never submit an order without a recorded final confirmation.
- Label comparison totals as estimates until the retailer confirms checkout.
- Reconfirm if price, availability, substitutions, or delivery time materially changes.
- Do not store raw card information or send sensitive payment data through chat.
- Use only official retailer or marketplace integrations for account and order automation.

## Delivered-cost calculation

The comparison must include:

```text
delivered total =
  products
  - applicable promotions
  + delivery charge
  + service or picking charge
  + minimum-order surcharge
  + applicable deposit charges
```

Show completeness alongside price. A cheaper basket with five missing essentials should not outrank a slightly more expensive complete basket without warning the user.

## Grocery-list model

Each list item should support:

- Requested name and quantity
- Preferred brand and product
- Required or acceptable package sizes
- Dietary and allergy constraints
- Maximum price
- Acceptable alternatives
- Substitution policy
- Essential or optional priority
- Permanent-list versus one-order-only status

Product matching must normalize pack sizes and comparable unit prices. Low-confidence matches require user review.

## Retailer strategy

### Pilot

- Tesco: comparison and approved checkout/handoff
- SuperValu: comparison and approved checkout/handoff
- Aldi: marketplace integration where the user's address is served
- Lidl: informational comparison until a suitable approved delivery integration exists

### Integration order

1. Official product and pricing feeds
2. Official basket, slot, and ordering APIs
3. Approved marketplace integrations
4. Secure handoff into retailer checkout

Unapproved scraping, password collection, and fragile browser automation are outside the product design.

## Conversation design

Example commands:

- "Compare my weekly groceries."
- "Add toothpaste this week."
- "Change milk to three cartons."
- "Only buy free-range eggs."
- "Never substitute the baby formula."
- "Keep the delivered total below EUR 75."
- "Use the cheapest brands except for coffee."
- "Buy the Tesco basket."

WhatsApp is the quick conversation layer. A companion web interface handles detailed basket comparison, account connections, substitutions, consent, authentication, and checkout.

## Order state

```text
Draft list
-> retailer comparison
-> store selected
-> live basket and slot refreshed
-> final review
-> explicit confirmation
-> authentication when required
-> order submitted
-> receipt and status
```

The user should configure a price-change tolerance. A starting recommendation is the lower of EUR 3 or 5 percent, after which Grocery Pilot requests confirmation again.

## Proposed system

```text
WhatsApp and web app
        |
Conversation and intent service
        |
List and preference service
        |
Matching and comparison engine
        |
Retailer connector layer
        |
Consent, checkout, and order service
        |
PostgreSQL, encrypted secrets, and audit log
```

## Core records

- User and household
- Address and Eircode
- Retailer connection and consent
- Grocery list and list item
- Product preference
- Retailer store, product, price, and offer
- Product match and confidence
- Basket quote and delivery slot
- Substitution policy
- Order and order event
- Payment-token reference
- Consent and audit event

## Delivery roadmap

### Phase 0: validation and partnerships (2-4 weeks)

- Interview 15-25 households.
- Select one launch area.
- Confirm product-feed, basket, delivery-slot, and ordering rights.
- Prototype the conversation and comparison screens.
- Decide the business's role: comparison service, agent, or marketplace.

### Phase 1: comparison MVP (6-10 weeks)

- Account, Eircode, and reusable lists
- Tesco and SuperValu catalogue normalization
- Delivered-basket estimates
- Missing-item and substitution review
- WhatsApp conversation and companion web app
- Secure retailer-checkout handoff
- Operations console for failed matches

No unattended purchasing is included in this phase.

### Phase 2: assisted ordering (6-8 weeks)

- Approved basket transfer
- Live delivery slots
- Retailer-account linking
- Order tracking and receipts
- Price-change and availability alerts
- User-configurable substitution rules

### Phase 3: streamlined reordering

- Saved retailer and delivery preferences
- Tokenized payments where Grocery Pilot is authorized to charge
- One-message usual-list flow
- Step-up confirmation for material changes
- Optional scheduled suggestions, without silent purchasing

## Security and compliance

- GDPR notice, lawful basis, export, and deletion
- Explicit retailer-account consent
- Least-privilege tokens and connection revocation
- Encryption in transit and at rest
- No raw card data in chat, logs, or the database
- Immutable purchase-consent and order-event records
- Strong account recovery
- Age checks for restricted products
- Clear refund and substitution responsibilities
- Legal review of PSD2/SCA, consumer law, and marketplace or agency status

## Pilot success measures

- At least 90 percent of common list items matched automatically
- Less than 2 percent estimate variance, excluding disclosed substitutions
- Comparison returned within 30 seconds
- Zero purchases without recorded confirmation
- At least 70 percent of pilot users completing a repeat shop
- Manual intervention on fewer than 10 percent of baskets

