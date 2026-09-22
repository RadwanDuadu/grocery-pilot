import type { BasketQuote, GroceryItem, RetailerId } from "@/lib/types";

export type DeliverySlot = { id: string; label: string };

export interface RetailerConnector {
  id: RetailerId;
  mode: "mock" | "live";
  sampleData: boolean;
  checkoutUrl: string;
  productSearchUrl(itemName: string): string | null;
  getDeliverySlots(): DeliverySlot[];
  createQuote(items: GroceryItem[]): BasketQuote;
}
