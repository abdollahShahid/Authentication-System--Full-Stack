import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function GET(req: NextRequest) {
  try {
    await connect();

    // get user id from JWT (throws or returns undefined if invalid)
    let userId: string | undefined;
    try {
      userId = await getDataFromToken(req);
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User found", data: user },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("ME route error:", err);
    return NextResponse.json(
      { message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
