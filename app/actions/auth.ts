
"use server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import { recordLoginAttempt, isLocked } from "@/lib/login-attempts"

// Separate type for login, which includes password_hash


interface DBUser {
  id: number;
  username: string;
  email: string;
  role: string;
  points: number;
  reserved_points: number;
  password_hash: string;
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string | undefined;

  // Check if locked
  const lockedFor = isLocked(email);
  if (lockedFor > 0) {
    return { success: false, message: `Too many failed attempts. Try again in ${lockedFor} seconds.` };
  }

  try {
    const users = await query<DBUser>(
      `SELECT id, username, email, role, points, reserved_points, password_hash 
       FROM users 
       WHERE email = $1 
       LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      recordLoginAttempt(email, false);
      console.log("[LOGIN] No user found for email:", email);
      // Redirect to login page if user not found
      // Use Next.js redirect utility
      const { redirect } = await import("next/navigation");
      redirect("/login");
    }

    const user = users[0];

    // If user is missing required fields, fail login
    if (!user.email || !user.username || !user.role) {
      console.log("[LOGIN] User missing required fields:", user);
      return { success: false, message: "Invalid account. Please login again." };
    }

    // If password is provided, check it (normal login)
    if (password !== undefined) {
      if (password !== user.password_hash) {
        recordLoginAttempt(email, false);
        console.log("[LOGIN] Invalid password for email:", email);
        return { success: false, message: "Invalid password" };
      }
      // Success: reset attempts
      recordLoginAttempt(email, true);
    }
    // If password is not provided, allow login (Google OAuth)

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    cookieStore.set("userRole", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    console.log("[LOGIN] Successful login for user:", user);
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points,
        reserved_points: user.reserved_points,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}


export async function getCurrentUser(): Promise<DBUser | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
      return null;
    }
    const users = await query<DBUser>(
      `SELECT id, username, email, role, points, reserved_points, password_hash 
       FROM users 
       WHERE id = $1 
       LIMIT 1`,
      [Number.parseInt(userId)]
    );
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}
export async function register(formData: FormData) {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  let password = formData.get("password") as string | undefined
  const whatsapp = formData.get("whatsapp") as string

  try {
    const existingUsers = await query(
      `SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1`,
      [email, username]
    )

    if (existingUsers.length > 0) {
      // Always auto-login if user already exists (Google or custom)
      return await login(formData);
    }

    // If password is missing (Google signup), generate a random hash
    if (!password) {
      password = Math.random().toString(36).slice(-12);
    }
    // In production, hash the password!
    const passwordHash = password;

    const result = await query(
      `INSERT INTO users (username, email, password_hash, whatsapp, role, points, reserved_points)
       VALUES ($1, $2, $3, $4, 'customer', 0, 0)
       RETURNING id, username, email, role, points, reserved_points`,
      [username, email, passwordHash, whatsapp]
    );

    // Auto-login: set cookies for the new user
    if (result[0]) {
      const cookieStore = await cookies();
      cookieStore.set("userId", result[0].id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      cookieStore.set("userRole", result[0].role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }
    // Return the new user object
    return {
      success: true,
      user: result[0] || null,
    };
  } catch (error) {
    console.error("Create user error:", error)
    return { success: false, message: "Failed to create user" }
  }
}
