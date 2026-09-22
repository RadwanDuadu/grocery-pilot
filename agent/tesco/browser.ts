import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type BrowserContext, type Locator, type Page } from "playwright";
import type { BasketPreparation, PreparedLine, ShoppingRequestItem, TescoProduct } from "./types";
import { assertCanMutateBasket, createPreparation } from "./safety";

const TESCO_BASE = "https://www.tesco.ie/shop/en-IE";
const PROFILE_DIR = path.resolve(process.cwd(), ".grocery-pilot/tesco-profile");
const cardSelectors = [
  '[data-auto="product-tile"]',
  '[data-testid="product-tile"]',
  'li[class*="product-list"]',
  'li:has(a[href*="/products/"])',
  'article:has(a[href*="/products/"])',
  'article:has(h3)',
];

class TescoBrowserAgent {
  private context: BrowserContext | null = null;

  async open() {
    if (this.context) return this.context;
    await mkdir(PROFILE_DIR, { recursive: true, mode: 0o700 });
    this.context = await chromium.launchPersistentContext(PROFILE_DIR, {
      channel: "chrome",
      headless: false,
      viewport: { width: 1360, height: 900 },
      locale: "en-IE",
      timezoneId: "Europe/Dublin",
    });
    this.context.on("close", () => { this.context = null; });
    return this.context;
  }

  async page() {
    const context = await this.open();
    return context.pages()[0] ?? context.newPage();
  }

  async close() {
    if (this.context) await this.context.close();
    this.context = null;
    return { closed: true };
  }

  async openLogin() {
    const page = await this.page();
    await page.goto("https://secure.tesco.ie/account/en-IE/login", { waitUntil: "domcontentloaded" });
    await page.bringToFront();
    return { opened: true, url: page.url(), message: "Sign in directly in the visible Tesco window. Grocery Pilot cannot read your password." };
  }

  async status() {
    const page = await this.page();
    if (!page.url().startsWith("https://www.tesco.ie") && !page.url().startsWith("https://secure.tesco.ie")) {
      await page.goto(`${TESCO_BASE}/`, { waitUntil: "domcontentloaded" });
    }
    const signInVisible = await page.getByRole("link", { name: /sign in/i }).first().isVisible().catch(() => false);
    return { browserOpen: true, likelySignedIn: !signInVisible, url: page.url() };
  }

  async search(query: string, limit = 5): Promise<TescoProduct[]> {
    const page = await this.page();
    await page.goto(`${TESCO_BASE}/search?query=${encodeURIComponent(query)}`, { waitUntil: "domcontentloaded" });
    await this.assertRetailerAccess(page);
    await this.dismissCookies(page);
    await page.getByRole("heading", { name: /results for/i }).waitFor({ timeout: 15_000 }).catch(() => undefined);
    await page.locator('a[href*="/products/"]').first().waitFor({ timeout: 10_000 }).catch(() => undefined);
    const cards = await this.findCards(page);
    const count = Math.min(await cards.count(), limit);
    const products: TescoProduct[] = [];
    for (let index = 0; index < count; index += 1) products.push(await this.readProduct(cards.nth(index), index));
    return products;
  }

  async prepare(items: ShoppingRequestItem[], budget: number, dryRun: boolean): Promise<BasketPreparation> {
    const lines: PreparedLine[] = [];
    for (const item of items) {
      const products = await this.search(item.name, 5);
      const selected = products.find((product) => product.available && product.price !== null) ?? null;
      if (!selected) {
        lines.push({ requested: item, selected: null, status: "missing", message: "No available result was found." });
      } else if (item.maxUnitPrice !== undefined && selected.price! > item.maxUnitPrice) {
        lines.push({ requested: item, selected, status: "over-unit-limit", message: `€${selected.price!.toFixed(2)} exceeds the item limit.` });
      } else {
        lines.push({ requested: item, selected, status: "planned" });
      }
    }

    assertCanMutateBasket(budget, lines);
    if (!dryRun) {
      for (const line of lines) {
        if (line.status !== "planned" || !line.selected) continue;
        try {
          await this.addSearchResult(line.requested.name, line.selected.resultIndex, line.requested.quantity);
          line.status = "added";
        } catch (error) {
          line.status = "failed";
          line.message = error instanceof Error ? error.message : "Unable to add item.";
        }
      }
    }
    return createPreparation(lines, budget, dryRun);
  }

  async openBasket() {
    const page = await this.page();
    await page.goto(`${TESCO_BASE}/basket`, { waitUntil: "domcontentloaded" });
    await page.bringToFront();
    return { url: page.url(), message: "Review live prices, substitutions, delivery charges and quantities in the visible Tesco basket." };
  }

  async openCheckoutPreview() {
    const page = await this.page();
    await page.goto(`${TESCO_BASE}/checkout`, { waitUntil: "domcontentloaded" });
    await page.bringToFront();
    return { url: page.url(), finalPurchaseBlocked: true, message: "Checkout is open for human review. This agent does not click the final order button." };
  }

  private async addSearchResult(query: string, resultIndex: number, quantity: number) {
    const page = await this.page();
    await page.goto(`${TESCO_BASE}/search?query=${encodeURIComponent(query)}`, { waitUntil: "domcontentloaded" });
    await this.assertRetailerAccess(page);
    await this.dismissCookies(page);
    const card = (await this.findCards(page)).nth(resultIndex);
    const add = card.getByRole("button", { name: /add/i }).first();
    if (!await add.isVisible().catch(() => false)) throw new Error("Tesco add button was not found; the page may have changed.");
    await add.click();
    for (let count = 1; count < quantity; count += 1) {
      const increase = card.getByRole("button", { name: /increase|add one/i }).first();
      if (!await increase.isVisible().catch(() => false)) throw new Error("Quantity control was not found after adding the item.");
      await increase.click();
    }
  }

  private async findCards(page: Page): Promise<Locator> {
    for (const selector of cardSelectors) {
      const locator = page.locator(selector);
      if (await locator.count()) return locator;
    }
    const diagnostics = {
      title: await page.title(),
      url: page.url(),
      productLinks: await page.locator('a[href*="/products/"]').count(),
      headings: await page.locator("h2, h3").count(),
      text: ((await page.locator("body").innerText().catch(() => ""))).slice(0, 400),
    };
    throw new Error(`Tesco product cards were not found. Diagnostics: ${JSON.stringify(diagnostics)}`);
  }

  private async readProduct(card: Locator, resultIndex: number): Promise<TescoProduct> {
    const name = (await card.locator("h2, h3").first().textContent())?.trim() ?? "Unknown product";
    const cardText = (await card.textContent()) ?? "";
    const priceMatch = cardText.match(/€\s?(\d+(?:[.,]\d{1,2})?)/);
    const unitMatch = cardText.match(/€\s?\d+(?:[.,]\d{1,2})?\s*\/\s*([^\n]+)/);
    const href = await card.locator("a").first().getAttribute("href").catch(() => null);
    return {
      name,
      price: priceMatch ? Number(priceMatch[1].replace(",", ".")) : null,
      unitPrice: unitMatch?.[0]?.trim() ?? null,
      productUrl: href ? new URL(href, TESCO_BASE).toString() : null,
      available: !/out of stock|currently unavailable/i.test(cardText),
      resultIndex,
    };
  }

  private async dismissCookies(page: Page) {
    const button = page.getByRole("button", { name: /accept all cookies|accept cookies/i }).first();
    if (await button.isVisible().catch(() => false)) await button.click().catch(() => undefined);
  }

  private async assertRetailerAccess(page: Page) {
    const title = await page.title();
    const body = await page.locator("body").innerText().catch(() => "");
    if (/access denied/i.test(title) || /you don't have permission to access/i.test(body)) {
      throw new Error("Tesco Ireland blocked this automated browser session. Grocery Pilot will not bypass retailer anti-bot controls; use the assisted checkout flow or obtain authorized integration access.");
    }
  }
}

export const tescoBrowser = new TescoBrowserAgent();
