import { getCurrentUser } from "@/lib/server/session";

export async function GET() {
  try {
    return Response.json({ user: await getCurrentUser() });
  } catch (error) {
    console.error("Session lookup failed", error);
    return Response.json({ user: null, databaseAvailable: false }, { status: 503 });
  }
}
