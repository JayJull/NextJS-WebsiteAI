'use server';
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

interface LoginData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResult {
  success: boolean;
  error?: string;
  ipAddress?: string;
}

interface ActivityLogData {
  action: string;
  details?: string;
  ipAddress?: string;
  userId?: number;
}

export async function login(data: LoginData): Promise<LoginResult> {
  try {
    // Validate input
    if (!data.username || !data.password) {
      throw new Error("Username dan password harus diisi");
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (!user) {
      throw new Error("Username atau password salah");
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new Error("Username atau password salah");
    }

    // Get IP address
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Set cookie with session information
    const cookieExpires = data.rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000; // 30 days or 24 hours

    // Create a session token with more security
    const sessionToken = await bcrypt.hash(
      user.id.toString() + Date.now().toString(),
      10
    );

    const cookieStore = await cookies();
    await cookieStore.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: cookieExpires,
      path: "/",
      sameSite: "strict",
    });

    await cookieStore.set("userId", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: cookieExpires,
      path: "/",
      sameSite: "strict",
    });

    return { success: true, ipAddress: ipAddress.toString() };
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Gagal login" };
  }
}

export async function logActivity(
  data: ActivityLogData
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const headersList = await headers();

    // Get IP address if not provided
    const ipAddress =
      data.ipAddress ||
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: data.action,
        details: data.details || "",
        ipAddress: ipAddress.toString(),
        userAgent: headersList.get("user-agent") || "unknown",
        userId: userId ? parseInt(userId) : data.userId || null,
        timestamp: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error logging activity:", error);
    return { success: false, error: "Failed to log activity" };
  }
}

export async function logout(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("sessionToken")?.value;
    const userId = cookieStore.get("userId")?.value;

    if (sessionToken) {
      // Remove session from database
      await prisma.session.deleteMany({
        where: {
          token: sessionToken,
        },
      });

      // Log logout activity
      await logActivity({
        action: "logout",
        details: `User logged out`,
        userId: userId ? parseInt(userId) : undefined,
      });
    }

    // Clear cookies
    await cookieStore.delete("sessionToken");
    await cookieStore.delete("userId");
    redirect("/");
  } catch (error) {
    console.error("Logout error:", error);
    redirect("/");
  }
}
