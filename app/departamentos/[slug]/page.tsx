import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { departments, getDepartment } from "../departments";
import { AddToCartButton } from "../AddToCartButton";
import { CartNavLink } from "../../CartLinks";
import { ThemeToggle } from "../../ThemeToggle";
import { HomeReturnPopup } from "../HomeReturnPopup";
import { ManageCookiesLink } from "../../ManageCookiesLink";
import { ScrollReveal } from "../../ScrollReveal";
import { canonicalUrl } from "../../lib/site-config";
import { siteContacts } from "../../lib/site-contacts";
import { breadcrumbJsonLd, productJsonLd } from "../../lib/structured-data";
import { getDepartmentsWithLiveProducts } from "../../lib/products-source.server";

type DepartmentPageProps = {
  params: Promise<{ slug: string }>;
};

const whatsapp = siteContacts.whatsapp.baseUrl;

export function generateStaticParams() {
  return departments.map((department) => ({ slug: department.slug }));
}

export async function generateMetadata({ params }: DepartmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const department = getDepartment(slug);
  if (!department) return {};
  return {
    title: `${department.name} | Impakto Festas`,
    description: department.description,
    alternates: { canonical: canonicalUrl(`/departamentos/${department.slug}`) },
  };
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { slug } = await params;
  const liveDepartments = await getDepartmentsWithLiveProducts();
  const department = liveDepartments.find((candidate) => candidate.slug === slug);
  if (!department) notFound();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(department)) }} />
      {department.products.map((product) => (
        <script
          key={product.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, department)) }}
        />
      ))}
      <a className="skip-link" href="#produtos">Pular para os produtos</a>
      <div className="utility-bar"><span>Entrega para todo o Brasil</span><i aria-hidden="true" /><span>5% OFF na primeira compra</span><i aria-hidden="true" /><span>4x sem juros</span></div>

      <header className="department-header">
        <div className="container department-header-inner">
          <Link className="brand" href="/" aria-label="Voltar para a página inicial"><img className="brand-logo" src="/impakto-logo.png" alt="Impakto Artigos para Festas" width={1056} height={321} /></Link>
          <nav aria-label="Navegação do departamento"><Link href="/#categorias">← Todos os departamentos</Link><Link href="/lojas">Nossas lojas</Link><CartNavLink /><ThemeToggle /></nav>
        </div>
      </header>

      <main className="department-main" id="produtos">
        <section className={`department-hero ${department.className}`}>
          <div className="container department-hero-grid">
            <div className="department-hero-copy">
              <div className="department-breadcrumb"><Link href="/">Início</Link><span>/</span><Link href="/#categorias">Departamentos</Link><span>/</span><strong>{department.name}</strong></div>
              <span className="department-label">Departamento</span>
              <h1>{department.name}</h1>
              <p>{department.description}</p>
            </div>
            {department.slug === "festas-tematicas" ? (
              <div className="department-hero-art confetti-showcase" aria-hidden="true">
                <img className="confetti-popper" src={department.icon} alt="" width={112} height={112} loading="lazy" decoding="async" />
                {Array.from({ length: 12 }, (_, index) => (
                  <i className={`confetti-particle confetti-particle-${index + 1}`} key={index} />
                ))}
              </div>
            ) : department.slug === "confeitaria" ? (
              <div className="department-hero-art cupcake-showcase" aria-hidden="true">
                <div className="cupcake-stage">
                  <i className="cupcake-ground-shadow" />
                  <img className="cupcake-icon" src={department.icon} alt="" width={112} height={112} loading="lazy" decoding="async" />
                  <span className="cupcake-candle">
                    <i className="cupcake-wick" />
                    <i className="cupcake-flame" />
                  </span>
                </div>
              </div>
            ) : department.slug === "descartaveis" ? (
              <div className="department-hero-art drink-showcase" aria-hidden="true">
                <div className="drink-stage">
                  <img className="drink-icon" src={department.icon} alt="" width={112} height={112} loading="lazy" decoding="async" />
                  <i className="drink-sip-bubble drink-sip-bubble-1" />
                  <i className="drink-sip-bubble drink-sip-bubble-2" />
                  <i className="drink-sip-bubble drink-sip-bubble-3" />
                </div>
              </div>
            ) : department.slug === "decoracao" ? (
              <div className="department-hero-art stars-showcase" aria-hidden="true">
                <div className="stars-orbit-stage">
                  <img className="stars-orbit-group" src={department.icon} alt="" width={112} height={112} loading="lazy" decoding="async" />
                </div>
              </div>
            ) : department.slug === "papelaria" ? (
              <div className="department-hero-art gift-showcase" aria-hidden="true">
                <div className="gift-stage">
                  <img className="gift-icon" src={department.icon} alt="" width={112} height={112} loading="lazy" decoding="async" />
                </div>
              </div>
            ) : department.slug === "ofertas" ? (
              <div className="department-hero-art sale-showcase" aria-hidden="true">
                <div className="sale-stage">
                  <span className="sale-symbol">{department.icon}</span>
                  {Array.from({ length: 8 }, (_, index) => (
                    <i className={`sale-ray sale-ray-${index + 1}`} key={index} />
                  ))}
                </div>
              </div>
            ) : (
              <div className={`department-hero-art${department.slug === "baloes" ? " single-balloon-showcase" : ""}`} aria-hidden="true">
                <img src={department.icon} alt="" width={112} height={112} loading="lazy" decoding="async" />
              </div>
            )}
          </div>
        </section>

        <section className="department-products section">
          <div className="container">
            <div className="department-products-title"><div><span className="kicker">Catálogo Impakto</span><h2>Produtos de {department.name}</h2><p>Os produtos cadastrados neste departamento aparecerão aqui.</p></div><span className="products-count">{department.products.length} produtos</span></div>

            {department.products.length > 0 ? (
              <div className="products-grid">
                <ScrollReveal selector=".product-card" />
                {department.products.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-image">{product.image && <img src={product.image} alt={product.name} width={600} height={600} loading="lazy" decoding="async" />}</div>
                    <div className="product-card-copy"><span>{product.available ? "Disponível" : "Indisponível"}</span><h2>{product.name}</h2><p>{product.description}</p>{product.price && <strong>{product.price}</strong>}<AddToCartButton product={product} department={department.name} /></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="products-empty">
                <div className="products-empty-icon" aria-hidden="true">
                {department.slug === "ofertas" ? department.icon : <img src={department.icon} alt="" width={46} height={46} loading="lazy" decoding="async" />}
              </div>
                <div><span>Catálogo em preparação</span><h2>Novos produtos serão adicionados em breve.</h2><p>Esta página já está pronta para receber fotos, nomes, descrições, preços e disponibilidade dos produtos.</p></div>
                <a href={whatsapp} target="_blank" rel="noreferrer">Consultar produtos pelo WhatsApp <span aria-hidden="true">→</span></a>
              </div>
            )}

            <div className="department-type-list" aria-label={`Tipos de produtos de ${department.name}`}>
              <strong>Você encontrará por aqui:</strong>
              {department.productTypes.map((type) => <span key={type}>{type}</span>)}
            </div>
          </div>
        </section>
      </main>

      <footer className="stores-footer"><div className="container"><img src="/impakto-logo.png" alt="" width={1056} height={321} loading="lazy" decoding="async" /><p>Quer confirmar a disponibilidade de um produto?</p><ManageCookiesLink /><a href={whatsapp} target="_blank" rel="noreferrer">Fale com a nossa equipe →</a></div></footer>
      <HomeReturnPopup />
      <a className="whatsapp-float" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Falar com a Impakto Festas pelo WhatsApp"><img src="/whatsapp-logo.png" alt="" width={200} height={200} decoding="async" /></a>
    </>
  );
}
