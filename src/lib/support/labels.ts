export const ticketStatusLabel: Record<string, string> = {
  NEW: "New",
  OPEN: "Open",
  WAITING_CUSTOMER: "Waiting for Customer",
  WAITING_STAFF: "Waiting for Staff",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const ticketCategoryLabel: Record<string, string> = {
  ORDER_SUPPORT: "Order Support",
  PAYMENT_ISSUE: "Payment Issue",
  REFUND_REQUEST: "Refund Request",
  TECHNICAL_ISSUE: "Technical Issue",
  ACCOUNT_ISSUE: "Account Issue",
  OTHER: "Other",
};

export const refundStatusLabel: Record<string, string> = {
  REQUESTED: "Requested",
  REVIEWING: "Reviewing",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};

export const refundReasonLabel: Record<string, string> = {
  NOT_WORKING: "Product not working",
  WRONG_PRODUCT: "Purchased wrong product",
  PAYMENT_ISSUE: "Payment issue",
  OTHER: "Other",
};

export const deliveryStatusLabel: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  DELIVERED: "Delivered",
  FAILED: "Failed",
};

export function statusChipClass(kind: "ok" | "warn" | "bad" | "info" | "muted") {
  switch (kind) {
    case "ok":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    case "warn":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
    case "bad":
      return "border-red-500/30 bg-red-500/10 text-red-400";
    case "info":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";
    default:
      return "border-white/15 bg-white/5 text-white/50";
  }
}
