import { type PaymentHistoryFilter, type PaymentHistoryItem, type SendPaymentInput } from "@/types/stellar";

interface ApiErrorPayload {
  error?: string;
}

interface BalanceResponse {
  balance: string;
}

interface HistoryResponse {
  transactions: PaymentHistoryItem[];
  nextCursor: string | null;
}

interface BuildTransactionResponse {
  unsignedXdr: string;
}

interface SubmitTransactionResponse {
  hash: string;
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
    throw new Error(payload?.error ?? "Request failed.");
  }

  return (await response.json()) as T;
};

export const getAccountBalanceViaApi = async (accountId: string): Promise<string> => {
  const response = await fetch(`/api/balance?account=${encodeURIComponent(accountId)}`, {
    cache: "no-store"
  });

  const payload = await parseResponse<BalanceResponse>(response);
  return payload.balance;
};

interface GetHistoryInput {
  accountId: string;
  filter: PaymentHistoryFilter;
  cursor?: string | null;
  limit?: number;
}

export const getPaymentHistoryViaApi = async ({
  accountId,
  filter,
  cursor,
  limit = 5
}: GetHistoryInput): Promise<HistoryResponse> => {
  const params = new URLSearchParams({
    account: accountId,
    filter,
    limit: String(limit)
  });

  if (cursor) {
    params.set("cursor", cursor);
  }

  const response = await fetch(`/api/history?${params.toString()}`, {
    cache: "no-store"
  });

  return parseResponse<HistoryResponse>(response);
};

export const buildUnsignedPaymentViaApi = async (
  sourcePublicKey: string,
  payment: SendPaymentInput
): Promise<string> => {
  const response = await fetch("/api/build-transaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sourcePublicKey,
      destination: payment.destination,
      amount: payment.amount,
      memo: payment.memo ?? ""
    })
  });

  const payload = await parseResponse<BuildTransactionResponse>(response);
  return payload.unsignedXdr;
};

export const submitSignedTransactionViaApi = async (signedXdr: string): Promise<string> => {
  const response = await fetch("/api/submit-transaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ signedXdr })
  });

  const payload = await parseResponse<SubmitTransactionResponse>(response);
  return payload.hash;
};
