"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import type { Product } from "./departments";
import { useCart } from "../CartContext";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function AddToCartButton({ product, department }: { product: Product; department: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const dialogTitleId = useId();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

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
    setAdded(true);
    setConfirmationOpen(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <button ref={addButtonRef} className={`add-to-quote${added ? " added" : ""}`} type="button" onClick={handleAdd} disabled={!product.available}>{!product.available ? "Indisponível" : added ? "Adicionado ao carrinho ✓" : "Adicionar ao orçamento"}</button>

      {confirmationOpen && (
        <div className="cart-confirmation-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmationOpen(false); }}>
          <section className="cart-confirmation-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={dialogTitleId}>
            <button className="cart-confirmation-close" type="button" onClick={() => setConfirmationOpen(false)} aria-label="Fechar confirmação">×</button>
            <span className="cart-confirmation-icon" aria-hidden="true">✓</span>
            <small>Produto adicionado</small>
            <h2 id={dialogTitleId}>{product.name}</h2>
            <p>O produto foi adicionado ao seu carrinho de orçamento.</p>
            <div className="cart-confirmation-actions">
              <Link href="/carrinho">Ir para o carrinho</Link>
              <button ref={continueButtonRef} type="button" onClick={() => setConfirmationOpen(false)}>Continuar comprando</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
