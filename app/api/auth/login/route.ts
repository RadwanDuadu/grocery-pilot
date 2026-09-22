import { db } from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/password";
import { createSession } from "@/lib/server/session";
import { credentialsSchema } from "@/lib/server/validation";

export async function POST(request: Request) {
  try {
    const parsed = credentialsSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid email or password." }, { status: 400 });

    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createSession(user.id);
    return Response.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login failed", error);
    return Response.json({ error: "The database is unavailable. Start PostgreSQL and run the migration." }, { status: 503 });
  }
}
