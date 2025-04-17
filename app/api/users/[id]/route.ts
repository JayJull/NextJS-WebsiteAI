// File: app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../prisma";
import bcrypt from "bcryptjs";
import { isAuthenticated } from "@/app/api/login/route";

// PUT /api/admin/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    const { username, password } = await request.json();

    // Validate input
    if (!username) {
      return NextResponse.json(
        { message: "Username tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if new username is already taken by another user
    if (username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username },
      });

      if (usernameExists) {
        return NextResponse.json(
          { message: "Username sudah digunakan" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = { username };

    // Update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
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

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "DELETE_USER",
        details: `User ${existingUser.username} deleted`,
        userId: parseInt(request.cookies.get("userId")?.value || "0"),
        ipAddress: request.headers.get("x-forwarded-for")?.split(',')[0] || "IP tidak ditemukan",
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json({
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}