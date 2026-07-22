import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/availability-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const availability = await getAvailability();
  return NextResponse.json(availability);
}
