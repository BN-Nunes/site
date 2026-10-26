/**
 * "Impakto" escrito com as cores das letras-balão do logo. As cores vêm do CSS
 * (`.brand-word-letters span:nth-child`), porque a CSP do site bloqueia `style`
 * inline; leitores de tela leem a palavra inteira no texto oculto.
 */
export function BrandWord() {
  return (
    <span className="brand-word">
      <span className="sr-only">Impakto</span>
      <span className="brand-word-letters" aria-hidden="true">
        {"IMPAKTO".split("").map((letter, index) => <span key={index}>{letter}</span>)}
      </span>
    </span>
  );
}
