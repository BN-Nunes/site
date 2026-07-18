"use client";

import { useState } from "react";
import type { Product } from "./departments";
import { useCart } from "../CartContext";

export function AddToCartButton({ product, department }: { product: Product; department: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, department);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return <button className={`add-to-quote${added ? " added" : ""}`} type="button" onClick={handleAdd} disabled={!product.available}>{!product.available ? "Indisponível" : added ? "Adicionado ao carrinho ✓" : "Adicionar ao orçamento"}</button>;
}
