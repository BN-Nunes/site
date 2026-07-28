import Link from "next/link";

export function HomeReturnPopup() {
  return (
    <Link className="home-return-button" href="/" aria-label="Voltar à página inicial" data-label="Página inicial">
      <span className="home-house-icon" aria-hidden="true"><i /></span>
    </Link>
  );
}
