import type { CatalogueProduct, GroceryItem, RetailerPolicy } from "./types";

export const starterItems: GroceryItem[] = [
  { id: "milk", name: "Low-fat milk", category: "Dairy", quantity: 2, packageDescription: "2 litre", essential: true, substitution: "similar" },
  { id: "bread", name: "Wholemeal sliced bread", category: "Bakery", quantity: 1, packageDescription: "800g loaf", essential: true, substitution: "similar" },
  { id: "eggs", name: "Free-range eggs", category: "Dairy", quantity: 1, packageDescription: "12 pack", essential: true, substitution: "exact" },
  { id: "bananas", name: "Bananas", category: "Fruit & vegetables", quantity: 1, packageDescription: "1kg", essential: false, substitution: "similar" },
  { id: "mince", name: "Lean beef mince", category: "Meat", quantity: 1, packageDescription: "500g", essential: true, substitution: "similar" },
];

export const availableItems: GroceryItem[] = [
  ...starterItems,
  { id: "toothpaste", name: "Fluoride toothpaste", category: "Household", quantity: 1, packageDescription: "100ml", essential: false, substitution: "similar" },
  { id: "coffee", name: "Ground coffee", category: "Cupboard", quantity: 1, packageDescription: "227g", essential: false, substitution: "similar" },
  { id: "pasta", name: "Penne pasta", category: "Cupboard", quantity: 1, packageDescription: "500g", essential: false, substitution: "similar" },
];

export const retailers: RetailerPolicy[] = [
  { id: "tesco", name: "Tesco", deliveryFee: 6, serviceFee: 0, minimumBasket: 45, minimumSurcharge: 3, deliveryLabel: "Tomorrow, 18:00–20:00" },
  { id: "supervalu", name: "SuperValu", deliveryFee: 7, serviceFee: 0, minimumBasket: 0, minimumSurcharge: 0, deliveryLabel: "Tomorrow, 17:00–19:00" },
];

export const sampleCatalogue: CatalogueProduct[] = [
  { id: "t-milk", groceryItemId: "milk", retailer: "tesco", name: "Tesco Low Fat Milk", packageDescription: "2 litre", price: 2.35, available: true },
  { id: "t-bread", groceryItemId: "bread", retailer: "tesco", name: "Tesco Wholemeal Sliced Pan", packageDescription: "800g", price: 1.55, available: true },
  { id: "t-eggs", groceryItemId: "eggs", retailer: "tesco", name: "Free Range Irish Eggs", packageDescription: "12 pack", price: 4.25, available: true },
  { id: "t-bananas", groceryItemId: "bananas", retailer: "tesco", name: "Loose Bananas", packageDescription: "Approx. 1kg", price: 1.79, available: true },
  { id: "t-mince", groceryItemId: "mince", retailer: "tesco", name: "Irish Lean Beef Steak Mince", packageDescription: "500g", price: 5.25, available: true },
  { id: "t-toothpaste", groceryItemId: "toothpaste", retailer: "tesco", name: "Total Care Toothpaste", packageDescription: "100ml", price: 2.5, available: true },
  { id: "t-coffee", groceryItemId: "coffee", retailer: "tesco", name: "Italian Ground Coffee", packageDescription: "227g", price: 4.6, available: true },
  { id: "t-pasta", groceryItemId: "pasta", retailer: "tesco", name: "Penne Pasta", packageDescription: "500g", price: 1.15, available: true },
  { id: "s-milk", groceryItemId: "milk", retailer: "supervalu", name: "SuperValu Low Fat Milk", packageDescription: "2 litre", price: 2.29, available: true },
  { id: "s-bread", groceryItemId: "bread", retailer: "supervalu", name: "Wholemeal Sliced Pan", packageDescription: "800g", price: 1.69, available: true },
  { id: "s-eggs", groceryItemId: "eggs", retailer: "supervalu", name: "Irish Free Range Eggs", packageDescription: "12 pack", price: 4.49, available: true },
  { id: "s-bananas", groceryItemId: "bananas", retailer: "supervalu", name: "Banana Family Pack", packageDescription: "Approx. 1kg", price: 1.85, available: true, substituted: true },
  { id: "s-mince", groceryItemId: "mince", retailer: "supervalu", name: "SuperValu Lean Beef Mince", packageDescription: "500g", price: 5.49, available: false },
  { id: "s-toothpaste", groceryItemId: "toothpaste", retailer: "supervalu", name: "Fresh Mint Toothpaste", packageDescription: "100ml", price: 2.25, available: true },
  { id: "s-coffee", groceryItemId: "coffee", retailer: "supervalu", name: "Signature Ground Coffee", packageDescription: "227g", price: 4.4, available: true },
  { id: "s-pasta", groceryItemId: "pasta", retailer: "supervalu", name: "Penne Rigate", packageDescription: "500g", price: 1.25, available: true },
];
