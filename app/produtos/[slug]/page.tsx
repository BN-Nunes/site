import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { AddToCartButton } from "../../departamentos/AddToCartButton";
import { ProductCard } from "../../departamentos/ProductCard";
import { ProductPhoto } from "../../departamentos/ProductPhoto";
import { JsonLd } from "../../JsonLd";
import { ScrollReveal } from "../../ScrollReveal";
import { findProduct, isDemoProduct, productPath, similarProducts } from "../../lib/product-page";
import { getDepartmentsWithLiveProducts } from "../../lib/products-source.server";
import { canonicalUrl } from "../../lib/site-config";
import { whatsappLinkWithMessage } from "../../lib/site-contacts";
import { breadcrumbJsonLd, productJsonLd } from "../../lib/structured-data";
import { stores } from "../../lojas/stores";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

async function loadProduct(params: ProductPageProps["params"]) {
  return findProduct(await getDepartmentsWithLiveProducts(), (await params).slug);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const match = await loadProduct(params);
  if (!match) return {};
  const { product, department } = match;
  const title = `${product.name} | Impakto Festas`;
  const description = product.description
    || `${product.name}${product.sku ? ` (cód. ${product.sku})` : ""}, em ${department.name}. Monte seu orçamento e receba a resposta pelo WhatsApp em uma das ${stores.length} lojas Impakto Festas.`;
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(productPath(product)) },
    ...(isDemoProduct(product) ? { robots: { index: false, follow: true } } : {}),
    // Ao mandar o link do produto no WhatsApp, a prévia mostra a foto dele.
    openGraph: {
      title,
      description,
      type: "website",
      locale: "pt_BR",
      siteName: "Impakto Festas",
      images: [product.image ? { url: product.image, alt: product.name } : { url: "/og-festas.png", width: 1200, height: 630 }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const match = await loadProduct(params);
  if (!match) notFound();
  const { product, department } = match;
  if (!match.canonical) permanentRedirect(productPath(product));

  const similar = similarProducts(product, department);
  const question = `Olá! Quero saber mais sobre o produto${product.sku ? ` ${product.sku}` : ""}: ${product.name}.`;
  const placeholder = department.slug !== "ofertas" && <img className="product-image-placeholder" src={department.icon} alt="" width={96} height={96} decoding="async" />;

  return (
    <main className="product-main" id="conteudo">
      <JsonLd data={breadcrumbJsonLd([{ name: department.name, path: `/departamentos/${department.slug}` }, { name: product.name, path: productPath(product) }])} />
      <JsonLd data={productJsonLd(product, department)} />

      <section className="product-detail section">
        <div className="container">
          <nav className="department-breadcrumb product-breadcrumb" aria-label="Você está em">
            <Link href="/">Início</Link><span aria-hidden="true">/</span>
            <Link href={`/departamentos/${department.slug}`}>{department.name}</Link><span aria-hidden="true">/</span>
            <strong aria-current="page">{product.name}</strong>
          </nav>

          <div className="product-detail-grid">
            <div className="product-detail-image">
              {product.image ? <ProductPhoto src={product.image} alt={product.name} fallback={placeholder} priority /> : placeholder}
            </div>

            <div className="product-detail-copy">
              <Link className="product-department" href={`/departamentos/${department.slug}`}>{department.name}</Link>
              <h1>{product.name}</h1>
              <div className="product-detail-facts">
                {product.sku && <span>Cód. <strong>{product.sku}</strong></span>}
                <span className={product.available ? "product-status" : "product-status is-unavailable"}>{product.available ? "Disponível" : "Indisponível"}</span>
              </div>
              {product.price && <strong className="product-detail-price">{product.price}</strong>}
              {product.description && <p className="product-detail-description">{product.description}</p>}

              <div className="product-detail-actions">
                <AddToCartButton product={product} department={department.name} />
                <a className="product-detail-question" href={whatsappLinkWithMessage(question)} target="_blank" rel="noreferrer">
                  <img src="/whatsapp-logo.png" alt="" width={200} height={200} decoding="async" /> Perguntar sobre este produto
                </a>
              </div>
              <p className="product-detail-note">
                Monte seu orçamento e escolha uma das <Link href="/lojas">{stores.length} lojas</Link>: preço e estoque são confirmados pela filial no WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="product-similar section" aria-labelledby="product-similar-title">
          <div className="container">
            <div className="department-products-title">
              <div>
                <span className="kicker">{department.name}</span>
                <h2 id="product-similar-title">Opções parecidas</h2>
              </div>
              <Link className="text-link" href={`/departamentos/${department.slug}`}>Ver todo o departamento</Link>
            </div>
            <div className="products-grid" data-reveal>
              <ScrollReveal selector=".product-card" />
              {similar.map((candidate) => <ProductCard key={candidate.id} product={candidate} department={department} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
