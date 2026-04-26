export type NetworkName = "TESTNET";

export interface WalletState {
  isInstalled: boolean;
  isConnected: boolean;
  publicKey: string | null;
  network: NetworkName;
}

export interface TransactionStatusState {
  type: "idle" | "success" | "error" | "pending";
  message: string;
  txHash?: string;
}

export type PaymentHistoryFilter = "all" | "incoming" | "outgoing";

export interface PaymentHistoryItem {
  id: string;
  hash: string;
  amount: string;
  assetType: string;
  source: string;
  destination: string;
  createdAt: string;
  pagingToken?: string;
}

export interface SendPaymentInput {
  destination: string;
  amount: string;
  memo?: string;
}
