interface FaucetButtonProps {
  disabled: boolean;
  isFunding: boolean;
  onFund: () => Promise<void>;
}

export default function FaucetButton({ disabled, isFunding, onFund }: FaucetButtonProps) {
  return (
    <section className="glass-card animate-floatIn rounded-2xl p-6 [animation-delay:100ms]">
      <h3 className="mb-2 font-sora text-lg font-semibold text-white">Testnet Funding</h3>
      <p className="mb-4 text-sm text-slate-300">
        Use Friendbot to fund this wallet with Test XLM. This is only available on Stellar Testnet.
      </p>

      <button
        type="button"
        onClick={onFund}
        disabled={disabled || isFunding}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isFunding ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-950/30 border-t-emerald-900" />
            Funding Wallet...
          </>
        ) : (
          "Fund Wallet with Test XLM"
        )}
      </button>
    </section>
  );
}
