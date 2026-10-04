import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/data";

export async function GET() {
  const source = await getDataSource();
  return NextResponse.json({ source });
}
