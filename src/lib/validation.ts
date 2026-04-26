import { type PaymentHistoryFilter } from "@/types/stellar";

const STELLAR_PUBLIC_KEY_REGEX = /^G[A-Z2-7]{55}$/;

export const isValidStellarAddress = (value: string): boolean => {
  return STELLAR_PUBLIC_KEY_REGEX.test(value.trim());
};

export const isPositiveAmount = (value: string): boolean => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
};

export const isValidMemo = (value: string): boolean => {
  if (!value) {
    return true;
  }

  return new TextEncoder().encode(value).length <= 28;
};

export const isPaymentHistoryFilter = (value: string): value is PaymentHistoryFilter => {
  return value === "all" || value === "incoming" || value === "outgoing";
};

export const getAddressWarning = (destination: string, source: string | null): string | null => {
  const trimmed = destination.trim();

  if (source && trimmed === source) {
    return "You are sending to your own wallet. Please confirm this is intentional.";
  }

  if (destination !== destination.trim()) {
    return "Destination contains leading or trailing spaces.";
  }

  if (/[a-z]/.test(destination)) {
    return "Stellar public keys are uppercase only. Please recheck the destination.";
  }

  return null;
};
