"use client";

import { useCart } from "./CartContext";

export function CartHeaderLink() {
  const { itemCount } = useCart();
  return <a className="header-cart-link" href="/carrinho" aria-label={`Abrir carrinho de orçamento com ${itemCount} ${itemCount === 1 ? "item" : "itens"}`}><span aria-hidden="true">🛒</span><b>Carrinho</b><em>{itemCount}</em></a>;
}

export function CartNavLink() {
  const { itemCount } = useCart();
  return <a className="cart-nav-link" href="/carrinho">Carrinho <span>{itemCount}</span></a>;
}
