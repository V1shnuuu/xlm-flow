import { getAddressWarning, isPositiveAmount, isValidMemo, isValidStellarAddress } from "@/lib/validation";

describe("validation helpers", () => {
  it("validates stellar public keys", () => {
    expect(isValidStellarAddress("GBRPYHIL2C4QVU6AUGS3QX5P4N3W6C3Q2Q5YOC5SH4SMV2TEPWQY4CU6")).toBe(true);
    expect(isValidStellarAddress("not-a-stellar-address")).toBe(false);
  });

  it("validates positive amounts", () => {
    expect(isPositiveAmount("0.00001")).toBe(true);
    expect(isPositiveAmount("0")).toBe(false);
    expect(isPositiveAmount("-1")).toBe(false);
    expect(isPositiveAmount("abc")).toBe(false);
  });

  it("validates memo byte length", () => {
    expect(isValidMemo("short memo")).toBe(true);
    expect(isValidMemo("x".repeat(29))).toBe(false);
  });

  it("warns on suspicious address cases", () => {
    const source = "GBRPYHIL2C4QVU6AUGS3QX5P4N3W6C3Q2Q5YOC5SH4SMV2TEPWQY4CU6";
    expect(getAddressWarning(source, source)).toContain("own wallet");
    expect(getAddressWarning(" gBAD  ", source)).toContain("spaces");
    expect(getAddressWarning("gBAD", source)).toContain("uppercase");
  });
});
