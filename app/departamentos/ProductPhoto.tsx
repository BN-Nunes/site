"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Foto do produto que dá lugar a `fallback` quando o arquivo não existe: o servidor de fotos
 * responde com erro e, sem isso, o navegador mostraria o ícone de imagem quebrada.
 */
export function ProductPhoto({ src, alt, fallback, priority = false }: { src: string; alt: string; fallback: ReactNode; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Uma foto que falha antes de o JavaScript carregar não chega ao onError. Pedir de novo
  // repete o erro, agora com o onError ligado; uma foto lazy ainda fora da tela segue esperando.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) image.src = src;
  }, [src]);

  if (failed) return fallback;
  // `priority`: a foto principal da página do produto, que aparece logo de cara.
  return <img ref={imageRef} src={src} alt={alt} width={600} height={600} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" onError={() => setFailed(true)} />;
}
