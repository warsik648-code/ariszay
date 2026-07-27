/**
 * All "buy" actions route to the internal checkout page.
 * Set the real payment provider URLs here when ready.
 */
export function getCheatReferralUrl(
  game: "isle" | "naraka",
  tier: "xray" | "pro" | "private",
): string {
  return `/checkout?product=${game}-${tier}`;
}

export function getProductReferralUrl(
  productSlug: "ugc" | "skin-changer" | "cloud-dma" | "hwid-spoofer",
): string {
  return `/checkout?product=${productSlug}`;
}
