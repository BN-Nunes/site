import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { departments, getDepartment } from "../departments";
import { DepartmentHeroArt } from "../DepartmentHeroArt";
import { ProductCard } from "../ProductCard";
import { Icon } from "../../Icon";
import { JsonLd } from "../../JsonLd";
import { ScrollReveal } from "../../ScrollReveal";
import { canonicalUrl } from "../../lib/site-config";
import { siteContacts } from "../../lib/site-contacts";
import { breadcrumbJsonLd, productJsonLd } from "../../lib/structured-data";
import { getDepartmentsWithLiveProducts } from "../../lib/products-source.server";

type DepartmentPageProps = {
  params: Promise<{ slug: string }>;
};

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

  const productCount = department.products.length;
  const otherDepartments = liveDepartments.filter((candidate) => candidate.slug !== department.slug);

  return (
    <main className="department-main" id="conteudo">
      <JsonLd data={breadcrumbJsonLd([{ name: "Departamentos", path: "/#categorias" }, { name: department.name, path: `/departamentos/${department.slug}` }])} />
      {department.products.map((product) => <JsonLd key={product.id} data={productJsonLd(product, department)} />)}

      <section className={`department-hero ${department.className}`}>
        <div className="container department-hero-grid">
          <div className="department-hero-copy">
            <nav className="department-breadcrumb" aria-label="Você está em"><Link href="/">Início</Link><span aria-hidden="true">/</span><Link href="/#categorias">Departamentos</Link><span aria-hidden="true">/</span><strong aria-current="page">{department.name}</strong></nav>
            <span className="department-label">Departamento</span>
            <h1>{department.name}</h1>
            <p>{department.description}</p>
          </div>
          <DepartmentHeroArt department={department} />
        </div>
      </section>

      <section className="department-products section" aria-labelledby="department-products-title">
        <div className="container">
          <div className="department-products-title">
            <div>
              <span className="kicker">Catálogo Impakto</span>
              <h2 id="department-products-title">Produtos de {department.name}</h2>
              <p>Adicione ao orçamento o que precisar — preços e disponibilidade são confirmados pela filial no WhatsApp.</p>
            </div>
            {productCount > 0 && <span className="products-count">{productCount} {productCount === 1 ? "produto" : "produtos"}</span>}
          </div>

          {productCount > 0 ? (
            <div className="products-grid" data-reveal>
              <ScrollReveal selector=".product-card" />
              {department.products.map((product) => <ProductCard key={product.id} product={product} department={department} />)}
            </div>
          ) : (
            <div className="products-empty">
              <div className="products-empty-icon" aria-hidden="true">
                {department.slug === "ofertas" ? department.icon : <img src={department.icon} alt="" width={46} height={46} loading="lazy" decoding="async" />}
              </div>
              <div><span>Catálogo em atualização</span><h3>Estamos atualizando os produtos deste departamento.</h3><p>Enquanto isso, nossa equipe consulta a disponibilidade para você pelo WhatsApp.</p></div>
              <a href={siteContacts.whatsapp.baseUrl} target="_blank" rel="noreferrer">Consultar pelo WhatsApp <Icon name="arrowRight" size={16} /></a>
            </div>
          )}

          <div className="department-type-list" aria-label={`Tipos de produtos de ${department.name}`}>
            <strong>Você encontrará por aqui:</strong>
            {department.productTypes.map((type) => <span key={type}>{type}</span>)}
          </div>
        </div>
      </section>

      <section className="related-departments section" aria-labelledby="related-departments-title">
        <div className="container">
          <div className="section-title"><div><span className="kicker">Continue explorando</span><h2 id="related-departments-title">Outros departamentos</h2></div></div>
          <ul className="related-departments-list">
            {otherDepartments.map((candidate) => (
              <li key={candidate.slug}>
                <Link className={`related-department ${candidate.className}`} href={`/departamentos/${candidate.slug}`}>
                  <span aria-hidden="true">{candidate.slug === "ofertas" ? candidate.icon : <img src={candidate.icon} alt="" width={40} height={40} loading="lazy" decoding="async" />}</span>
                  <strong>{candidate.name}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
