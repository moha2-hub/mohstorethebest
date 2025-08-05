import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }
  const { whatsapp } = await req.json();
  if (!whatsapp) {
    return NextResponse.json({ success: false, message: "WhatsApp number required" }, { status: 400 });
  }
  try {
    console.log("[COMPLETE PROFILE] Email:", session.user.email, "WhatsApp:", whatsapp);
    const updateResult = await query(
      `UPDATE users SET whatsapp = $1 WHERE email = $2`,
      [whatsapp, session.user.email]
    );
    console.log("[COMPLETE PROFILE] Update result:", updateResult);
    // Fetch user id and role
    const users = await query(
      `SELECT id, role, whatsapp FROM users WHERE email = $1 LIMIT 1`,
      [session.user.email]
    );
    console.log("[COMPLETE PROFILE] User after update:", users);
    if (users.length > 0) {
      const { id, role } = users[0];
      // Set custom cookies for app auth (Next.js app route API)
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      cookieStore.set("userId", id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      cookieStore.set("userRole", role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }
    return NextResponse.json({ success: true, revalidateSession: true });
  } catch (error) {
    console.error("[COMPLETE PROFILE] Error:", error);
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 });
  }
}
