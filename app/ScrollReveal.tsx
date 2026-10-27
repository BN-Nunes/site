"use client";

import { useEffect } from "react";

const STAGGER_STEP_MS = 70;
const STAGGER_CAP_MS = 350;

/**
 * Revela com animação os cards que casam com `selector` quando entram na tela.
 * O CSS esconde esses cards até receberem `is-revealed`, então todo card novo precisa
 * ser observado — inclusive os que chegam numa navegação dentro do site (de um
 * departamento para outro, ou uma nova busca), quando o React reaproveita este
 * componente e o efeito não roda de novo. Por isso a página é reexaminada a cada mudança.
 */
export function ScrollReveal({ selector }: { selector: string }) {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observed = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        // A cascata conta só os cards que entram na tela juntos, não a posição na lista inteira.
        let batchIndex = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          target.style.animationDelay = `${Math.min(batchIndex++ * STAGGER_STEP_MS, STAGGER_CAP_MS)}ms`;
          target.classList.add("is-revealed");
          observer.unobserve(target);
          observed.delete(target);
        }
      },
      { threshold: 0.15 },
    );

    function syncObservedElements() {
      for (const element of observed) {
        if (element.isConnected) continue;
        observer.unobserve(element);
        observed.delete(element);
      }
      for (const element of document.querySelectorAll(selector)) {
        if (element.classList.contains("is-revealed") || observed.has(element)) continue;
        observed.add(element);
        observer.observe(element);
      }
    }

    syncObservedElements();
    let scheduled = 0;
    const mutations = new MutationObserver(() => {
      if (!scheduled) scheduled = requestAnimationFrame(() => { scheduled = 0; syncObservedElements(); });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      cancelAnimationFrame(scheduled);
    };
  }, [selector]);

  return null;
}
