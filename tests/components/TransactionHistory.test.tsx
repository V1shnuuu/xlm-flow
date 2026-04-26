import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import TransactionHistory from "@/components/TransactionHistory";
import { type PaymentHistoryItem } from "@/types/stellar";

const transactions: PaymentHistoryItem[] = [
  {
    id: "1",
    hash: "hash-1",
    amount: "12.3",
    assetType: "native",
    source: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    destination: "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBWJ6",
    createdAt: new Date().toISOString()
  }
];

describe("TransactionHistory", () => {
  it("renders skeleton state", () => {
    render(
      <TransactionHistory
        transactions={[]}
        isLoading
        isLoadingMore={false}
        hasMore={false}
        accountId={null}
        filter="all"
        sortOrder="newest"
        onFilterChange={() => {}}
        onSortChange={() => {}}
        onLoadMore={async () => {}}
      />
    );

    expect(screen.getByText("Recent Transactions")).toBeInTheDocument();
  });

  it("calls filter and load more handlers", () => {
    const onFilterChange = vi.fn();
    const onLoadMore = vi.fn().mockResolvedValue(undefined);

    render(
      <TransactionHistory
        transactions={transactions}
        isLoading={false}
        isLoadingMore={false}
        hasMore
        accountId={transactions[0].destination}
        filter="all"
        sortOrder="newest"
        onFilterChange={onFilterChange}
        onSortChange={() => {}}
        onLoadMore={onLoadMore}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Incoming" }));
    fireEvent.click(screen.getByRole("button", { name: "Load More" }));

    expect(onFilterChange).toHaveBeenCalledWith("incoming");
    expect(onLoadMore).toHaveBeenCalled();
  });
});
