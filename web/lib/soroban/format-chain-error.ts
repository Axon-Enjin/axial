/**
 * Map Soroban / classic Stellar errors to calm, actionable copy.
 */
export function formatChainError(error: string): string {
  const raw = error ?? "";

  if (raw.includes("RESOURCE_LIMIT_EXCEEDED") || raw.includes("Budget exceeded")) {
    return "Network congested. Liquidity action queued — wait about 30 seconds, then retry.";
  }
  if (raw.includes("op_bad_auth") || raw.includes("Invalid signature")) {
    return "Wallet signature invalid. Reconnect Freighter and try again.";
  }
  if (raw.includes("Error(Contract, #4)")) {
    return "This invoice is already funded on chain. Each invoice ID can only be swapped once.";
  }
  if (raw.includes("Error(Contract, #5)")) {
    return "Invalid face amount for swap.";
  }
  if (raw.includes("Error(Contract, #1)")) {
    return "Contract is not initialized on this deployment.";
  }
  if (raw.includes("Error(Contract, #13)") || (raw.includes("HostError") && raw.includes("#13"))) {
    return "Recipient has no USDC trustline. In Freighter → Assets → add USDC on mainnet, then retry.";
  }
  if (raw.includes("Error(Contract, #10)") || (raw.includes("HostError") && raw.includes("#10"))) {
    return "Treasury USDC balance too low for this advance. Fund the funder wallet with USDC on mainnet.";
  }

  return raw.length > 200 ? `${raw.slice(0, 200)}…` : raw;
}
