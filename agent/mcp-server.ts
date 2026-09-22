#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { tescoBrowser } from "./tesco/browser";
import { assertCheckoutPreviewConfirmation } from "./tesco/safety";

const server = new McpServer({ name: "grocery-pilot-tesco-ie", version: "0.1.0" });
const itemSchema = z.object({
  name: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(20).default(1),
  maxUnitPrice: z.number().positive().max(500).optional(),
  substitution: z.enum(["similar", "exact", "none"]).default("similar"),
});

function result(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown Tesco agent error.";
  return { isError: true, content: [{ type: "text" as const, text: message }] };
}

server.registerTool("tesco_open_login", {
  title: "Open Tesco Ireland login",
  description: "Open a visible, dedicated Tesco Ireland browser profile so the user can sign in directly. Never accepts credentials as input.",
}, async () => {
  try { return result(await tescoBrowser.openLogin()); } catch (error) { return failure(error); }
});

server.registerTool("tesco_session_status", {
  title: "Check Tesco session",
  description: "Check whether the dedicated local Tesco browser is open and appears signed in.",
}, async () => {
  try { return result(await tescoBrowser.status()); } catch (error) { return failure(error); }
});

server.registerTool("tesco_close_session", {
  title: "Close Tesco browser session",
  description: "Close the dedicated Tesco browser cleanly while retaining its local profile for the next run.",
}, async () => {
  try { return result(await tescoBrowser.close()); } catch (error) { return failure(error); }
});

server.registerTool("tesco_search", {
  title: "Search Tesco Ireland",
  description: "Search the live Tesco Ireland website in the visible local browser. Results are unverified until the user reviews them.",
  inputSchema: { query: z.string().min(1).max(120), limit: z.number().int().min(1).max(10).default(5) },
}, async ({ query, limit }) => {
  try { return result(await tescoBrowser.search(query, limit)); } catch (error) { return failure(error); }
});

server.registerTool("tesco_prepare_basket", {
  title: "Prepare a Tesco basket",
  description: "Match a grocery list against Tesco Ireland. Defaults to dry-run. Set dryRun=false only after showing the proposed matches and budget to the user.",
  inputSchema: {
    items: z.array(itemSchema).min(1).max(100),
    maxProductsTotal: z.number().positive().max(5000),
    dryRun: z.boolean().default(true),
  },
}, async ({ items, maxProductsTotal, dryRun }) => {
  try { return result(await tescoBrowser.prepare(items, maxProductsTotal, dryRun)); } catch (error) { return failure(error); }
});

server.registerTool("tesco_open_basket", {
  title: "Open Tesco basket review",
  description: "Open the live Tesco basket for human review. Does not start payment or place an order.",
}, async () => {
  try { return result(await tescoBrowser.openBasket()); } catch (error) { return failure(error); }
});

server.registerTool("tesco_open_checkout_preview", {
  title: "Open Tesco checkout preview",
  description: "Open Tesco checkout for human review after explicit confirmation. The agent is technically prevented from clicking the final purchase button.",
  inputSchema: {
    confirmationPhrase: z.literal("REVIEW TESCO CHECKOUT"),
    expectedMaximum: z.number().positive().max(5000),
    calculatedMaximum: z.number().positive().max(5000),
  },
}, async ({ confirmationPhrase, expectedMaximum, calculatedMaximum }) => {
  try {
    assertCheckoutPreviewConfirmation(confirmationPhrase, expectedMaximum, calculatedMaximum);
    return result(await tescoBrowser.openCheckoutPreview());
  } catch (error) { return failure(error); }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Grocery Pilot Tesco Ireland MCP server is running over stdio.");
}

main().catch((error) => {
  console.error("Unable to start Grocery Pilot Tesco MCP server.", error);
  process.exitCode = 1;
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void tescoBrowser.close().finally(() => process.exit(0));
  });
}
