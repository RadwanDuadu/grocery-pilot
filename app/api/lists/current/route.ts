import { SubstitutionPolicy, ItemPriority } from "@/generated/prisma/enums";
import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { savedListSchema } from "@/lib/server/validation";

const toPolicy = {
  similar: SubstitutionPolicy.ALLOW_SIMILAR,
  exact: SubstitutionPolicy.EXACT_ONLY,
  none: SubstitutionPolicy.NO_SUBSTITUTION,
} as const;

const fromPolicy = {
  ALLOW_SIMILAR: "similar",
  EXACT_ONLY: "exact",
  NO_SUBSTITUTION: "none",
} as const;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

    const [address, list] = await Promise.all([
      db.address.findFirst({ where: { userId: user.id }, orderBy: { isDefault: "desc" } }),
      db.groceryList.findFirst({ where: { userId: user.id }, include: { items: { orderBy: { createdAt: "asc" } } }, orderBy: { updatedAt: "desc" } }),
    ]);

    return Response.json({
      eircode: address?.eircode ?? "",
      list: list ? {
        id: list.id,
        name: list.name,
        items: list.items.map((item) => ({
          id: item.catalogueItemId ?? item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          packageDescription: item.packageDescription ?? "Item",
          essential: item.priority === ItemPriority.ESSENTIAL,
          substitution: fromPolicy[item.substitutionPolicy],
          imageKey: item.imageKey ?? "pasta",
        })),
      } : null,
    });
  } catch (error) {
    console.error("List lookup failed", error);
    return Response.json({ error: "Unable to load the saved list." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

    const parsed = savedListSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

    const result = await db.$transaction(async (tx) => {
      const currentAddress = await tx.address.findFirst({ where: { userId: user.id, isDefault: true } });
      if (currentAddress) await tx.address.update({ where: { id: currentAddress.id }, data: { eircode: parsed.data.eircode } });
      else await tx.address.create({ data: { userId: user.id, eircode: parsed.data.eircode, isDefault: true } });

      let list = await tx.groceryList.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } });
      if (list) {
        list = await tx.groceryList.update({ where: { id: list.id }, data: { name: parsed.data.listName } });
        await tx.groceryListItem.deleteMany({ where: { listId: list.id } });
      } else {
        list = await tx.groceryList.create({ data: { userId: user.id, name: parsed.data.listName } });
      }

      if (parsed.data.items.length) {
        await tx.groceryListItem.createMany({ data: parsed.data.items.map((item) => ({
          listId: list.id,
          catalogueItemId: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          packageDescription: item.packageDescription,
          imageKey: item.imageKey,
          priority: item.essential ? ItemPriority.ESSENTIAL : ItemPriority.OPTIONAL,
          substitutionPolicy: toPolicy[item.substitution],
        })) });
      }
      return list;
    });

    return Response.json({ saved: true, listId: result.id, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error("List save failed", error);
    return Response.json({ error: "Unable to save the grocery list." }, { status: 500 });
  }
}
