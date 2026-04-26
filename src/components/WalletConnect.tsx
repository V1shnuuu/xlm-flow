interface WalletConnectProps {
  isInstalled: boolean;
  isConnected: boolean;
  isProcessing: boolean;
  wrongNetwork: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export default function WalletConnect({
  isInstalled,
  isConnected,
  isProcessing,
  wrongNetwork,
  onConnect,
  onDisconnect
}: WalletConnectProps) {
  return (
    <section className="glass-card animate-floatIn rounded-2xl p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-sora text-xl font-semibold text-white">Wallet Access</h2>
          <p className="text-sm text-slate-300">Connect your Freighter wallet to use StellarPay Lite.</p>
        </div>
      </div>

      {!isInstalled ? (
        <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Freighter extension not detected. Install Freighter and refresh the page.
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {isConnected ? (
            <button
              type="button"
              onClick={onDisconnect}
              disabled={isProcessing}
              className="rounded-xl border border-rose-300/30 bg-rose-500/20 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? "Disconnecting..." : "Disconnect Wallet"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              disabled={isProcessing}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? "Connecting..." : "Connect Freighter"}
            </button>
          )}

          {wrongNetwork && (
            <span className="rounded-md border border-yellow-300/40 bg-yellow-500/15 px-3 py-1 text-xs text-yellow-100">
              Switch Freighter to Stellar Testnet
            </span>
          )}
        </div>
      )}
    </section>
  );
}
