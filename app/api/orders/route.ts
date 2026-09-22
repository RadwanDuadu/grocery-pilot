import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { checkoutHandoffSchema } from "@/lib/server/validation";
import { getRetailerConnector } from "@/lib/retailers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const orders = await db.retailOrder.findMany({
    where: { userId: user.id },
    include: { retailer: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return Response.json({ orders });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in before starting checkout." }, { status: 401 });

    const parsed = checkoutHandoffSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

    const connector = getRetailerConnector(parsed.data.retailerId);
    const slot = connector.getDeliverySlots().find((candidate) => candidate.id === parsed.data.deliverySlotId);
    if (!slot) return Response.json({ error: "That delivery slot is no longer available." }, { status: 409 });

    const quote = connector.createQuote(parsed.data.items);
    const capturedAt = new Date();
    const expiresAt = new Date(capturedAt.getTime() + 15 * 60 * 1000);
    const retailer = await db.retailer.upsert({
      where: { slug: parsed.data.retailerId },
      update: { name: quote.retailer.name },
      create: { slug: parsed.data.retailerId, name: quote.retailer.name },
    });

    const order = await db.retailOrder.create({
      data: {
        userId: user.id,
        retailerId: retailer.id,
        provider: connector.mode,
        checkoutUrl: connector.checkoutUrl,
        deliveryEircode: parsed.data.eircode,
        deliverySlot: slot.label,
        subtotal: quote.subtotal,
        deliveryFee: quote.deliveryFee,
        minimumSurcharge: quote.minimumSurcharge,
        estimatedTotal: quote.total,
        quoteCapturedAt: capturedAt,
        quoteExpiresAt: expiresAt,
        sampleData: connector.sampleData,
        substitutionReview: quote.lines.map((line) => ({ itemId: line.item.id, policy: line.item.substitution, status: line.status })),
        basketSnapshot: quote.lines.map((line) => ({ itemId: line.item.id, name: line.item.name, quantity: line.item.quantity, unitPrice: line.product?.price ?? null, lineTotal: line.lineTotal, status: line.status })),
      },
    });

    return Response.json({
      order: { id: order.id, status: order.status, sampleData: order.sampleData },
      handoff: { url: order.checkoutUrl, basketTransferred: false },
      warning: "This development connector records the checkout attempt but cannot transfer the basket or place an order.",
    }, { status: 201 });
  } catch (error) {
    console.error("Checkout handoff failed", error);
    return Response.json({ error: "Unable to start checkout." }, { status: 500 });
  }
}
