import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function getTask(taskId: number, userId: number) {
  return prisma.task.findFirst({ where: { id: taskId, userId } });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId) || taskId < 1) {
      return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
    }

    const task = await getTask(taskId, user.id);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, completed } = body;

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json({ message: "Title cannot be empty" }, { status: 400 });
      }
      if (title.trim().length > 200) {
        return NextResponse.json({ message: "Title must be 200 characters or less" }, { status: 400 });
      }
    }

    if (description !== undefined && description && description.length > 1000) {
      return NextResponse.json({ message: "Description must be 1000 characters or less" }, { status: 400 });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(completed !== undefined && { completed: Boolean(completed) }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId) || taskId < 1) {
      return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
    }

    const task = await getTask(taskId, user.id);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({ where: { id: taskId } });

    return NextResponse.json({ message: "Task deleted" });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
