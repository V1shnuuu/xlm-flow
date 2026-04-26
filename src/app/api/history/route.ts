import { NextRequest, NextResponse } from "next/server";

import { getPaymentHistory } from "@/lib/stellar";
import { isPaymentHistoryFilter, isValidStellarAddress } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const account = request.nextUrl.searchParams.get("account")?.trim() ?? "";
  const cursor = request.nextUrl.searchParams.get("cursor");
  const filter = request.nextUrl.searchParams.get("filter") ?? "all";
  const limitValue = request.nextUrl.searchParams.get("limit") ?? "5";
  const limit = Number(limitValue);

  if (!isValidStellarAddress(account)) {
    return NextResponse.json({ error: "Invalid account address." }, { status: 400 });
  }

  if (!isPaymentHistoryFilter(filter)) {
    return NextResponse.json({ error: "Invalid history filter." }, { status: 400 });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
    return NextResponse.json({ error: "Invalid history limit." }, { status: 400 });
  }

  try {
    const payload = await getPaymentHistory(account, {
      cursor,
      filter,
      limit
    });

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("resource missing")) {
      return NextResponse.json({ transactions: [], nextCursor: null });
    }

    return NextResponse.json({ error: "Failed to fetch transaction history." }, { status: 500 });
  }
}
