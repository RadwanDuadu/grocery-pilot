export type ShoppingRequestItem = {
  name: string;
  quantity: number;
  maxUnitPrice?: number;
  substitution: "similar" | "exact" | "none";
};

export type TescoProduct = {
  name: string;
  price: number | null;
  unitPrice: string | null;
  productUrl: string | null;
  available: boolean;
  resultIndex: number;
};

export type PreparedLine = {
  requested: ShoppingRequestItem;
  selected: TescoProduct | null;
  status: "planned" | "added" | "missing" | "over-unit-limit" | "failed";
  message?: string;
};

export type BasketPreparation = {
  dryRun: boolean;
  currency: "EUR";
  budget: number;
  estimatedProductsTotal: number;
  withinBudget: boolean;
  lines: PreparedLine[];
  requiresUserReview: true;
};
