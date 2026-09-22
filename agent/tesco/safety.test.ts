import { describe, expect, it } from "vitest";
import { assertCanMutateBasket, assertCheckoutPreviewConfirmation, createPreparation } from "./safety";
import type { PreparedLine } from "./types";

const lines: PreparedLine[] = [{
  requested: { name: "Milk", quantity: 2, substitution: "similar" },
  selected: { name: "Tesco Milk", price: 2.25, unitPrice: null, productUrl: null, available: true, resultIndex: 0 },
  status: "planned",
}];

describe("Tesco agent safety", () => {
  it("calculates the basket against the supplied budget", () => {
    expect(createPreparation(lines, 5, true)).toMatchObject({ estimatedProductsTotal: 4.5, withinBudget: true, dryRun: true });
    expect(createPreparation(lines, 4, true).withinBudget).toBe(false);
  });

  it("blocks basket mutation above the products budget", () => {
    expect(() => assertCanMutateBasket(4, lines)).toThrow(/exceeds/);
  });

  it("requires an exact confirmation before checkout preview", () => {
    expect(() => assertCheckoutPreviewConfirmation("wrong", 20, 20)).toThrow(/confirmationPhrase/);
    expect(() => assertCheckoutPreviewConfirmation("REVIEW TESCO CHECKOUT", 20, 21)).toThrow(/does not match/);
    expect(() => assertCheckoutPreviewConfirmation("REVIEW TESCO CHECKOUT", 20, 20)).not.toThrow();
  });
});
