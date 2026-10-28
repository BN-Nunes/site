"use client";

import Link, { useLinkStatus } from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";

/**
 * "Carregar mais": um link comum para a próxima página, que funciona sem JavaScript e que o
 * Google segue para achar todos os produtos. Com JavaScript, os próximos produtos entram na
 * grade sem recarregar nem rolar a página, e o foco vai para o primeiro deles.
 */
export function ProductsPager({ gridId, shown, total, nextHref }: { gridId: string; shown: number; total: number; nextHref: string | null }) {
  const focusIndex = useRef<number | null>(null);

  useEffect(() => {
    const index = focusIndex.current;
    if (index === null || shown <= index) return;
    focusIndex.current = null;
    const card = document.getElementById(gridId)?.querySelectorAll<HTMLElement>(".product-card")[index];
    if (!card) return;
    card.tabIndex = -1;
    card.focus({ preventScroll: true });
  }, [gridId, shown]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Ctrl/Cmd+clique abre outra aba: esta página não muda, então o foco fica onde está.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    focusIndex.current = shown;
  }

  return (
    <div className="products-pager">
      <p>Mostrando {shown} de {total} produtos</p>
      {nextHref && (
        <Link className="button products-pager-more" href={nextHref} scroll={false} replace onClick={handleClick}>
          <LoadMoreLabel />
        </Link>
      )}
    </div>
  );
}

function LoadMoreLabel() {
  const { pending } = useLinkStatus();
  return pending ? "Carregando…" : "Carregar mais produtos";
}
