import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { validateEmail, validatePassword } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ message: "Name must be 100 characters or less" }, { status: 400 });
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      return NextResponse.json({ message: emailErr }, { status: 400 });
    }

    const passErr = validatePassword(password);
    if (passErr) {
      return NextResponse.json({ message: passErr }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
