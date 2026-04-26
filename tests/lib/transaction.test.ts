import {
  buildOptimisticHistoryItem,
  formatXlmAmount,
  hasEnoughBalance,
  isNearFullBalanceTransfer
} from "@/lib/transaction";

describe("transaction helpers", () => {
  it("formats XLM amounts to 7 decimals", () => {
    expect(formatXlmAmount("1")).toBe("1.0000000");
    expect(formatXlmAmount("0.123456789")).toBe("0.1234568");
    expect(formatXlmAmount("bad")).toBe("0.0000000");
  });

  it("checks spend safety against reserve", () => {
    expect(hasEnoughBalance("10", "9", 0.5)).toBe(true);
    expect(hasEnoughBalance("10", "9.8", 0.5)).toBe(false);
  });

  it("detects near full-balance transfers", () => {
    expect(isNearFullBalanceTransfer("9.6", "10")).toBe(true);
    expect(isNearFullBalanceTransfer("3", "10")).toBe(false);
  });

  it("creates optimistic history records", () => {
    const tx = buildOptimisticHistoryItem(
      "GBRPYHIL2C4QVU6AUGS3QX5P4N3W6C3Q2Q5YOC5SH4SMV2TEPWQY4CU6",
      "GD5DJM7KJFBQ3N4I5I37ZQWI3SPQ7TIKGN4I7XMBP6HPN2UEX7MEAX2C",
      "5",
      "abc123"
    );

    expect(tx.hash).toBe("abc123");
    expect(tx.amount).toBe("5.0000000");
  });
});
