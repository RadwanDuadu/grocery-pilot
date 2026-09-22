import type { BasketQuote, CatalogueProduct, GroceryItem, RetailerPolicy } from "./types";

export function buildQuote(
  retailer: RetailerPolicy,
  items: GroceryItem[],
  catalogue: CatalogueProduct[],
): BasketQuote {
  const lines = items.map((item) => {
    const product = catalogue.find(
      (candidate) =>
        candidate.retailer === retailer.id &&
        candidate.groceryItemId === item.id &&
        candidate.available,
    );

    if (!product) {
      return { item, lineTotal: 0, status: "missing" as const };
    }

    return {
      item,
      product,
      lineTotal: roundCurrency(product.price * item.quantity),
      status: product.substituted ? ("substitute" as const) : ("matched" as const),
    };
  });

  const subtotal = roundCurrency(lines.reduce((sum, line) => sum + line.lineTotal, 0));
  const minimumSurcharge = subtotal < retailer.minimumBasket ? retailer.minimumSurcharge : 0;
  const total = roundCurrency(subtotal + retailer.deliveryFee + retailer.serviceFee + minimumSurcharge);
  const missing = lines.filter((line) => line.status === "missing");
  const matchedCount = lines.length - missing.length;

  return {
    retailer,
    lines,
    subtotal,
    deliveryFee: retailer.deliveryFee,
    serviceFee: retailer.serviceFee,
    minimumSurcharge,
    total,
    matchedCount,
    missingCount: missing.length,
    essentialMissingCount: missing.filter((line) => line.item.essential).length,
    completeness: items.length === 0 ? 0 : Math.round((matchedCount / items.length) * 100),
  };
}

export function rankQuotes(quotes: BasketQuote[]) {
  return [...quotes].sort((a, b) => {
    if (a.essentialMissingCount !== b.essentialMissingCount) {
      return a.essentialMissingCount - b.essentialMissingCount;
    }
    if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
    return a.total - b.total;
  });
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
