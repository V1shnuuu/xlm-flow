interface BalanceCardProps {
  publicKey: string | null;
  balance: string;
  isRefreshing: boolean;
  isLoading: boolean;
  onCopyAddress: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

const shortAddress = (address: string | null): string => {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

export default function BalanceCard({
  publicKey,
  balance,
  isRefreshing,
  isLoading,
  onCopyAddress,
  onRefresh
}: BalanceCardProps) {
  return (
    <section className="glass-card animate-floatIn rounded-2xl p-6 [animation-delay:50ms]">
      <h3 className="mb-4 font-sora text-lg font-semibold text-white">Wallet Dashboard</h3>

      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">Public Key</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded-md bg-slate-900/55 px-3 py-1 text-sm text-cyan-100">{shortAddress(publicKey)}</code>
            <button
              type="button"
              onClick={onCopyAddress}
              disabled={!publicKey}
              className="rounded-md border border-cyan-300/35 px-2 py-1 text-xs text-cyan-100 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Copy
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">Balance</p>
          {isLoading ? (
            <div className="mt-2 h-9 w-40 animate-pulse rounded-lg bg-slate-700/45" />
          ) : (
            <p className="font-sora text-3xl font-semibold text-white">{Number(balance || 0).toFixed(4)} XLM</p>
          )}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={!publicKey || isRefreshing}
          className="rounded-xl border border-slate-300/30 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-300/35 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isRefreshing ? "Refreshing..." : "Refresh Balance"}
        </button>
      </div>
    </section>
  );
}
