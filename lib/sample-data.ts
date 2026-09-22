import type { CatalogueProduct, GroceryItem, RetailerPolicy } from "./types";

type CatalogueRow = GroceryItem & {
  tescoPrice: number;
  supervaluPrice: number;
  unavailableAt?: "tesco" | "supervalu";
  substitutedAt?: "tesco" | "supervalu";
};

const rows: CatalogueRow[] = [
  { id: "milk", name: "Low-fat milk", category: "Dairy", quantity: 1, packageDescription: "2 litre", essential: true, substitution: "similar", imageKey: "milk", tescoPrice: 2.35, supervaluPrice: 2.29 },
  { id: "whole-milk", name: "Whole milk", category: "Dairy", quantity: 1, packageDescription: "2 litre", essential: false, substitution: "similar", imageKey: "milk", tescoPrice: 2.49, supervaluPrice: 2.45 },
  { id: "oat-milk", name: "Oat drink", category: "Dairy alternatives", quantity: 1, packageDescription: "1 litre", essential: false, substitution: "similar", imageKey: "milk", tescoPrice: 2.2, supervaluPrice: 2.35 },
  { id: "bread", name: "Wholemeal sliced bread", category: "Bakery", quantity: 1, packageDescription: "800g loaf", essential: true, substitution: "similar", imageKey: "bread", tescoPrice: 1.55, supervaluPrice: 1.69 },
  { id: "white-bread", name: "White sliced bread", category: "Bakery", quantity: 1, packageDescription: "800g loaf", essential: false, substitution: "similar", imageKey: "bread", tescoPrice: 1.45, supervaluPrice: 1.55 },
  { id: "wraps", name: "Wholemeal wraps", category: "Bakery", quantity: 1, packageDescription: "8 pack", essential: false, substitution: "similar", imageKey: "bread", tescoPrice: 2.1, supervaluPrice: 2.19 },
  { id: "eggs", name: "Free-range eggs", category: "Dairy", quantity: 1, packageDescription: "12 pack", essential: true, substitution: "exact", imageKey: "eggs", tescoPrice: 4.25, supervaluPrice: 4.49 },
  { id: "bananas", name: "Bananas", category: "Fruit & vegetables", quantity: 1, packageDescription: "Approx. 1kg", essential: false, substitution: "similar", imageKey: "bananas", tescoPrice: 1.79, supervaluPrice: 1.85, substitutedAt: "supervalu" },
  { id: "apples", name: "Irish eating apples", category: "Fruit & vegetables", quantity: 1, packageDescription: "6 pack", essential: false, substitution: "similar", imageKey: "bananas", tescoPrice: 2.39, supervaluPrice: 2.5 },
  { id: "potatoes", name: "Rooster potatoes", category: "Fruit & vegetables", quantity: 1, packageDescription: "2kg bag", essential: false, substitution: "similar", imageKey: "bananas", tescoPrice: 3.49, supervaluPrice: 3.29 },
  { id: "onions", name: "Brown onions", category: "Fruit & vegetables", quantity: 1, packageDescription: "1kg bag", essential: false, substitution: "similar", imageKey: "bananas", tescoPrice: 1.45, supervaluPrice: 1.55 },
  { id: "broccoli", name: "Fresh broccoli", category: "Fruit & vegetables", quantity: 1, packageDescription: "Each", essential: false, substitution: "similar", imageKey: "bananas", tescoPrice: 1.19, supervaluPrice: 1.25 },
  { id: "mince", name: "Lean beef mince", category: "Meat", quantity: 1, packageDescription: "500g", essential: true, substitution: "similar", imageKey: "mince", tescoPrice: 5.25, supervaluPrice: 5.49, unavailableAt: "supervalu" },
  { id: "chicken", name: "Chicken breast fillets", category: "Meat", quantity: 1, packageDescription: "600g", essential: false, substitution: "similar", imageKey: "mince", tescoPrice: 6.5, supervaluPrice: 6.79 },
  { id: "sausages", name: "Irish pork sausages", category: "Meat", quantity: 1, packageDescription: "8 pack", essential: false, substitution: "similar", imageKey: "mince", tescoPrice: 3.0, supervaluPrice: 3.25 },
  { id: "toothpaste", name: "Fluoride toothpaste", category: "Household", quantity: 1, packageDescription: "100ml", essential: false, substitution: "similar", imageKey: "toothpaste", tescoPrice: 2.5, supervaluPrice: 2.25 },
  { id: "washing-liquid", name: "Washing-up liquid", category: "Household", quantity: 1, packageDescription: "450ml", essential: false, substitution: "similar", imageKey: "toothpaste", tescoPrice: 1.75, supervaluPrice: 1.89 },
  { id: "toilet-roll", name: "Toilet tissue", category: "Household", quantity: 1, packageDescription: "9 rolls", essential: false, substitution: "similar", imageKey: "toothpaste", tescoPrice: 5.75, supervaluPrice: 5.99 },
  { id: "coffee", name: "Ground coffee", category: "Cupboard", quantity: 1, packageDescription: "227g", essential: false, substitution: "similar", imageKey: "coffee", tescoPrice: 4.6, supervaluPrice: 4.4 },
  { id: "tea", name: "Irish breakfast tea", category: "Cupboard", quantity: 1, packageDescription: "80 bags", essential: false, substitution: "similar", imageKey: "coffee", tescoPrice: 4.15, supervaluPrice: 4.35 },
  { id: "pasta", name: "Penne pasta", category: "Cupboard", quantity: 1, packageDescription: "500g", essential: false, substitution: "similar", imageKey: "pasta", tescoPrice: 1.15, supervaluPrice: 1.25 },
  { id: "rice", name: "Long-grain rice", category: "Cupboard", quantity: 1, packageDescription: "1kg", essential: false, substitution: "similar", imageKey: "pasta", tescoPrice: 1.79, supervaluPrice: 1.85 },
  { id: "beans", name: "Baked beans", category: "Cupboard", quantity: 1, packageDescription: "4 × 400g", essential: false, substitution: "similar", imageKey: "pasta", tescoPrice: 3.49, supervaluPrice: 3.65 },
  { id: "tomatoes", name: "Chopped tomatoes", category: "Cupboard", quantity: 1, packageDescription: "4 × 400g", essential: false, substitution: "similar", imageKey: "pasta", tescoPrice: 2.95, supervaluPrice: 3.15 },
];

export const availableItems: GroceryItem[] = rows.map(({ tescoPrice: _tesco, supervaluPrice: _supervalu, unavailableAt: _unavailable, substitutedAt: _substituted, ...item }) => item);

export const starterItems: GroceryItem[] = [
  { ...availableItems.find((item) => item.id === "milk")!, quantity: 2 },
  ...["bread", "eggs", "bananas", "mince"].map((id) => ({ ...availableItems.find((item) => item.id === id)! })),
];

export const retailers: RetailerPolicy[] = [
  { id: "tesco", name: "Tesco", deliveryFee: 6, serviceFee: 0, minimumBasket: 45, minimumSurcharge: 3, deliveryLabel: "Tomorrow, 18:00–20:00" },
  { id: "supervalu", name: "SuperValu", deliveryFee: 7, serviceFee: 0, minimumBasket: 0, minimumSurcharge: 0, deliveryLabel: "Tomorrow, 17:00–19:00" },
];

export const sampleCatalogue: CatalogueProduct[] = rows.flatMap((row) =>
  retailers.map((retailer) => ({
    id: `${retailer.id}-${row.id}`,
    groceryItemId: row.id,
    retailer: retailer.id,
    name: row.name,
    packageDescription: row.packageDescription,
    price: retailer.id === "tesco" ? row.tescoPrice : row.supervaluPrice,
    available: row.unavailableAt !== retailer.id,
    substituted: row.substitutedAt === retailer.id,
  })),
);
