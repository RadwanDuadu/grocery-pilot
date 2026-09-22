import { buildQuote } from "@/lib/comparison";
import { retailers, sampleCatalogue } from "@/lib/sample-data";
import type { RetailerId } from "@/lib/types";
import type { RetailerConnector } from "./types";

const checkoutUrls: Record<RetailerId, string> = {
  tesco: "https://www.tesco.ie/groceries/",
  supervalu: "https://shop.supervalu.ie/",
};

export function createMockConnector(id: RetailerId): RetailerConnector {
  const retailer = retailers.find((candidate) => candidate.id === id);
  if (!retailer) throw new Error(`Unsupported retailer: ${id}`);

  return {
    id,
    mode: "mock",
    sampleData: true,
    checkoutUrl: checkoutUrls[id],
    getDeliverySlots: () => [
      { id: "preferred", label: retailer.deliveryLabel },
      { id: "following-day", label: "Following day, 10:00–12:00" },
    ],
    createQuote: (items) => buildQuote(retailer, items, sampleCatalogue),
  };
}
