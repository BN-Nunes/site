import type { Metadata } from "next";
import Link from "next/link";
import { departments } from "./departamentos/departments";
import { NotFoundMessage } from "./NotFoundMessage";
import { siteContacts } from "./lib/site-contacts";

export const metadata: Metadata = {
  title: "Página não encontrada | Impakto Festas",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="section not-found-main" id="conteudo">
      <div className="container not-found">
        {/* O 404 nas cores das letras do logo. */}
        <p className="not-found-code" aria-hidden="true"><span>4</span><span>0</span><span>4</span></p>
        <NotFoundMessage />

        <section className="not-found-departments" aria-labelledby="not-found-departments-title">
          <h2 id="not-found-departments-title">Ou escolha um departamento</h2>
          <ul className="related-departments-list">
            {departments.map((department) => (
              <li key={department.slug}>
                <Link className={`related-department ${department.className}`} href={`/departamentos/${department.slug}`}>
                  <span aria-hidden="true">{department.slug === "ofertas" ? department.icon : <img src={department.icon} alt="" width={40} height={40} loading="lazy" decoding="async" />}</span>
                  <strong>{department.name}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="not-found-help">
          Precisa de ajuda? <Link className="text-link" href="/lojas">Encontre uma loja</Link> ou{" "}
          <a className="text-link" href={siteContacts.whatsapp.baseUrl} target="_blank" rel="noreferrer">fale com a gente pelo WhatsApp</a>.
        </p>
      </div>
    </main>
  );
}
