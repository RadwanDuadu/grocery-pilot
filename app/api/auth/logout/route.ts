import { deleteCurrentSession } from "@/lib/server/session";

export async function POST() {
  try {
    await deleteCurrentSession();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Logout failed", error);
    return Response.json({ error: "Unable to sign out." }, { status: 500 });
  }
}
