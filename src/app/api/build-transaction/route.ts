import { NextRequest, NextResponse } from "next/server";

import { buildPaymentTransaction } from "@/lib/stellar";
import { isPositiveAmount, isValidMemo, isValidStellarAddress } from "@/lib/validation";

interface BuildTransactionBody {
  sourcePublicKey?: string;
  destination?: string;
  amount?: string;
  memo?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as BuildTransactionBody | null;

  const sourcePublicKey = body?.sourcePublicKey?.trim() ?? "";
  const destination = body?.destination?.trim() ?? "";
  const amount = body?.amount?.trim() ?? "";
  const memo = body?.memo?.trim() ?? "";

  if (!isValidStellarAddress(sourcePublicKey)) {
    return NextResponse.json({ error: "Invalid source wallet address." }, { status: 400 });
  }

  if (!isValidStellarAddress(destination)) {
    return NextResponse.json({ error: "Invalid destination wallet address." }, { status: 400 });
  }

  if (!isPositiveAmount(amount)) {
    return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }

  if (!isValidMemo(memo)) {
    return NextResponse.json({ error: "Memo must be 28 bytes or less." }, { status: 400 });
  }

  try {
    const unsignedXdr = await buildPaymentTransaction(sourcePublicKey, {
      destination,
      amount,
      memo
    });

    return NextResponse.json({ unsignedXdr });
  } catch {
    return NextResponse.json({ error: "Failed to build transaction." }, { status: 500 });
  }
}
