import React from "react";
import { type PaymentHistoryFilter, type PaymentHistoryItem } from "@/types/stellar";

interface TransactionHistoryProps {
  transactions: PaymentHistoryItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  accountId: string | null;
  filter: PaymentHistoryFilter;
  sortOrder: "newest" | "oldest";
  onFilterChange: (filter: PaymentHistoryFilter) => void;
  onSortChange: (sort: "newest" | "oldest") => void;
  onLoadMore: () => Promise<void>;
}

const FILTERS: Array<{ label: string; value: PaymentHistoryFilter }> = [
  { label: "All", value: "all" },
  { label: "Incoming", value: "incoming" },
  { label: "Outgoing", value: "outgoing" }
];

const shortAddress = (address: string): string => `${address.slice(0, 5)}...${address.slice(-5)}`;

const formatTxDirection = (tx: PaymentHistoryItem, accountId: string): "IN" | "OUT" => {
  return tx.destination === accountId ? "IN" : "OUT";
};

const skeletonRows = Array.from({ length: 4 }, (_, index) => index);

export default function TransactionHistory({
  transactions,
  isLoading,
  isLoadingMore,
  hasMore,
  accountId,
  filter,
  sortOrder,
  onFilterChange,
  onSortChange,
  onLoadMore
}: TransactionHistoryProps) {
  return (
    <section className="glass-card animate-floatIn rounded-2xl p-6 [animation-delay:200ms]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-sora text-lg font-semibold text-white">Recent Transactions</h3>
        <select
          value={sortOrder}
          onChange={(event) => onSortChange(event.target.value as "newest" | "oldest")}
          className="rounded-lg border border-slate-400/35 bg-slate-950/55 px-3 py-1 text-xs text-slate-200"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onFilterChange(item.value)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              item.value === filter
                ? "bg-cyan-400 text-slate-900"
                : "border border-slate-400/35 bg-slate-800/45 text-slate-200 hover:border-cyan-300/50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {skeletonRows.map((row) => (
            <div key={row} className="h-24 animate-pulse rounded-xl bg-slate-700/35" />
          ))}
        </div>
      ) : !transactions.length ? (
        <p className="text-sm text-slate-300">No transaction history yet.</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const direction = accountId ? formatTxDirection(tx, accountId) : "OUT";

            return (
              <article key={tx.id} className="rounded-xl border border-slate-400/20 bg-slate-900/35 p-3 text-sm text-slate-100">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className={`rounded-md px-2 py-1 text-xs ${direction === "IN" ? "bg-emerald-500/20 text-emerald-200" : "bg-cyan-500/20 text-cyan-200"}`}>
                    {direction}
                  </span>
                  <span className="font-semibold">{Number(tx.amount).toFixed(3)} XLM</span>
                </div>
                <p className="text-xs text-slate-300">Source: {shortAddress(tx.source)}</p>
                <p className="text-xs text-slate-300">Destination: {shortAddress(tx.destination)}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                <p className="mt-1 break-all text-xs text-slate-400">{tx.hash}</p>
              </article>
            );
          })}

          {hasMore && (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="w-full rounded-xl border border-slate-300/35 px-3 py-2 text-sm text-slate-100 transition hover:border-cyan-300/45 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingMore ? "Loading more..." : "Load More"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
