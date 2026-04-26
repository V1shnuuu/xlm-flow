import {
  normalizeFreighterAddressResponse,
  normalizeFreighterSignResponse
} from "@/lib/freighter";

describe("freighter response parsing", () => {
  it("extracts address from string and object payloads", () => {
    const address = "GBRPYHIL2C4QVU6AUGS3QX5P4N3W6C3Q2Q5YOC5SH4SMV2TEPWQY4CU6";

    expect(normalizeFreighterAddressResponse(address)).toBe(address);
    expect(normalizeFreighterAddressResponse({ address })).toBe(address);
    expect(normalizeFreighterAddressResponse({})).toBeNull();
  });

  it("throws on Freighter address errors", () => {
    expect(() => normalizeFreighterAddressResponse({ error: "rejected" })).toThrow("rejected");
    expect(() => normalizeFreighterAddressResponse("Connection denied")).toThrow("Connection denied");
  });

  it("extracts or rejects signed transaction payloads", () => {
    expect(normalizeFreighterSignResponse("signed-xdr")).toBe("signed-xdr");
    expect(normalizeFreighterSignResponse({ signedTxXdr: "signed-xdr" })).toBe("signed-xdr");
    expect(() => normalizeFreighterSignResponse({ error: "cancelled" })).toThrow("cancelled");
  });
});
