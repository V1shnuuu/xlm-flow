"use client";

import { useMemo, useState } from "react";

import { getAddressWarning } from "@/lib/validation";
import { type SendPaymentInput } from "@/types/stellar";

interface SendPaymentProps {
  isDisabled: boolean;
  isSending: boolean;
  maxAmount: string;
  currentBalance: string;
  sourceAddress: string | null;
  onSend: (input: SendPaymentInput) => Promise<boolean>;
}

export default function SendPayment({
  isDisabled,
  isSending,
  maxAmount,
  currentBalance,
  sourceAddress,
  onSend
}: SendPaymentProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [acknowledgeSafety, setAcknowledgeSafety] = useState(false);

  const warningMessage = useMemo(() => getAddressWarning(destination, sourceAddress), [destination, sourceAddress]);

  const nearFullBalance = useMemo(() => {
    const spend = Number(amount);
    const balance = Number(currentBalance);

    if (!Number.isFinite(spend) || !Number.isFinite(balance) || balance <= 0) {
      return false;
    }

    return spend / balance >= 0.95;
  }, [amount, currentBalance]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isSuccess = await onSend({
      destination,
      amount,
      memo
    });

    if (isSuccess) {
      setDestination("");
      setAmount("");
      setMemo("");
      setAcknowledgeSafety(false);
    }
  };

  return (
    <section className="glass-card animate-floatIn rounded-2xl p-6 [animation-delay:150ms]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-sora text-lg font-semibold text-white">Send XLM Payment</h3>
        <span className="rounded-full border border-cyan-300/30 bg-cyan-500/15 px-2 py-1 text-[11px] uppercase tracking-wide text-cyan-100">
          Testnet Only
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipient" className="mb-1 block text-sm text-slate-300">
            Recipient Address
          </label>
          <input
            id="recipient"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className="w-full rounded-xl border border-slate-400/30 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none ring-cyan-300 transition focus:ring-2"
            placeholder="G..."
            disabled={isDisabled || isSending}
          />
          {warningMessage && <p className="mt-2 text-xs text-amber-200">{warningMessage}</p>}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="amount" className="block text-sm text-slate-300">
              Amount (XLM)
            </label>
            <button
              type="button"
              onClick={() => setAmount(maxAmount)}
              disabled={isDisabled || isSending}
              className="text-xs text-cyan-200 transition hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Max
            </button>
          </div>
          <input
            id="amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-xl border border-slate-400/30 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none ring-cyan-300 transition focus:ring-2"
            placeholder="10"
            inputMode="decimal"
            disabled={isDisabled || isSending}
          />
          {nearFullBalance && (
            <p className="mt-2 text-xs text-yellow-200">Warning: you are sending nearly your full balance.</p>
          )}
        </div>

        <div>
          <label htmlFor="memo" className="mb-1 block text-sm text-slate-300">
            Memo (optional)
          </label>
          <input
            id="memo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            className="w-full rounded-xl border border-slate-400/30 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none ring-cyan-300 transition focus:ring-2"
            placeholder="Hackathon payment"
            disabled={isDisabled || isSending}
          />
        </div>

        <label className="flex items-start gap-2 rounded-xl border border-slate-400/25 bg-slate-900/35 p-3 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={acknowledgeSafety}
            onChange={(event) => setAcknowledgeSafety(event.target.checked)}
            className="mt-0.5"
            disabled={isDisabled || isSending}
          />
          <span>
            I understand this payment is irreversible. For multisig-managed wallets, verify required signer thresholds
            before sending.
            {sourceAddress ? ` Source: ${sourceAddress.slice(0, 6)}...${sourceAddress.slice(-6)}` : ""}
          </span>
        </label>

        <button
          type="submit"
          disabled={isDisabled || isSending || !acknowledgeSafety}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
              Sending Transaction...
            </>
          ) : (
            "Send Transaction"
          )}
        </button>
      </form>
    </section>
  );
}
