import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../Icon";
import { ScrollReveal } from "../ScrollReveal";
import { SearchBar } from "../SearchBar";
import { ProductCard } from "../departamentos/ProductCard";
import { departments as staticDepartments } from "../departamentos/departments";
import { getDepartmentsWithLiveProducts } from "../lib/products-source.server";
import { searchCatalog } from "../lib/search";
import { siteContacts } from "../lib/site-contacts";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

const MAX_QUERY_LENGTH = 80;

function readQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, MAX_QUERY_LENGTH);
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = readQuery((await searchParams).q);
  return {
    title: query ? `Busca: ${query} | Impakto Festas` : "Buscar produtos | Impakto Festas",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = readQuery((await searchParams).q);
  const catalog = query ? await getDepartmentsWithLiveProducts() : staticDepartments;
  const { wantsStores, departments, products } = searchCatalog(query, catalog);
  const hasResults = wantsStores || departments.length > 0 || products.length > 0;

  return (
    <main className="search-main" id="conteudo">
      <section className="search-hero">
        <div className="container">
          <span className="eyebrow">Buscar no catálogo</span>
          <h1>{query ? <>Resultados para <strong>“{query}”</strong></> : "O que você está procurando?"}</h1>
          <div className="search-hero-form"><SearchBar defaultValue={query} id="busca-pagina" /></div>
          {query && <p role="status">{products.length === 1 ? "1 produto encontrado" : `${products.length} produtos encontrados`}{departments.length > 0 && ` em ${departments.length === 1 ? "1 departamento" : `${departments.length} departamentos`}`}.</p>}
        </div>
      </section>

      <section className="search-results section">
        <div className="container">
          {wantsStores && (
            <Link className="search-stores-shortcut" href="/lojas">
              <span aria-hidden="true"><Icon name="store" size={26} /></span>
              <div><strong>Procurando uma loja?</strong><small>Veja endereços e rotas das nossas 13 filiais.</small></div>
              <Icon name="arrowRight" />
            </Link>
          )}

          {departments.length > 0 && (
            <div className="search-departments">
              <h2>Departamentos relacionados</h2>
              <ul>
                {departments.map((department) => (
                  <li key={department.slug}><Link href={`/departamentos/${department.slug}`}>{department.name} <Icon name="arrowRight" size={16} /></Link></li>
                ))}
              </ul>
            </div>
          )}

          {products.length > 0 && (
            <div className="search-products">
              <h2>Produtos</h2>
              <div className="products-grid" data-reveal>
                <ScrollReveal selector=".product-card" />
                {products.map(({ product, department }) => <ProductCard key={product.id} product={product} department={department} showDepartment />)}
              </div>
            </div>
          )}

          {!hasResults && (
            <div className="search-empty">
              <span aria-hidden="true"><Icon name="search" size={30} /></span>
              <h2>{query ? "Não encontramos produtos com esse termo." : "Digite o nome de um produto para começar."}</h2>
              <p>{query ? "Tente outra palavra, como copos, balões, bolo ou convites — ou navegue pelos departamentos:" : "Ou escolha um departamento:"}</p>
              <ul>
                {staticDepartments.map((department) => <li key={department.slug}><Link href={`/departamentos/${department.slug}`}>{department.name}</Link></li>)}
              </ul>
              {query && <a className="text-link" href={siteContacts.whatsapp.baseUrl} target="_blank" rel="noreferrer">Não achou? Pergunte pelo WhatsApp</a>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
