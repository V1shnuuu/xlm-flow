import * as FreighterApi from "@stellar/freighter-api";

import { STELLAR_NETWORK_PASSPHRASE } from "@/lib/constants";

const getFreighterMethod = (name: string) => {
  const method = (FreighterApi as unknown as Record<string, unknown>)[name];
  return typeof method === "function" ? (method as (...args: unknown[]) => unknown) : null;
};

export const isFreighterInstalled = async (): Promise<boolean> => {
  const isConnectedMethod = getFreighterMethod("isConnected");
  if (!isConnectedMethod) {
    return false;
  }

  try {
    const result = (await isConnectedMethod()) as { isConnected?: boolean } | boolean;
    if (typeof result === "boolean") {
      return result;
    }

    return Boolean(result?.isConnected);
  } catch {
    return false;
  }
};

export const connectFreighter = async (): Promise<string> => {
  const requestAccessMethod = getFreighterMethod("requestAccess");
  if (!requestAccessMethod) {
    throw new Error("Freighter API unavailable. Please update the extension.");
  }

  const accessResult = (await requestAccessMethod()) as { error?: string; address?: string } | string;
  const addressFromAccess = normalizeFreighterAddressResponse(accessResult);
  if (addressFromAccess) {
    return addressFromAccess;
  }

  const getAddressMethod = getFreighterMethod("getAddress");
  if (!getAddressMethod) {
    throw new Error("Could not read wallet address from Freighter.");
  }

  const addressResult = (await getAddressMethod()) as { address?: string; error?: string } | string;
  const fallbackAddress = normalizeFreighterAddressResponse(addressResult);
  if (!fallbackAddress) {
    throw new Error("Wallet address unavailable.");
  }

  return fallbackAddress;
};

export const disconnectFreighter = async (): Promise<void> => {
  const method = getFreighterMethod("setAllowed");
  if (!method) {
    return;
  }

  await method(false);
};

export const getFreighterAddress = async (): Promise<string> => {
  const method = getFreighterMethod("getAddress");
  if (!method) {
    throw new Error("Freighter API unavailable.");
  }

  const result = (await method()) as { address?: string; error?: string } | string;
  const parsed = normalizeFreighterAddressResponse(result);
  if (!parsed) {
    throw new Error("Wallet address unavailable.");
  }

  return parsed;
};

export const isFreighterOnTestnet = async (): Promise<boolean> => {
  const getNetworkMethod = getFreighterMethod("getNetwork");
  if (getNetworkMethod) {
    try {
      const net = await getNetworkMethod();
      if (typeof net === "string") {
        return net.toUpperCase() === "TESTNET";
      }
    } catch {
      // ignore and fallback
    }
  }

  const method = getFreighterMethod("getNetworkDetails");
  if (!method) {
    return false;
  }

  const result = (await method()) as { error?: string; networkPassphrase?: string; network?: string };
  if (result?.error) {
    throw new Error(result.error);
  }

  return (
    result?.network?.toUpperCase() === "TESTNET" ||
    result?.networkPassphrase === STELLAR_NETWORK_PASSPHRASE
  );
};

export const signWithFreighter = async (transactionXdr: string, publicKey: string): Promise<string> => {
  const method = getFreighterMethod("signTransaction");
  if (!method) {
    throw new Error("Freighter signing is unavailable.");
  }

  const result = (await method(transactionXdr, {
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    address: publicKey
  })) as { error?: string; signedTxXdr?: string } | string;

  return normalizeFreighterSignResponse(result);
};

export const normalizeFreighterAddressResponse = (
  payload: { error?: string; address?: string } | string
): string | null => {
  if (typeof payload === "string") {
    if (payload.startsWith("G")) {
      return payload;
    }

    throw new Error(payload);
  }

  if (payload?.error) {
    throw new Error(payload.error);
  }

  return payload?.address?.trim() || null;
};

export const normalizeFreighterSignResponse = (
  payload: { error?: string; signedTxXdr?: string } | string
): string => {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload?.error || !payload?.signedTxXdr) {
    throw new Error(payload?.error ?? "Freighter did not return a signed transaction.");
  }

  return payload.signedTxXdr;
};
