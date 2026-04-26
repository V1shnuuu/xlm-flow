import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import {
  connectFreighter,
  disconnectFreighter,
  getFreighterAddress,
  isFreighterInstalled,
  isFreighterOnTestnet,
  signWithFreighter
} from "@/lib/freighter";
import {
  buildUnsignedPaymentViaApi,
  getAccountBalanceViaApi,
  getPaymentHistoryViaApi,
  submitSignedTransactionViaApi
} from "@/lib/api";
import {
  buildOptimisticHistoryItem,
  hasEnoughBalance,
  isNearFullBalanceTransfer
} from "@/lib/transaction";
import {
  getAddressWarning,
  isPositiveAmount,
  isValidMemo,
  isValidStellarAddress
} from "@/lib/validation";
import {
  type PaymentHistoryFilter,
  type PaymentHistoryItem,
  type SendPaymentInput,
  type TransactionStatusState
} from "@/types/stellar";

const WALLET_STORAGE_KEY = "stellarpay:lastConnectedAddress";
const HISTORY_PAGE_SIZE = 5;

export const parseError = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "An unexpected error occurred.";
};

const fundWithFriendbot = async (publicKey: string): Promise<void> => {
  const endpoint = `https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("Friendbot funding failed.");
  }
};

export function useDashboardData() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [txStatus, setTxStatus] = useState<TransactionStatusState>({ type: "idle", message: "" });

  const [historyFilter, setHistoryFilter] = useState<PaymentHistoryFilter>("all");
  const [historySortOrder, setHistorySortOrder] = useState<"newest" | "oldest">("newest");
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);

  const [isWalletProcessing, setIsWalletProcessing] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryLoadingMore, setIsHistoryLoadingMore] = useState(false);

  const loadBalance = useCallback(async (accountId: string, background = false) => {
    if (!background) setIsBalanceLoading(true);

    try {
      const updatedBalance = await getAccountBalanceViaApi(accountId);
      setBalance(updatedBalance);
    } finally {
      if (!background) setIsBalanceLoading(false);
    }
  }, []);

  const loadHistory = useCallback(
    async (
      accountId: string,
      options: { reset: boolean; cursor?: string | null; filter: PaymentHistoryFilter; background?: boolean }
    ) => {
      if (options.reset) {
        if (!options.background) setIsHistoryLoading(true);
      } else {
        setIsHistoryLoadingMore(true);
      }

      try {
        const payload = await getPaymentHistoryViaApi({
          accountId,
          filter: options.filter,
          cursor: options.cursor,
          limit: HISTORY_PAGE_SIZE
        });

        setHistory((current) => (options.reset ? payload.transactions : [...current, ...payload.transactions]));
        setHistoryCursor(payload.nextCursor);
        setHasMoreHistory(Boolean(payload.nextCursor));
      } finally {
        setIsHistoryLoading(false);
        setIsHistoryLoadingMore(false);
      }
    },
    []
  );

  const refreshWalletData = useCallback(
    async (accountId: string, options: { resetHistory: boolean; background?: boolean }) => {
      if (!options.background) setIsRefreshing(true);

      try {
        await Promise.all([
          loadBalance(accountId, Boolean(options.background)),
          loadHistory(accountId, {
            reset: options.resetHistory,
            filter: historyFilter,
            cursor: options.resetHistory ? null : historyCursor,
            background: options.background
          })
        ]);
      } catch (error) {
        const errorMessage = parseError(error);
        if (errorMessage.toLowerCase().includes("resource missing")) {
          setBalance("0");
          setHistory([]);
        } else {
          toast.error(errorMessage);
        }
      } finally {
        if (!options.background) setIsRefreshing(false);
      }
    },
    [historyCursor, historyFilter, loadBalance, loadHistory]
  );

  const syncExistingWallet = useCallback(async () => {
    const installed = await isFreighterInstalled();
    setIsInstalled(installed);

    if (!installed) return;

    const persistedAddress = window.localStorage.getItem(WALLET_STORAGE_KEY);
    if (!persistedAddress) return;

    try {
      const existingAddress = await getFreighterAddress();
      if (existingAddress !== persistedAddress) {
        window.localStorage.removeItem(WALLET_STORAGE_KEY);
        return;
      }

      setPublicKey(existingAddress);
      setIsConnected(true);

      const networkIsTestnet = await isFreighterOnTestnet();
      setWrongNetwork(!networkIsTestnet);
      await refreshWalletData(existingAddress, { resetHistory: true });
    } catch {
      window.localStorage.removeItem(WALLET_STORAGE_KEY);
      setIsConnected(false);
      setPublicKey(null);
    }
  }, [refreshWalletData]);

  useEffect(() => {
    syncExistingWallet().catch(() => {
      toast.error("Unable to initialize Freighter connection.");
    });
  }, [syncExistingWallet]);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const first = new Date(a.createdAt).getTime();
      const second = new Date(b.createdAt).getTime();

      if (historySortOrder === "newest") return second - first;
      return first - second;
    });
  }, [history, historySortOrder]);

  const handleConnectWallet = async () => {
    setIsWalletProcessing(true);

    try {
      if (!isInstalled) throw new Error("Freighter extension is not installed.");

      const address = await connectFreighter();
      setPublicKey(address);
      setIsConnected(true);
      window.localStorage.setItem(WALLET_STORAGE_KEY, address);

      const networkIsTestnet = await isFreighterOnTestnet();
      setWrongNetwork(!networkIsTestnet);
      if (!networkIsTestnet) {
        toast.error("Wrong network detected. Switch Freighter to Stellar Testnet.");
      }

      await refreshWalletData(address, { resetHistory: true });
      toast.success("Wallet connected.");
    } catch (error) {
      const message = parseError(error);
      toast.error(message);
      setIsConnected(false);
      setPublicKey(null);
      window.localStorage.removeItem(WALLET_STORAGE_KEY);
    } finally {
      setIsWalletProcessing(false);
    }
  };

  const handleDisconnectWallet = async () => {
    setIsWalletProcessing(true);

    try {
      await disconnectFreighter();
      setPublicKey(null);
      setIsConnected(false);
      setBalance("0");
      setHistory([]);
      setWrongNetwork(false);
      setTxStatus({ type: "idle", message: "" });
      setHistoryCursor(null);
      setHasMoreHistory(false);
      window.localStorage.removeItem(WALLET_STORAGE_KEY);
      toast.success("Wallet disconnected.");
    } catch (error) {
      toast.error(parseError(error));
    } finally {
      setIsWalletProcessing(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!publicKey) return;

    await navigator.clipboard.writeText(publicKey);
    toast.success("Address copied.");
  };

  const handleFundWallet = async () => {
    if (!publicKey) {
      toast.error("Connect wallet first.");
      return;
    }

    setIsFunding(true);

    try {
      await fundWithFriendbot(publicKey);
      await refreshWalletData(publicKey, { resetHistory: true });
      toast.success("Wallet funded with test XLM.");
    } catch (error) {
      toast.error(parseError(error));
    } finally {
      setIsFunding(false);
    }
  };

  const handleSendPayment = async (input: SendPaymentInput): Promise<boolean> => {
    if (!publicKey || !isConnected) {
      toast.error("Connect wallet before sending payments.");
      return false;
    }

    if (wrongNetwork) {
      toast.error("Switch Freighter to Stellar Testnet.");
      return false;
    }

    if (!isValidStellarAddress(input.destination)) {
      toast.error("Invalid Stellar destination address.");
      return false;
    }

    if (!isPositiveAmount(input.amount)) {
      toast.error("Amount must be greater than zero.");
      return false;
    }

    if (!isValidMemo(input.memo ?? "")) {
      toast.error("Memo is too long. Use 28 bytes or less.");
      return false;
    }

    const addressWarning = getAddressWarning(input.destination, publicKey);
    if (addressWarning && !window.confirm(`${addressWarning} Continue?`)) {
      return false;
    }

    if (!hasEnoughBalance(balance, input.amount, 0.5)) {
      toast.error("Insufficient balance. Keep reserve for account safety and fees.");
      return false;
    }

    if (isNearFullBalanceTransfer(input.amount, balance) && !window.confirm("You are sending nearly the full balance. Continue?")) {
      return false;
    }

    setTxStatus({ type: "pending", message: "Preparing and signing transaction..." });
    setIsSending(true);

    try {
      const unsignedXdr = await buildUnsignedPaymentViaApi(publicKey, input);
      const signedXdr = await signWithFreighter(unsignedXdr, publicKey);
      const hash = await submitSignedTransactionViaApi(signedXdr);

      setBalance((current) => {
        const next = Number(current) - Number(input.amount);
        return next > 0 ? next.toFixed(7) : "0";
      });
      setHistory((current) => [buildOptimisticHistoryItem(publicKey, input.destination, input.amount, hash), ...current]);

      setTxStatus({
        type: "success",
        message: "Transaction submitted successfully.",
        txHash: hash
      });

      toast.success("Payment sent.");
      void refreshWalletData(publicKey, { resetHistory: true, background: true });
      return true;
    } catch (error) {
      const message = parseError(error);
      setTxStatus({ type: "error", message });
      toast.error(message);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const handleFilterChange = async (filter: PaymentHistoryFilter) => {
    setHistoryFilter(filter);

    if (!publicKey) return;

    await loadHistory(publicKey, { reset: true, cursor: null, filter });
  };

  const handleLoadMore = async () => {
    if (!publicKey || !historyCursor || !hasMoreHistory) return;

    await loadHistory(publicKey, { reset: false, cursor: historyCursor, filter: historyFilter });
  };

  return {
    isInstalled,
    isConnected,
    wrongNetwork,
    publicKey,
    balance,
    txStatus,
    historyFilter,
    historySortOrder,
    hasMoreHistory,
    isWalletProcessing,
    isBalanceLoading,
    isRefreshing,
    isFunding,
    isSending,
    isHistoryLoading,
    isHistoryLoadingMore,
    sortedHistory,
    setHistorySortOrder,
    refreshWalletData,
    handleConnectWallet,
    handleDisconnectWallet,
    handleCopyAddress,
    handleFundWallet,
    handleSendPayment,
    handleFilterChange,
    handleLoadMore
  };
}
