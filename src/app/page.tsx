"use client";

import { useCallback, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

import BalanceCard from "@/components/BalanceCard";
import FaucetButton from "@/components/FaucetButton";
import Navbar from "@/components/Navbar";
import SendPayment from "@/components/SendPayment";
import TransactionHistory from "@/components/TransactionHistory";
import TransactionStatus from "@/components/TransactionStatus";
import WalletConnect from "@/components/WalletConnect";
import { NETWORK_LABEL } from "@/lib/constants";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const {
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
  } = useDashboardData();

  const applyTheme = useCallback((darkModeEnabled: boolean) => {
    const body = document.body;
    if (darkModeEnabled) {
      body.classList.add("dark");
    } else {
      body.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    applyTheme(true);
  }, [applyTheme]);

  const handleToggleTheme = () => {
    setIsDarkMode((current) => {
      const next = !current;
      applyTheme(next);
      return next;
    });
  };

  return (
    <main className="subtle-grid min-h-screen pb-10">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0a1725",
            color: "#d6ecff",
            border: "1px solid rgba(140, 203, 245, 0.35)"
          }
        }}
      />

      <Navbar isConnected={isConnected} onToggleTheme={handleToggleTheme} isDarkMode={isDarkMode} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="animate-floatIn rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-7 backdrop-blur-xl">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="inline-block rounded-full border border-cyan-200/30 bg-cyan-300/15 px-3 py-1 text-xs text-cyan-100">
              Stellar Testnet dApp
            </p>
            <p className="inline-block rounded-full border border-yellow-200/40 bg-yellow-400/15 px-3 py-1 text-xs text-yellow-100">
              Network: {NETWORK_LABEL}
            </p>
          </div>
          <h1 className="font-sora text-3xl font-bold text-white sm:text-4xl">Send XLM in seconds with Freighter</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
            StellarPay Lite is a polished, beginner-friendly payments dashboard that lets you connect Freighter,
            claim test funds from Friendbot, send native XLM, and inspect your latest transactions.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-1">
            <WalletConnect
              isInstalled={isInstalled}
              isConnected={isConnected}
              isProcessing={isWalletProcessing}
              wrongNetwork={wrongNetwork}
              onConnect={handleConnectWallet}
              onDisconnect={handleDisconnectWallet}
            />

            <BalanceCard
              publicKey={publicKey}
              balance={balance}
              isRefreshing={isRefreshing}
              isLoading={isBalanceLoading}
              onCopyAddress={handleCopyAddress}
              onRefresh={async () => {
                if (publicKey) {
                  await refreshWalletData(publicKey, { resetHistory: true });
                }
              }}
            />

            <FaucetButton
              disabled={!isConnected || !publicKey || wrongNetwork}
              isFunding={isFunding}
              onFund={handleFundWallet}
            />
          </div>

          <div className="space-y-6 xl:col-span-2">
            <SendPayment
              isDisabled={!isConnected || !publicKey || wrongNetwork}
              isSending={isSending}
              maxAmount={Number(balance || 0).toFixed(7)}
              currentBalance={balance}
              sourceAddress={publicKey}
              onSend={handleSendPayment}
            />

            <TransactionStatus status={txStatus} />

            <TransactionHistory
              transactions={sortedHistory}
              isLoading={isHistoryLoading}
              isLoadingMore={isHistoryLoadingMore}
              hasMore={hasMoreHistory}
              accountId={publicKey}
              filter={historyFilter}
              sortOrder={historySortOrder}
              onFilterChange={handleFilterChange}
              onSortChange={setHistorySortOrder}
              onLoadMore={handleLoadMore}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
