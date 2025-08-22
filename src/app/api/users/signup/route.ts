import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export async function POST(req: Request) {
  try {
    await connect();

    const { username, email, password } = await req.json();
    if (!username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { username: username.trim() },
      ],
    }).lean();

    if (existing) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
    });

    return NextResponse.json({ message: "User created" }, { status: 201 }); // <-- must be 201
  } catch (e: any) {
    console.error("Signup API error:", e);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
