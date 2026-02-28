import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const thread = await Thread.findById(id).lean();
    if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json({ likes: thread.likes || [] });
  } catch (err: any) {
    console.error("debug likes error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
