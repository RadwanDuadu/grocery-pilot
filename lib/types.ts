export type GroceryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  packageDescription: string;
  essential: boolean;
  substitution: "similar" | "exact" | "none";
};

export type CatalogueProduct = {
  id: string;
  groceryItemId: string;
  retailer: RetailerId;
  name: string;
  packageDescription: string;
  price: number;
  available: boolean;
  substituted?: boolean;
};

export type RetailerId = "tesco" | "supervalu";

export type RetailerPolicy = {
  id: RetailerId;
  name: string;
  deliveryFee: number;
  serviceFee: number;
  minimumBasket: number;
  minimumSurcharge: number;
  deliveryLabel: string;
};

export type QuoteLine = {
  item: GroceryItem;
  product?: CatalogueProduct;
  lineTotal: number;
  status: "matched" | "substitute" | "missing";
};

export type BasketQuote = {
  retailer: RetailerPolicy;
  lines: QuoteLine[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  minimumSurcharge: number;
  total: number;
  matchedCount: number;
  missingCount: number;
  essentialMissingCount: number;
  completeness: number;
};
