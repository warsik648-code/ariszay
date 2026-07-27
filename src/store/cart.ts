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
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, planId: string) => void;
  updateQuantity: (productId: string, planId: string, quantity: number) => void;
  clearCart: () => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  referralCode: string;
  setReferralCode: (code: string) => void;
  total: () => number;
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
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId && i.planId === newItem.planId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, newItem] };
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
                    ? { ...i, quantity }
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
    }),
    {
      name: "ariszay-cart",
      version: 1,
    },
  ),
);
