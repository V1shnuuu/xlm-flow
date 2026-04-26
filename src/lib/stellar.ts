import "server-only";

import { Account } from "@stellar/stellar-base/lib/account";
import { Asset } from "@stellar/stellar-base/lib/asset";
import { BASE_FEE, TransactionBuilder } from "@stellar/stellar-base/lib/transaction_builder";
import { Memo } from "@stellar/stellar-base/lib/memo";
import { Operation } from "@stellar/stellar-base/lib/operation";
import { StrKey } from "@stellar/stellar-base/lib/strkey";

import { HORIZON_URL, STELLAR_NETWORK_PASSPHRASE } from "@/lib/constants";
import { formatXlmAmount } from "@/lib/transaction";
import { type PaymentHistoryFilter, type PaymentHistoryItem, type SendPaymentInput } from "@/types/stellar";

interface HorizonAccountResponse {
  id: string;
  sequence: string;
  balances: Array<{
    asset_type: string;
    balance: string;
  }>;
}

interface HorizonPaymentRecord {
  id: string;
  paging_token: string;
  transaction_hash: string;
  amount: string;
  asset_type: string;
  from: string;
  to: string;
  created_at: string;
  type: string;
}

interface HorizonPaymentsResponse {
  _embedded?: {
    records?: HorizonPaymentRecord[];
  };
}

const fetchHorizon = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${HORIZON_URL}${path}`, init);
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { title?: string; detail?: string } | null;
    throw new Error(payload?.title ?? payload?.detail ?? "Horizon request failed.");
  }

  return (await response.json()) as T;
};

export const getAccountBalance = async (publicKey: string): Promise<string> => {
  if (!StrKey.isValidEd25519PublicKey(publicKey.trim())) {
    throw new Error("Invalid account address.");
  }

  const account = await fetchHorizon<HorizonAccountResponse>(`/accounts/${publicKey}`);
  const nativeBalance = account.balances.find((balance) => balance.asset_type === "native");
  return nativeBalance?.balance ?? "0";
};

export const buildPaymentTransaction = async (sourcePublicKey: string, input: SendPaymentInput): Promise<string> => {
  if (!StrKey.isValidEd25519PublicKey(sourcePublicKey.trim())) {
    throw new Error("Invalid source account.");
  }

  if (!StrKey.isValidEd25519PublicKey(input.destination.trim())) {
    throw new Error("Invalid destination account.");
  }

  const sourceAccount = await fetchHorizon<HorizonAccountResponse>(`/accounts/${sourcePublicKey}`);
  const feeStats = await fetchHorizon<{ last_ledger_base_fee?: string | number }>("/fee_stats");

  const account = new Account(sourceAccount.id, sourceAccount.sequence);
  const fee = String(feeStats.last_ledger_base_fee ?? BASE_FEE);

  const txBuilder = new TransactionBuilder(account, {
    fee,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE
  }).addOperation(
    Operation.payment({
      destination: input.destination,
      asset: Asset.native(),
      amount: formatXlmAmount(input.amount)
    })
  );

  if (input.memo?.trim()) {
    txBuilder.addMemo(Memo.text(input.memo.trim()));
  }

  const transaction = txBuilder.setTimeout(60).build();
  return transaction.toXDR();
};

export const submitSignedTransaction = async (signedXdr: string): Promise<string> => {
  const response = await fetch(`${HORIZON_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      tx: signedXdr
    })
  });

  const payload = (await response.json()) as { hash?: string; extras?: { result_codes?: { transaction?: string } } };
  if (!response.ok || !payload.hash) {
    const txErrorCode = payload.extras?.result_codes?.transaction;
    throw new Error(txErrorCode ? `Transaction failed: ${txErrorCode}` : "Horizon rejected the transaction.");
  }

  return payload.hash;
};

const matchesFilter = (tx: HorizonPaymentRecord, accountId: string, filter: PaymentHistoryFilter): boolean => {
  if (filter === "all") {
    return true;
  }

  if (filter === "incoming") {
    return tx.to === accountId;
  }

  return tx.from === accountId;
};

interface HistoryOptions {
  cursor?: string | null;
  limit: number;
  filter: PaymentHistoryFilter;
}

export const getPaymentHistory = async (
  publicKey: string,
  { cursor, limit, filter }: HistoryOptions
): Promise<{ transactions: PaymentHistoryItem[]; nextCursor: string | null }> => {
  const results: PaymentHistoryItem[] = [];
  let nextCursor = cursor ?? null;
  let attempts = 0;

  while (results.length < limit && attempts < 4) {
    attempts += 1;

    const searchParams = new URLSearchParams({
      order: "desc",
      limit: "20"
    });

    if (nextCursor) {
      searchParams.set("cursor", nextCursor);
    }

    const response = await fetchHorizon<HorizonPaymentsResponse>(
      `/accounts/${publicKey}/payments?${searchParams.toString()}`
    );

    const records = response._embedded?.records ?? [];
    if (!records.length) {
      break;
    }

    for (const record of records) {
      if (!(record.type === "payment" && record.asset_type === "native")) {
        continue;
      }

      nextCursor = record.paging_token;

      if (!matchesFilter(record, publicKey, filter)) {
        continue;
      }

      results.push({
        id: record.id,
        hash: record.transaction_hash,
        amount: record.amount,
        assetType: record.asset_type,
        source: record.from,
        destination: record.to,
        createdAt: record.created_at,
        pagingToken: record.paging_token
      });

      if (results.length >= limit) {
        break;
      }
    }

    if (records.length < 20) {
      break;
    }
  }

  return {
    transactions: results,
    nextCursor: results.length ? nextCursor : null
  };
};
