export const referralLinks = {
  isle: {
    xray: "https://payment-provider.com/isle-xray",
    pro: "https://payment-provider.com/isle-pro",
    private: "https://payment-provider.com/isle-private",
    ugc: "https://payment-provider.com/ugc",
    skinChanger: "https://payment-provider.com/skin-changer",
    cloudDma: "https://payment-provider.com/cloud-dma",
    hwidSpoofer: "https://payment-provider.com/hwid-spoofer",
  },
  naraka: {
    xray: "https://payment-provider.com/naraka-xray",
    pro: "https://payment-provider.com/naraka-pro",
    private: "https://payment-provider.com/naraka-private",
    ugc: "https://payment-provider.com/ugc",
    skinChanger: "https://payment-provider.com/skin-changer",
    cloudDma: "https://payment-provider.com/cloud-dma",
    hwidSpoofer: "https://payment-provider.com/hwid-spoofer",
  },
} as const;

export type ReferralGame = keyof typeof referralLinks;

export function getCheatReferralUrl(
  game: ReferralGame,
  tier: "xray" | "pro" | "private",
): string {
  return referralLinks[game][tier];
}

export function getProductReferralUrl(
  productSlug: "ugc" | "skin-changer" | "cloud-dma" | "hwid-spoofer",
): string {
  const map = {
    ugc: referralLinks.isle.ugc,
    "skin-changer": referralLinks.isle.skinChanger,
    "cloud-dma": referralLinks.isle.cloudDma,
    "hwid-spoofer": referralLinks.isle.hwidSpoofer,
  } as const;
  return map[productSlug];
}
