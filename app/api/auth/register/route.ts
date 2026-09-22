import { db } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/password";
import { createSession } from "@/lib/server/session";
import { registerSchema } from "@/lib/server/validation";

export async function POST(request: Request) {
  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return Response.json({ error: "An account already exists for this email." }, { status: 409 });

    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password),
      },
      select: { id: true, name: true, email: true },
    });
    await createSession(user.id);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Registration failed", error);
    return Response.json({ error: "The database is unavailable. Start PostgreSQL and run the migration." }, { status: 503 });
  }
}
