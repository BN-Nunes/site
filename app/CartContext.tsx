"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "./departamentos/departments";
import { isFunctionalAllowed } from "./lib/cookie-consent";
import { clampQuantity, MAX_QUANTITY } from "./lib/cart-quantity";

export type CartItem = {
  id: string;
  name: string;
  description: string;
  department: string;
  image: string;
  price: string;
  sku?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (product: Product, department: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "impakto-orcamento";
const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return typeof item.id === "string" && typeof item.name === "string" && typeof item.department === "string" && typeof item.quantity === "number";
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do localStorage (indisponível no SSR) para sincronizar o carrinho sem causar mismatch de hidratação.
        if (Array.isArray(parsed)) setItems(parsed.filter(isCartItem).map((item) => ({ ...item, quantity: clampQuantity(item.quantity) })));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (isFunctionalAllowed()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    addItem(product, department) {
      setItems((current) => {
        const existing = current.find((item) => item.id === product.id);
        if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) } : item);
        return [...current, { id: product.id, name: product.name, description: product.description, department, image: product.image, price: product.price, sku: product.sku, quantity: 1 }];
      });
    },
    removeItem(id) { setItems((current) => current.filter((item) => item.id !== id)); },
    updateQuantity(id, quantity) {
      const safeQuantity = clampQuantity(quantity);
      setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: safeQuantity } : item));
    },
    clearCart() { setItems([]); },
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de CartProvider");
  return context;
}
