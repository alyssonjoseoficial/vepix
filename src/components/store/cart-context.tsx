"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartItem = { productId: string; name: string; price: number; quantity: number; imageUrl?: string; freeShipping?: boolean };

export type AppliedCoupon = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  storeSlug,
  children,
}: {
  storeSlug: string;
  children: React.ReactNode;
}) {
  const storageKey = `cart-${storeSlug}`;
  const couponStorageKey = `coupon-${storeSlug}`;
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const savedCoupon = localStorage.getItem(couponStorageKey);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoaded(true);
  }, [storageKey, couponStorageKey]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(storageKey, JSON.stringify(items));
      if (appliedCoupon) {
        localStorage.setItem(couponStorageKey, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(couponStorageKey);
      }
    }
  }, [items, appliedCoupon, storageKey, couponStorageKey, isLoaded]);

  const value = useMemo<CartContextValue>(() => {
    const save = (newItems: CartItem[]) => {
      localStorage.setItem(storageKey, JSON.stringify(newItems));
      return newItems;
    };

    const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((p) => p.productId === item.productId);
        let newItems;
        if (existing) {
          newItems = prev.map((p) =>
            p.productId === item.productId
              ? { ...p, quantity: p.quantity + quantity }
              : p,
          );
        } else {
          newItems = [...prev, { ...item, quantity }];
        }
        return save(newItems);
      });
    };

    const removeItem = (productId: string) => {
      setItems((prev) => save(prev.filter((p) => p.productId !== productId)));
    };

    const updateQuantity = (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        save(prev.map((p) => (p.productId === productId ? { ...p, quantity } : p))),
      );
    };

    const clearCart = () => {
      setItems(() => save([]));
      setAppliedCoupon(null);
    };

    const applyCoupon = (coupon: AppliedCoupon) => setAppliedCoupon(coupon);
    const removeCoupon = () => setAppliedCoupon(null);

    let total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, addItem, removeItem, updateQuantity, clearCart, appliedCoupon, applyCoupon, removeCoupon, total, count };
  }, [items, appliedCoupon]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
