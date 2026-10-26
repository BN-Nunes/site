"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { Icon } from "./Icon";

export function CartHeaderLink() {
  const { itemCount } = useCart();
  return (
    <Link className="header-action header-cart-link" href="/carrinho" aria-label={`Abrir carrinho de orçamento com ${itemCount} ${itemCount === 1 ? "item" : "itens"}`}>
      <span className="header-action-icon">
        <Icon name="cart" />
        {itemCount > 0 && <em>{itemCount > 99 ? "99+" : itemCount}</em>}
      </span>
      <b>Carrinho</b>
    </Link>
  );
}
