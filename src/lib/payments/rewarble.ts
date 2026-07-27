/** Rewarble Visa Gift Card payment configuration */

export const REWARBLE_PAYMENT_METHOD = "REWARBLE_VISA_GIFT_CARD" as const;

export const REWARBLE_GIFT_CARDS = {
  35: {
    amount: 35,
    label: "Buy $35 Gift Card",
    url: "https://www.g2a.com/rewarble-visa-gift-card-35-usd-by-rewarble-key-global-i10000502992020",
  },
  150: {
    amount: 150,
    label: "Buy $150 Gift Card",
    url: "https://www.g2a.com/rewarble-visa-gift-card-150-usd-by-rewarble-key-global-i10000502992008",
  },
} as const;

export type RewarbleAmount = keyof typeof REWARBLE_GIFT_CARDS;

/** Pick which G2A buttons to show for a cart/order total. */
export function giftCardsForTotal(total: number): (typeof REWARBLE_GIFT_CARDS)[RewarbleAmount][] {
  const rounded = Math.round(total * 100) / 100;
  if (rounded === 35) return [REWARBLE_GIFT_CARDS[35]];
  if (rounded === 150) return [REWARBLE_GIFT_CARDS[150]];
  // Multi-item / unexpected totals: show both supported denominations
  return [REWARBLE_GIFT_CARDS[35], REWARBLE_GIFT_CARDS[150]];
}

export function paymentStatusCustomerLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Pending Verification";
    case "PAID":
      return "Paid";
    case "FAILED":
      return "Payment Failed";
    case "UNPAID":
      return "Unpaid";
    case "REFUNDED":
      return "Refunded";
    default:
      return status;
  }
}

export function orderStatusCustomerLabel(status: string, paymentStatus: string): string {
  if (paymentStatus === "PENDING" && status === "PENDING") {
    return "Awaiting Payment Verification";
  }
  return status;
}
