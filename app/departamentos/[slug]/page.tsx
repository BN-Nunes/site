import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { departments, getDepartment } from "../departments";
import { DepartmentHeroArt } from "../DepartmentHeroArt";
import { DepartmentSearch } from "../DepartmentSearch";
import { ProductCard } from "../ProductCard";
import { ProductsPager } from "../ProductsPager";
import { Icon } from "../../Icon";
import { JsonLd } from "../../JsonLd";
import { ScrollReveal } from "../../ScrollReveal";
import { departmentListingHref, listDepartmentProducts, PRODUCTS_PER_PAGE, readPageParam } from "../../lib/department-listing";
import { readQueryParam } from "../../lib/search";
import { canonicalUrl } from "../../lib/site-config";
import { siteContacts, whatsappLinkWithMessage } from "../../lib/site-contacts";
import { breadcrumbJsonLd, productJsonLd } from "../../lib/structured-data";
import { getDepartmentsWithLiveProducts } from "../../lib/products-source.server";

type DepartmentPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ busca?: string | string[]; pagina?: string | string[] }>;
};

const GRID_ID = "produtos";

export function generateStaticParams() {
  return departments.map((department) => ({ slug: department.slug }));
}

export async function generateMetadata({ params, searchParams }: DepartmentPageProps): Promise<Metadata> {
  const [{ slug }, { busca, pagina }] = await Promise.all([params, searchParams]);
  const department = getDepartment(slug);
  if (!department) return {};

  const query = readQueryParam(busca);
  const metadata: Metadata = { title: `${department.name} | Impakto Festas`, description: department.description };
  // Resultados de busca ficam fora do Google. Já as páginas de "carregar mais" ficam, cada uma com o
  // próprio endereço, para que o Google encontre todos os produtos e não só os primeiros.
  if (query) {
    return { ...metadata, alternates: { canonical: canonicalUrl(departmentListingHref(slug, "")) }, robots: { index: false, follow: true } };
  }
  const liveDepartment = (await getDepartmentsWithLiveProducts()).find((candidate) => candidate.slug === slug);
  const { page } = listDepartmentProducts(liveDepartment?.products ?? [], "", readPageParam(pagina));
  return { ...metadata, alternates: { canonical: canonicalUrl(departmentListingHref(slug, "", page)) } };
}

export default async function DepartmentPage({ params, searchParams }: DepartmentPageProps) {
  const [{ slug }, { busca, pagina }] = await Promise.all([params, searchParams]);
  const liveDepartments = await getDepartmentsWithLiveProducts();
  const department = liveDepartments.find((candidate) => candidate.slug === slug);
  if (!department) notFound();

  const productCount = department.products.length;
  const query = readQueryParam(busca);
  const listing = listDepartmentProducts(department.products, query, readPageParam(pagina));
  // Com poucos produtos, todos cabem na tela e a busca só atrapalharia.
  const showSearch = productCount > PRODUCTS_PER_PAGE || query !== "";
  const otherDepartments = liveDepartments.filter((candidate) => candidate.slug !== department.slug);
  // Ofertas fica vazio enquanto a planilha não traz ofertas: as da semana são passadas pelo WhatsApp, como no card da home.
  const empty = department.slug === "ofertas"
    ? { label: "Ofertas da semana", title: "As ofertas da semana são passadas pelo WhatsApp.", text: "Fale com a nossa equipe: o percentual e as condições são confirmados pela filial no atendimento.", action: "Pedir pelo WhatsApp", href: whatsappLinkWithMessage("Olá! Quero saber as ofertas da semana.") }
    : { label: "Catálogo em atualização", title: "Estamos atualizando os produtos deste departamento.", text: "Enquanto isso, nossa equipe consulta a disponibilidade para você pelo WhatsApp.", action: "Consultar pelo WhatsApp", href: siteContacts.whatsapp.baseUrl };

  return (
    <main className="department-main" id="conteudo">
      <JsonLd data={breadcrumbJsonLd([{ name: "Departamentos", path: "/#categorias" }, { name: department.name, path: `/departamentos/${department.slug}` }])} />
      {listing.products.map((product) => <JsonLd key={product.id} data={productJsonLd(product, department)} />)}

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

          {showSearch && (
            <div className="department-search">
              <DepartmentSearch action={departmentListingHref(slug, "")} departmentName={department.name} query={query} />
              <p className="department-search-status" role="status">
                {listing.searching && (
                  <>
                    {listing.matching === 0 ? "Nenhum produto encontrado" : `${listing.matching} ${listing.matching === 1 ? "produto encontrado" : "produtos encontrados"}`} para <strong>“{query}”</strong>.{" "}
                    <Link className="text-link" href={departmentListingHref(slug, "")} scroll={false}>Limpar busca</Link>
                  </>
                )}
              </p>
            </div>
          )}

          {listing.products.length > 0 ? (
            <>
              <div className="products-grid" id={GRID_ID} data-reveal>
                <ScrollReveal selector=".product-card" />
                {listing.products.map((product) => <ProductCard key={product.id} product={product} department={department} />)}
              </div>
              {listing.matching > PRODUCTS_PER_PAGE && (
                <ProductsPager
                  gridId={GRID_ID}
                  shown={listing.products.length}
                  total={listing.matching}
                  nextHref={listing.nextPage ? departmentListingHref(slug, query, listing.nextPage) : null}
                />
              )}
            </>
          ) : productCount > 0 ? (
            <div className="search-empty department-search-empty">
              <span aria-hidden="true"><Icon name="search" size={30} /></span>
              <h3>Não achamos esse produto em {department.name}.</h3>
              <p>Confira se a palavra está escrita certo ou tente um termo mais curto. O produto também pode estar em outro departamento.</p>
              <Link className="text-link" href={`/busca?q=${encodeURIComponent(query)}`}>Buscar “{query}” em todo o site</Link>
            </div>
          ) : (
            <div className="products-empty">
              <div className="products-empty-icon" aria-hidden="true">
                {department.slug === "ofertas" ? department.icon : <img src={department.icon} alt="" width={46} height={46} loading="lazy" decoding="async" />}
              </div>
              <div><span>{empty.label}</span><h3>{empty.title}</h3><p>{empty.text}</p></div>
              <a href={empty.href} target="_blank" rel="noreferrer">{empty.action} <Icon name="arrowRight" size={16} /></a>
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
