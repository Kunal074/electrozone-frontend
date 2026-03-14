import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      items:          [],
      storeId:        null,
      fulfillmentType: "HOME_DELIVERY",

      // Add to Cart
      addItem: (product, storeId) => {
        const { items, storeId: currentStoreId } = get();

        // Alag store ka product add karne pe cart clear karo
        if (currentStoreId && currentStoreId !== storeId) {
          if (!confirm("Cart mein alag store ka product hai. Cart clear karein?")) {
            return false;
          }
          set({ items: [], storeId: null });
        }

        const existing = items.find((i) => i.id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items:   [...items, { ...product, quantity: 1 }],
            storeId: storeId,
          });
        }
        return true;
      },

      // Remove from Cart
      removeItem: (productId) => {
        const { items } = get();
        const updated = items.filter((i) => i.id !== productId);
        set({
          items:   updated,
          storeId: updated.length === 0 ? null : get().storeId,
        });
      },

      // Update Quantity
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.id === productId ? { ...i, quantity } : i
          ),
        });
      },

      // Set Fulfillment Type
      setFulfillmentType: (type) => set({ fulfillmentType: type }),

      // Clear Cart
      clearCart: () => set({ items: [], storeId: null }),

      // Totals
      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity, 0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

export default useCartStore;