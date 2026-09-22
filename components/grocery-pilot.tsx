"use client";

import { useMemo, useState } from "react";
import { buildQuote, rankQuotes } from "@/lib/comparison";
import { availableItems, retailers, sampleCatalogue, starterItems } from "@/lib/sample-data";
import type { GroceryItem } from "@/lib/types";

const euro = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

export function GroceryPilot() {
  const [items, setItems] = useState<GroceryItem[]>(starterItems);
  const [eircode, setEircode] = useState("D02 X285");
  const [candidateId, setCandidateId] = useState("toothpaste");
  const [selectedRetailer, setSelectedRetailer] = useState<string | null>(null);

  const quotes = useMemo(
    () => rankQuotes(retailers.map((retailer) => buildQuote(retailer, items, sampleCatalogue))),
    [items],
  );
  const best = quotes[0];
  const addableItems = availableItems.filter((candidate) => !items.some((item) => item.id === candidate.id));

  function updateQuantity(id: string, direction: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + direction) } : item,
      ),
    );
    setSelectedRetailer(null);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedRetailer(null);
  }

  function addItem() {
    const item = availableItems.find((candidate) => candidate.id === candidateId);
    if (!item || items.some((current) => current.id === item.id)) return;
    setItems((current) => [...current, { ...item }]);
    setSelectedRetailer(null);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Grocery Pilot home">
          <span className="brand-mark" aria-hidden="true">GP</span>
          <span>Grocery Pilot</span>
        </a>
        <span className="pilot-badge">Private prototype</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Your weekly shop, clearly compared</p>
          <h1>One list. Every cost.<br /><span>A better basket.</span></h1>
          <p className="hero-text">Compare complete grocery baskets near you—including delivery and missing essentials—before choosing a store.</p>
          <div className="location-card">
            <label htmlFor="eircode">Delivery Eircode</label>
            <div className="location-row">
              <input id="eircode" value={eircode} onChange={(event) => setEircode(event.target.value.toUpperCase())} maxLength={8} />
              <span className="location-status"><i /> 2 stores available</span>
            </div>
          </div>
        </div>
        <aside className="best-card" aria-label="Current recommendation">
          <div className="best-card-label">Best complete basket</div>
          <div className="best-store">{best.retailer.name}</div>
          <div className="best-price">{euro.format(best.total)}</div>
          <div className="best-meta">Delivered · {best.matchedCount}/{items.length} items matched</div>
          <div className="best-divider" />
          <div className="best-reason"><span>✓</span> No essential items missing</div>
          <p>Estimate based on sample catalogue data.</p>
        </aside>
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Weekly groceries</p>
            <h2>Your regular list</h2>
          </div>
          <span className="item-count">{items.length} items</span>
        </div>

        <div className="content-grid">
          <div className="list-panel">
            <div className="add-row">
              <select value={candidateId} onChange={(event) => setCandidateId(event.target.value)} aria-label="Choose a grocery item">
                {addableItems.length ? addableItems.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.packageDescription}</option>) : <option>All sample items added</option>}
              </select>
              <button onClick={addItem} disabled={!addableItems.length}>+ Add item</button>
            </div>

            <div className="grocery-list">
              {items.map((item) => (
                <article className="grocery-row" key={item.id}>
                  <div className="item-icon" aria-hidden="true">{iconFor(item.category)}</div>
                  <div className="item-info">
                    <div className="item-name">{item.name}{item.essential && <span>Essential</span>}</div>
                    <div className="item-detail">{item.packageDescription} · {item.substitution === "exact" ? "Exact match only" : "Similar substitute allowed"}</div>
                  </div>
                  <div className="quantity-control" aria-label={`${item.name} quantity`}>
                    <button onClick={() => updateQuantity(item.id, -1)} aria-label={`Decrease ${item.name}`}>−</button>
                    <strong>{item.quantity}</strong>
                    <button onClick={() => updateQuantity(item.id, 1)} aria-label={`Increase ${item.name}`}>+</button>
                  </div>
                  <button className="remove-button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>×</button>
                </article>
              ))}
            </div>
          </div>

          <aside className="how-card">
            <p className="eyebrow">How we compare</p>
            <h3>Not just the shelf price.</h3>
            <ol>
              <li><span>01</span><div><strong>Match your exact needs</strong><p>Pack size, quantity and preferences.</p></div></li>
              <li><span>02</span><div><strong>Add the real fees</strong><p>Delivery and minimum-order charges.</p></div></li>
              <li><span>03</span><div><strong>Protect essentials</strong><p>Complete baskets rank above incomplete ones.</p></div></li>
            </ol>
          </aside>
        </div>
      </section>

      <section className="comparison-section">
        <div className="section-heading comparison-heading">
          <div>
            <p className="eyebrow">Delivered to {eircode || "your Eircode"}</p>
            <h2>Basket comparison</h2>
          </div>
          <div className="sample-notice"><span>i</span> Sample prices for prototype testing</div>
        </div>

        <div className="quote-grid">
          {quotes.map((quote, index) => (
            <article className={`quote-card ${index === 0 ? "recommended" : ""}`} key={quote.retailer.id}>
              {index === 0 && <div className="recommendation-ribbon">Recommended</div>}
              <div className="quote-top">
                <div>
                  <span className={`retailer-logo ${quote.retailer.id}`}>{quote.retailer.name.slice(0, 1)}</span>
                  <h3>{quote.retailer.name}</h3>
                </div>
                <div className="quote-price"><strong>{euro.format(quote.total)}</strong><span>delivered estimate</span></div>
              </div>

              <div className="completeness">
                <div><span>{quote.matchedCount} of {items.length} items matched</span><strong>{quote.completeness}%</strong></div>
                <div className="progress"><i style={{ width: `${quote.completeness}%` }} /></div>
              </div>

              <div className="fee-list">
                <div><span>Products</span><strong>{euro.format(quote.subtotal)}</strong></div>
                <div><span>Delivery</span><strong>{euro.format(quote.deliveryFee)}</strong></div>
                {quote.minimumSurcharge > 0 && <div className="fee-warning"><span>Small basket charge</span><strong>{euro.format(quote.minimumSurcharge)}</strong></div>}
                <div><span>Next slot</span><strong>{quote.retailer.deliveryLabel}</strong></div>
              </div>

              {quote.missingCount > 0 ? (
                <div className="missing-alert"><strong>{quote.missingCount} item unavailable</strong><span>{quote.lines.filter((line) => line.status === "missing").map((line) => line.item.name).join(", ")}</span></div>
              ) : (
                <div className="complete-alert">✓ Every item is available</div>
              )}

              <button className={`select-button ${selectedRetailer === quote.retailer.id ? "selected" : ""}`} onClick={() => setSelectedRetailer(quote.retailer.id)}>
                {selectedRetailer === quote.retailer.id ? "Selected for review ✓" : `Review ${quote.retailer.name} basket`}
              </button>
            </article>
          ))}
        </div>
        <p className="prototype-footnote">No order will be placed. Live retailer integrations and payment are deliberately excluded from this prototype.</p>
      </section>

      <footer><span>Grocery Pilot</span><p>Built to make the weekly shop calmer, clearer and more affordable.</p></footer>
    </main>
  );
}

function iconFor(category: string) {
  const icons: Record<string, string> = { Dairy: "◉", Bakery: "◇", "Fruit & vegetables": "♧", Meat: "△", Household: "✦", Cupboard: "▧" };
  return icons[category] ?? "•";
}
