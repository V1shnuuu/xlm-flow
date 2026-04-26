import { EXPLORER_TX_BASE } from "@/lib/constants";
import { type TransactionStatusState } from "@/types/stellar";

interface TransactionStatusProps {
  status: TransactionStatusState;
}

export default function TransactionStatus({ status }: TransactionStatusProps) {
  if (status.type === "idle") {
    return null;
  }

  if (status.type === "pending") {
    return (
      <section className="animate-floatIn rounded-xl border border-cyan-300/30 bg-cyan-500/15 p-4 text-sm text-cyan-100">
        <p className="font-medium">{status.message}</p>
      </section>
    );
  }

  const isSuccess = status.type === "success";

  return (
    <section
      className={`animate-floatIn rounded-xl border p-4 text-sm ${
        isSuccess ? "border-emerald-300/30 bg-emerald-500/15 text-emerald-100" : "border-rose-300/30 bg-rose-500/15 text-rose-100"
      }`}
    >
      <p className="font-medium">{status.message}</p>
      {status.txHash && (
        <div className="mt-2 space-y-1 text-xs">
          <p className="break-all text-slate-100">Hash: {status.txHash}</p>
          <a
            href={`${EXPLORER_TX_BASE}/${status.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-cyan-100 underline underline-offset-2"
          >
            View on Explorer
          </a>
        </div>
      )}
    </section>
  );
}
