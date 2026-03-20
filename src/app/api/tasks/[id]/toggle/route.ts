import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        completed: !task.completed,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
