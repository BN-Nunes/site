"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Product } from "./departments";
import { useCart } from "../CartContext";

export function AddToCartButton({ product, department }: { product: Product; department: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const dialogTitleId = useId();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const cartLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!confirmationOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cartLinkRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setConfirmationOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      addButtonRef.current?.focus();
    };
  }, [confirmationOpen]);

  function handleAdd() {
    addItem(product, department);
    setAdded(true);
    setConfirmationOpen(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <button ref={addButtonRef} className={`add-to-quote${added ? " added" : ""}`} type="button" onClick={handleAdd} disabled={!product.available}>{!product.available ? "Indisponível" : added ? "Adicionado ao carrinho ✓" : "Adicionar ao orçamento"}</button>

      {confirmationOpen && (
        <div className="cart-confirmation-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmationOpen(false); }}>
          <section className="cart-confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby={dialogTitleId}>
            <button className="cart-confirmation-close" type="button" onClick={() => setConfirmationOpen(false)} aria-label="Fechar confirmação">×</button>
            <span className="cart-confirmation-icon" aria-hidden="true">✓</span>
            <small>Produto adicionado</small>
            <h2 id={dialogTitleId}>{product.name}</h2>
            <p>O produto foi adicionado ao seu carrinho de orçamento.</p>
            <div className="cart-confirmation-actions">
              <a ref={cartLinkRef} href="/carrinho">Ir para o carrinho</a>
              <button type="button" onClick={() => setConfirmationOpen(false)}>Continuar comprando</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
