import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const pageSize = 5;
    const skip = (page - 1) * pageSize;

    const where: any = {
      userId: user.id,
      ...(search && { title: { contains: search } }),
      ...(status !== null && status !== "" && { completed: status === "completed" }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    if (title.trim().length > 200) {
      return NextResponse.json({ message: "Title must be 200 characters or less" }, { status: 400 });
    }

    if (description && description.length > 1000) {
      return NextResponse.json({ message: "Description must be 1000 characters or less" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        userId: user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
