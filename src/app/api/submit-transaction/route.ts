import { NextRequest, NextResponse } from "next/server";

import { submitSignedTransaction } from "@/lib/stellar";

interface SubmitTransactionBody {
  signedXdr?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as SubmitTransactionBody | null;
  const signedXdr = body?.signedXdr?.trim() ?? "";

  if (!signedXdr) {
    return NextResponse.json({ error: "Missing signed transaction XDR." }, { status: 400 });
  }

  try {
    const hash = await submitSignedTransaction(signedXdr);
    return NextResponse.json({ hash });
  } catch {
    return NextResponse.json({ error: "Failed to submit transaction." }, { status: 500 });
  }
}
