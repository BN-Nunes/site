"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Product } from "./departments";
import { useCart } from "../CartContext";
import { Icon } from "../Icon";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function AddToCartButton({ product, department }: { product: Product; department: string }) {
  const { addItem, items } = useCart();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const dialogTitleId = useId();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const quantityInCart = items.find((item) => item.id === product.id)?.quantity ?? 0;

  useEffect(() => {
    if (!confirmationOpen) return;
    const triggerButton = addButtonRef.current;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    continueButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setConfirmationOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerButton?.focus();
    };
  }, [confirmationOpen]);

  function handleAdd() {
    addItem(product, department);
    setConfirmationOpen(true);
  }

  return (
    <div className="add-to-quote-wrap">
      {quantityInCart > 0 && <Link className="in-cart-note" href="/carrinho"><Icon name="check" size={14} /> {quantityInCart} no orçamento</Link>}
      <button ref={addButtonRef} className="add-to-quote" type="button" onClick={handleAdd} disabled={!product.available}>
        {!product.available ? "Indisponível" : quantityInCart > 0 ? "Adicionar mais um" : "Adicionar ao orçamento"}
      </button>

      {/* Portal no <body>: os cards animam com transform, o que prenderia um overlay position:fixed dentro do card. */}
      {confirmationOpen && createPortal(
        <div className="cart-confirmation-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmationOpen(false); }}>
          <section className="cart-confirmation-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={dialogTitleId}>
            <button className="cart-confirmation-close" type="button" onClick={() => setConfirmationOpen(false)} aria-label="Fechar confirmação"><Icon name="close" /></button>
            <span className="cart-confirmation-icon"><Icon name="check" size={28} /></span>
            <small>Adicionado ao orçamento</small>
            <h2 id={dialogTitleId}>{product.name}</h2>
            <p>{quantityInCart > 1 ? `Agora são ${quantityInCart} unidades no seu carrinho de orçamento.` : "O produto está no seu carrinho de orçamento."} Você pode ajustar as quantidades antes de enviar.</p>
            <div className="cart-confirmation-actions">
              <Link href="/carrinho">Ver carrinho e enviar</Link>
              <button ref={continueButtonRef} type="button" onClick={() => setConfirmationOpen(false)}>Continuar escolhendo</button>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </div>
  );
}
