import type { BasketPreparation, PreparedLine } from "./types";

export function totalPreparedLines(lines: PreparedLine[]) {
  return Math.round(lines.reduce((sum, line) => {
    if (!line.selected?.price || line.status === "missing" || line.status === "failed") return sum;
    return sum + line.selected.price * line.requested.quantity;
  }, 0) * 100) / 100;
}

export function createPreparation(lines: PreparedLine[], budget: number, dryRun: boolean): BasketPreparation {
  const estimatedProductsTotal = totalPreparedLines(lines);
  return {
    dryRun,
    currency: "EUR",
    budget,
    estimatedProductsTotal,
    withinBudget: estimatedProductsTotal <= budget,
    lines,
    requiresUserReview: true,
  };
}

export function assertCanMutateBasket(budget: number, lines: PreparedLine[]) {
  const estimate = totalPreparedLines(lines);
  if (estimate > budget) throw new Error(`Basket estimate €${estimate.toFixed(2)} exceeds the €${budget.toFixed(2)} product budget.`);
}

export function assertCheckoutPreviewConfirmation(phrase: string, expectedMaximum: number, calculatedMaximum: number) {
  if (phrase !== "REVIEW TESCO CHECKOUT") {
    throw new Error('Checkout preview requires confirmationPhrase="REVIEW TESCO CHECKOUT".');
  }
  if (expectedMaximum !== calculatedMaximum) {
    throw new Error("The confirmed maximum does not match the prepared basket maximum.");
  }
}
