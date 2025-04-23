import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../prisma";
import bcrypt from "bcryptjs";
// import { isAuthenticated } from "@/app/api/login/route";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // // Check authentication
    // const authenticated = await isAuthenticated();
    // if (!authenticated) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    
    const userId = parseInt(params.id);
    const { username, password } = await request.json();
    
    // Validate input
    if (!username) {
      return NextResponse.json(
        { message: "Username tidak boleh kosong" },
        { status: 400 }
      );
    }
    
    // Check if username already exists (but not for this user)
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        id: { not: userId },
      },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: "Username sudah digunakan" },
        { status: 400 }
      );
    }
    
    // Update user data
    const updateData: any = { username };
    
    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });
    
    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "UPDATE_USER",
        details: `User ${username} updated`,
        userId: parseInt(request.cookies.get("userId")?.value || "0"),
        ipAddress: request.headers.get("x-forwarded-for")?.split(',')[0] || "IP tidak ditemukan",
        userAgent: request.headers.get("user-agent"),
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // // Check authentication
    // const authenticated = await isAuthenticated();
    // if (!authenticated) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    
    const userId = parseInt(params.id);
    
    // Find the user first to get the username for logging
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    
    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }
    
    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });
    
    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "DELETE_USER",
        details: `User ${user.username} deleted`,
        userId: parseInt(request.cookies.get("userId")?.value || "0"),
        ipAddress: request.headers.get("x-forwarded-for")?.split(',')[0] || "IP tidak ditemukan",
        userAgent: request.headers.get("user-agent"),
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}