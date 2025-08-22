import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 400 });
    }

    // Atomically verify only if token is valid and not expired
    const user = await User.findOneAndUpdate(
      { verifyToken: token, verifyTokenExpiry: { $gt: Date.now() } },
      {
        $set: { isVerified: true },
        $unset: { verifyToken: "", verifyTokenExpiry: "" },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Email verified successfully",
      success: true,
    });
  } catch (err: any) {
    console.error("verifyemail error:", err);
    return NextResponse.json(
      { message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
