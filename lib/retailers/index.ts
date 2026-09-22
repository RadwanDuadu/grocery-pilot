import type { RetailerId } from "@/lib/types";
import { createMockConnector } from "./mock";

export function getRetailerConnector(id: RetailerId) {
  return createMockConnector(id);
}
