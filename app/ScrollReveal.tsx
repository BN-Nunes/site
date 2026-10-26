"use client";

import { useEffect } from "react";

const STAGGER_STEP_MS = 70;
const STAGGER_CAP_MS = 350;

export function ScrollReveal({ selector }: { selector: string }) {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          const index = elements.indexOf(target);
          target.style.animationDelay = `${Math.min(index * STAGGER_STEP_MS, STAGGER_CAP_MS)}ms`;
          target.classList.add("is-revealed");
          observer.unobserve(target);
        }
      },
      { threshold: 0.15 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [selector]);

  return null;
}
