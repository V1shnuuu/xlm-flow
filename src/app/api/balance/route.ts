import { NextRequest, NextResponse } from "next/server";

import { getAccountBalance } from "@/lib/stellar";
import { isValidStellarAddress } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const account = request.nextUrl.searchParams.get("account")?.trim() ?? "";
  if (!isValidStellarAddress(account)) {
    return NextResponse.json({ error: "Invalid account address." }, { status: 400 });
  }

  try {
console.log("Balance API Calling getAccountBalance with account:", JSON.stringify(account));
    const balance = await getAccountBalance(account);
    return NextResponse.json({ balance });
  } catch (error) {
    console.error("Balance API Error:", error);
    if (error instanceof Error && error.message.toLowerCase().includes("resource missing")) {
      return NextResponse.json({ balance: "0" });
    }

    return NextResponse.json({ error: "Failed to fetch account balance." }, { status: 500 });
  }
}
