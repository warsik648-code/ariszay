import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  productSlug: string;
  productName: string;
  planId: string;
  planLabel: string;
  price: number;
  quantity: number;
  /** Display helpers */
  gameName?: string;
  tierLabel?: string;
  productCode?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  /** Replace quantity for same product+plan, or insert. Digital licenses default to qty 1. */
  setItem: (item: CartItem) => void;
  removeItem: (productId: string, planId: string) => void;
  updateQuantity: (productId: string, planId: string, quantity: number) => void;
  clearCart: () => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  referralCode: string;
  setReferralCode: (code: string) => void;
  total: () => number;
  hasProductPlan: (productId: string, planId: string) => boolean;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: "",
      referralCode: "",

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === newItem.productId && i.planId === newItem.planId,
          );
          if (existing) {
            // Digital licenses: keep a single seat (qty 1) instead of stacking
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId && i.planId === newItem.planId
                  ? { ...i, ...newItem, quantity: 1 }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        }),

      setItem: (newItem) =>
        set((state) => {
          const without = state.items.filter(
            (i) => !(i.productId === newItem.productId && i.planId === newItem.planId),
          );
          return { items: [...without, { ...newItem, quantity: Math.max(1, newItem.quantity) }] };
        }),

      removeItem: (productId, planId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.planId === planId),
          ),
        })),

      updateQuantity: (productId, planId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => !(i.productId === productId && i.planId === planId),
                )
              : state.items.map((i) =>
                  i.productId === productId && i.planId === planId
                    ? { ...i, quantity: Math.min(quantity, 1) } // digital: max 1
                    : i,
                ),
        })),

      clearCart: () => set({ items: [], couponCode: "", referralCode: "" }),

      setCouponCode: (code) => set({ couponCode: code }),
      setReferralCode: (code) => set({ referralCode: code }),

      total: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      hasProductPlan: (productId, planId) =>
        get().items.some((i) => i.productId === productId && i.planId === planId),
    }),
    {
      name: "ariszay-cart",
      version: 2,
    },
  ),
);

/** Parse `/checkout?product=slug&plan=monthly|lifetime` style hrefs. */
export function parseCheckoutProductHref(href: string): {
  productSlug: string;
  plan?: "monthly" | "lifetime";
} | null {
  try {
    const url = new URL(href, "http://local.invalid");
    if (!url.pathname.includes("checkout")) return null;
    const productSlug = url.searchParams.get("product");
    if (!productSlug) return null;
    const planRaw = url.searchParams.get("plan");
    const plan =
      planRaw === "monthly" || planRaw === "lifetime" ? planRaw : undefined;
    return { productSlug, plan };
  } catch {
    return null;
  }
}
