import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { groups: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ groups: user.groups });
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json(
      { error: "Group name is required" },
      { status: 400 }
    );
  }

  const newGroup = await prisma.group.create({
    data: {
      name,
      userId: user.id,
    },
  });

  return NextResponse.json({ group: newGroup }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { userId: clerkId } = await auth();
  console.log("Authenticated Clerk ID:", clerkId); // Debugging

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { groupId } = await req.json();
    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Get the Prisma user ID using Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the group and verify ownership
    const group = await prisma.group.findUnique({ where: { id: groupId } });

    console.log(
      `Group Owner ID: ${group?.userId}, Requesting User ID: ${user.id}`
    );

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this group" },
        { status: 403 }
      );
    }

    // Delete the group
    await prisma.group.delete({ where: { id: groupId } });

    return NextResponse.json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Group Deletion Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
