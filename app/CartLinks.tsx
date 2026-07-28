"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export function CartHeaderLink() {
  const { itemCount } = useCart();
  return <Link className="header-cart-link" href="/carrinho" aria-label={`Abrir carrinho de orçamento com ${itemCount} ${itemCount === 1 ? "item" : "itens"}`}><span aria-hidden="true">🛒</span><b>Carrinho</b><em>{itemCount}</em></Link>;
}

export function CartNavLink() {
  const { itemCount } = useCart();
  return <Link className="cart-nav-link" href="/carrinho">Carrinho <span>{itemCount}</span></Link>;
}
