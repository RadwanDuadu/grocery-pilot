"use client";

import { useCallback, useMemo, useState } from "react";
import { AccountPanel } from "@/components/account-panel";
import { buildQuote, rankQuotes } from "@/lib/comparison";
import { availableItems, retailers, sampleCatalogue, starterItems } from "@/lib/sample-data";
import type { GroceryItem, ProductImageKey, RetailerId } from "@/lib/types";
import { getRetailerConnector } from "@/lib/retailers";

const euro = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

export function GroceryPilot() {
  const [items, setItems] = useState<GroceryItem[]>(starterItems);
  const [eircode, setEircode] = useState("D02 X285");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [storeFilter, setStoreFilter] = useState<"all" | RetailerId>("all");
  const [selectedRetailer, setSelectedRetailer] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [deliverySlotId, setDeliverySlotId] = useState("preferred");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [handoff, setHandoff] = useState<{ orderId: string; url: string } | null>(null);
  const [quoteCapturedAt, setQuoteCapturedAt] = useState<Date | null>(null);
  const restoreSavedList = useCallback((data: { eircode: string; items: GroceryItem[] }) => {
    setEircode(data.eircode);
    setItems(data.items);
  }, []);

  const quotes = useMemo(
    () => rankQuotes(retailers.map((retailer) => buildQuote(retailer, items, sampleCatalogue))),
    [items],
  );
  const best = quotes[0];
  const categories = ["All", ...Array.from(new Set(availableItems.map((item) => item.category)))];
  const searchResults = availableItems.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesText = !query || `${item.name} ${item.category} ${item.packageDescription}`.toLowerCase().includes(query);
    const matchesCategory = category === "All" || item.category === category;
    const matchesStore = storeFilter === "all" || sampleCatalogue.some((product) => product.groceryItemId === item.id && product.retailer === storeFilter && product.available);
    return matchesText && matchesCategory && matchesStore;
  });

  function updateQuantity(id: string, direction: number) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + direction) } : item));
    setSelectedRetailer(null);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedRetailer(null);
  }

  function addCatalogueItem(item: GroceryItem) {
    if (items.some((current) => current.id === item.id)) return;
    setItems((current) => [...current, { ...item }]);
    setSelectedRetailer(null);
  }

  function reviewBasket(retailerId: RetailerId) {
    setSelectedRetailer(retailerId);
    setDeliverySlotId("preferred");
    setCheckoutError("");
    setHandoff(null);
    setQuoteCapturedAt(new Date());
    setCheckoutOpen(true);
  }

  async function startCheckout() {
    if (!selectedRetailer) return;
    setCheckoutBusy(true);
    setCheckoutError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retailerId: selectedRetailer, eircode, deliverySlotId, items }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to start checkout.");
      setHandoff({ orderId: data.order.id, url: data.handoff.url });
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Unable to start checkout.");
    } finally {
      setCheckoutBusy(false);
    }
  }

  const reviewQuote = quotes.find((quote) => quote.retailer.id === selectedRetailer);
  const reviewConnector = selectedRetailer ? getRetailerConnector(selectedRetailer as RetailerId) : null;

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Grocery Pilot home"><span className="brand-mark" aria-hidden="true">GP</span><span>Grocery Pilot</span></a>
        <div className="topbar-actions"><span className="pilot-badge">Private prototype</span><AccountPanel eircode={eircode} items={items} onRestore={restoreSavedList} onUserChange={setSignedIn} /></div>
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
          <div className="best-card-label">Best complete basket</div><div className="best-store">{best.retailer.name}</div><div className="best-price">{euro.format(best.total)}</div>
          <div className="best-meta">Delivered · {best.matchedCount}/{items.length} items matched</div><div className="best-divider" />
          <div className="best-reason"><span>✓</span> {best.essentialMissingCount ? `${best.essentialMissingCount} essential missing` : "No essential items missing"}</div>
          <p>Estimate based on sample catalogue data.</p>
        </aside>
      </section>

      <section className="workspace">
        <div className="section-heading"><div><p className="eyebrow">Weekly groceries</p><h2>Your regular list</h2></div><span className="item-count">{items.length} items</span></div>
        <div className="content-grid">
          <div className="list-panel">
            <div className="add-row"><span>Use the catalogue below to search and add more products.</span><button onClick={() => document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" })}>Browse catalogue</button></div>
            <div className="grocery-list">
              {items.map((item) => (
                <article className="grocery-row" key={item.id}>
                  <ProductThumb imageKey={item.imageKey} label={item.name} compact />
                  <div className="item-info"><div className="item-name">{item.name}{item.essential && <span>Essential</span>}</div><div className="item-detail">{item.packageDescription} · {item.substitution === "exact" ? "Exact match only" : "Similar substitute allowed"}</div></div>
                  <div className="quantity-control" aria-label={`${item.name} quantity`}><button onClick={() => updateQuantity(item.id, -1)} aria-label={`Decrease ${item.name}`}>−</button><strong>{item.quantity}</strong><button onClick={() => updateQuantity(item.id, 1)} aria-label={`Increase ${item.name}`}>+</button></div>
                  <button className="remove-button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>×</button>
                </article>
              ))}
            </div>
          </div>
          <aside className="how-card"><p className="eyebrow">How we compare</p><h3>Not just the shelf price.</h3><ol><li><span>01</span><div><strong>Match your exact needs</strong><p>Pack size, quantity and preferences.</p></div></li><li><span>02</span><div><strong>Add the real fees</strong><p>Delivery and minimum-order charges.</p></div></li><li><span>03</span><div><strong>Protect essentials</strong><p>Complete baskets rank above incomplete ones.</p></div></li></ol></aside>
        </div>
      </section>

      <section className="catalogue-section" id="catalogue">
        <div className="section-heading catalogue-heading"><div><p className="eyebrow">{availableItems.length} everyday products · {sampleCatalogue.length} store listings</p><h2>Search the catalogue</h2></div><span className="result-count">{searchResults.length} results</span></div>
        <div className="catalogue-tools">
          <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onInput={(event) => setSearch(event.currentTarget.value)} placeholder="Search milk, bread, coffee…" aria-label="Search grocery catalogue" />{search && <button onClick={() => setSearch("")} aria-label="Clear search">×</button>}</label>
          <div className="store-tabs" aria-label="Filter by retailer">{(["all", "tesco", "supervalu"] as const).map((store) => <button key={store} className={storeFilter === store ? "active" : ""} onClick={() => setStoreFilter(store)}>{store === "all" ? "All stores" : store === "tesco" ? "Tesco" : "SuperValu"}</button>)}</div>
        </div>
        <div className="category-chips" aria-label="Filter by category">{categories.map((name) => <button key={name} className={category === name ? "active" : ""} onClick={() => setCategory(name)}>{name}</button>)}</div>

        {searchResults.length ? <div className="product-grid">{searchResults.map((item) => {
          const listings = sampleCatalogue.filter((product) => product.groceryItemId === item.id && (storeFilter === "all" || product.retailer === storeFilter));
          const inList = items.some((current) => current.id === item.id);
          return <article className="product-card" key={item.id}>
            <ProductThumb imageKey={item.imageKey} label={item.name} />
            <div className="product-copy"><span className="product-category">{item.category}</span><h3>{item.name}</h3><p>{item.packageDescription}</p></div>
            <div className="store-prices">{listings.map((listing) => <div key={listing.id} className={!listing.available ? "unavailable" : ""}><span>{listing.retailer === "tesco" ? "Tesco" : "SuperValu"}</span><strong>{listing.available ? euro.format(listing.price) : "Unavailable"}</strong></div>)}</div>
            <button className={`catalogue-add ${inList ? "added" : ""}`} onClick={() => addCatalogueItem(item)} disabled={inList}>{inList ? "In your list ✓" : "+ Add to list"}</button>
          </article>;
        })}</div> : <div className="no-results"><strong>No groceries found</strong><span>Try another search or clear the filters.</span></div>}
      </section>

      <section className="comparison-section">
        <div className="section-heading comparison-heading"><div><p className="eyebrow">Delivered to {eircode || "your Eircode"}</p><h2>Basket comparison</h2></div><div className="sample-notice"><span>i</span> Sample prices for prototype testing</div></div>
        <div className="quote-grid">{quotes.map((quote, index) => (
          <article className={`quote-card ${index === 0 ? "recommended" : ""}`} key={quote.retailer.id}>
            {index === 0 && <div className="recommendation-ribbon">Recommended</div>}
            <div className="quote-top"><div><span className={`retailer-logo ${quote.retailer.id}`}>{quote.retailer.name.slice(0, 1)}</span><h3>{quote.retailer.name}</h3></div><div className="quote-price"><strong>{euro.format(quote.total)}</strong><span>delivered estimate</span></div></div>
            <div className="completeness"><div><span>{quote.matchedCount} of {items.length} items matched</span><strong>{quote.completeness}%</strong></div><div className="progress"><i style={{ width: `${quote.completeness}%` }} /></div></div>
            <div className="fee-list"><div><span>Products</span><strong>{euro.format(quote.subtotal)}</strong></div><div><span>Delivery</span><strong>{euro.format(quote.deliveryFee)}</strong></div>{quote.minimumSurcharge > 0 && <div className="fee-warning"><span>Small basket charge</span><strong>{euro.format(quote.minimumSurcharge)}</strong></div>}<div><span>Next slot</span><strong>{quote.retailer.deliveryLabel}</strong></div></div>
            {quote.missingCount > 0 ? <div className="missing-alert"><strong>{quote.missingCount} item unavailable</strong><span>{quote.lines.filter((line) => line.status === "missing").map((line) => line.item.name).join(", ")}</span></div> : <div className="complete-alert">✓ Every item is available</div>}
            <button className={`select-button ${selectedRetailer === quote.retailer.id ? "selected" : ""}`} onClick={() => reviewBasket(quote.retailer.id)}>{selectedRetailer === quote.retailer.id ? "Review basket again" : `Review ${quote.retailer.name} basket`}</button>
          </article>
        ))}</div>
        <p className="prototype-footnote">Checkout attempts can now be recorded, but baskets, payments and orders are not transferred until an approved retailer connection is enabled.</p>
      </section>

      {checkoutOpen && reviewQuote && reviewConnector && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setCheckoutOpen(false)}>
        <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
          <button className="modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Close basket review">×</button>
          <div className="checkout-heading">
            <div><p className="eyebrow">Retailer checkout handoff</p><h2 id="checkout-title">Review {reviewQuote.retailer.name}</h2></div>
            <span className="mock-badge">Mock connection</span>
          </div>
          <div className="checkout-warning"><strong>Development data only</strong><span>This quote is not from {reviewQuote.retailer.name}. No basket or payment will be sent.</span></div>
          <div className="checkout-summary">
            <div><span>Estimated total</span><strong>{euro.format(reviewQuote.total)}</strong></div>
            <div><span>Availability</span><strong>{reviewQuote.matchedCount}/{items.length} items</strong></div>
            <div><span>Quote captured</span><strong>{quoteCapturedAt?.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}</strong></div>
            <div><span>Quote expires</span><strong>{quoteCapturedAt && new Date(quoteCapturedAt.getTime() + 15 * 60 * 1000).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}</strong></div>
          </div>
          <label className="slot-picker">Preferred delivery window<select value={deliverySlotId} onChange={(event) => setDeliverySlotId(event.target.value)}>{reviewConnector.getDeliverySlots().map((slot) => <option value={slot.id} key={slot.id}>{slot.label}</option>)}</select></label>
          <div className="review-lines">{reviewQuote.lines.map((line) => <div key={line.item.id}><span>{line.item.quantity} × {line.item.name}<small>{line.item.substitution === "exact" ? "Exact only" : line.item.substitution === "none" ? "No substitution" : "Similar substitute allowed"}</small></span><strong>{line.status === "missing" ? "Unavailable" : euro.format(line.lineTotal)}</strong></div>)}</div>
          {!signedIn && <p className="checkout-auth">Sign in from the top of the page before starting checkout. This keeps an audit trail tied to your account.</p>}
          {checkoutError && <p className="form-error" role="alert">{checkoutError}</p>}
          {handoff ? <div className="handoff-result"><strong>Checkout attempt recorded</strong><span>Reference {handoff.orderId.slice(-8)}. Your basket cannot yet be transferred.</span><a href={handoff.url} target="_blank" rel="noreferrer">Open {reviewQuote.retailer.name} to shop manually ↗</a></div> : <button className="checkout-button" onClick={startCheckout} disabled={!signedIn || checkoutBusy}>{checkoutBusy ? "Recording checkout…" : signedIn ? "Record checkout & continue" : "Sign in to continue"}</button>}
          <p className="card-safety">Card details stay with the retailer. Grocery Pilot does not request or store card numbers.</p>
        </section>
      </div>}
      <footer><span>Grocery Pilot</span><p>Built to make the weekly shop calmer, clearer and more affordable.</p></footer>
    </main>
  );
}

function ProductThumb({ imageKey, label, compact = false }: { imageKey: ProductImageKey; label: string; compact?: boolean }) {
  return <div className={`product-thumb sprite-${imageKey} ${compact ? "compact" : ""}`} role="img" aria-label={`${label} illustration`} />;
}
