import { describe, expect, it } from "vitest";
import { buildQuote, rankQuotes } from "./comparison";
import { retailers, sampleCatalogue, starterItems } from "./sample-data";

describe("basket comparison", () => {
  it("includes quantities, delivery, and minimum-basket charges", () => {
    const quote = buildQuote(retailers[0], starterItems, sampleCatalogue);

    expect(quote.subtotal).toBe(12.29);
    expect(quote.deliveryFee).toBe(6);
    expect(quote.minimumSurcharge).toBe(3);
    expect(quote.total).toBe(21.29);
    expect(quote.completeness).toBe(100);
  });

  it("reports unavailable essentials instead of silently excluding them", () => {
    const catalogueWithMissingEggs = sampleCatalogue.map((product) =>
      product.retailer === "supervalu" && product.groceryItemId === "eggs"
        ? { ...product, available: false }
        : product,
    );
    const quote = buildQuote(retailers[1], starterItems, catalogueWithMissingEggs);

    expect(quote.missingCount).toBe(1);
    expect(quote.essentialMissingCount).toBe(1);
    expect(quote.lines.find((line) => line.item.id === "eggs")?.status).toBe("missing");
  });

  it("ranks complete baskets above cheaper incomplete baskets", () => {
    const catalogueWithMissingEggs = sampleCatalogue.map((product) =>
      product.retailer === "supervalu" && product.groceryItemId === "eggs"
        ? { ...product, available: false }
        : product,
    );
    const quotes = retailers.map((retailer) => buildQuote(retailer, starterItems, catalogueWithMissingEggs));

    expect(rankQuotes(quotes)[0].retailer.id).toBe("tesco");
  });
});
