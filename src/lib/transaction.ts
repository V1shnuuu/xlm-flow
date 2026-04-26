import { type PaymentHistoryItem } from "@/types/stellar";

export const formatXlmAmount = (value: string | number): string => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "0.0000000";
  }

  return amount.toFixed(7);
};

export const hasEnoughBalance = (
  balance: string | number,
  amount: string | number,
  reserve = 0
): boolean => {
  const currentBalance = Number(balance);
  const spendAmount = Number(amount);

  if (!Number.isFinite(currentBalance) || !Number.isFinite(spendAmount)) {
    return false;
  }

  return currentBalance - spendAmount >= reserve;
};

export const isNearFullBalanceTransfer = (
  amount: string | number,
  balance: string | number,
  threshold = 0.95
): boolean => {
  const spend = Number(amount);
  const total = Number(balance);

  if (!Number.isFinite(spend) || !Number.isFinite(total) || total <= 0) {
    return false;
  }

  return spend / total >= threshold;
};

export const buildOptimisticHistoryItem = (
  accountId: string,
  destination: string,
  amount: string,
  hash: string
): PaymentHistoryItem => {
  return {
    id: `optimistic-${hash}`,
    hash,
    amount: formatXlmAmount(amount),
    assetType: "native",
    source: accountId,
    destination,
    createdAt: new Date().toISOString()
  };
};
