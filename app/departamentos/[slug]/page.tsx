import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { departments, getDepartment } from "../departments";
import { AddToCartButton } from "../AddToCartButton";
import { CartNavLink } from "../../CartLinks";

type DepartmentPageProps = {
  params: Promise<{ slug: string }>;
};

const whatsapp = "https://api.whatsapp.com/send?phone=551146155051";

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
  };
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { slug } = await params;
  const department = getDepartment(slug);
  if (!department) notFound();

  return (
    <>
      <a className="skip-link" href="#produtos">Pular para os produtos</a>
      <div className="utility-bar"><span>Entrega para todo o Brasil</span><i aria-hidden="true" /><span>5% OFF na primeira compra</span><i aria-hidden="true" /><span>4x sem juros</span></div>

      <header className="department-header">
        <div className="container department-header-inner">
          <a className="brand" href="/" aria-label="Voltar para a página inicial"><img className="brand-logo" src="/impakto-logo.png" alt="Impakto Artigos para Festas" /></a>
          <nav aria-label="Navegação do departamento"><a href="/#categorias">← Todos os departamentos</a><a href="/lojas">Nossas lojas</a><CartNavLink /><a className="department-whatsapp" href={whatsapp} target="_blank" rel="noreferrer">Falar no WhatsApp</a></nav>
        </div>
      </header>

      <main className="department-main" id="produtos">
        <section className={`department-hero ${department.className}`}>
          <div className="container department-hero-grid">
            <div className="department-hero-copy">
              <div className="department-breadcrumb"><a href="/">Início</a><span>/</span><a href="/#categorias">Departamentos</a><span>/</span><strong>{department.name}</strong></div>
              <span className="department-label">Departamento</span>
              <h1>{department.name}</h1>
              <p>{department.description}</p>
            </div>
            <div className="department-hero-art" aria-hidden="true"><span>{department.icon}</span></div>
          </div>
        </section>

        <section className="department-products section">
          <div className="container">
            <div className="department-products-title"><div><span className="kicker">Catálogo Impakto</span><h2>Produtos de {department.name}</h2><p>Os produtos cadastrados neste departamento aparecerão aqui.</p></div><span className="products-count">{department.products.length} produtos</span></div>

            {department.products.length > 0 ? (
              <div className="products-grid">
                {department.products.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-image"><img src={product.image} alt={product.name} /></div>
                    <div className="product-card-copy"><span>{product.available ? "Disponível" : "Indisponível"}</span><h2>{product.name}</h2><p>{product.description}</p>{product.price && <strong>{product.price}</strong>}<AddToCartButton product={product} department={department.name} /></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="products-empty">
                <div className="products-empty-icon" aria-hidden="true">{department.icon}</div>
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

      <footer className="stores-footer"><div className="container"><img src="/impakto-logo.png" alt="" /><p>Quer confirmar a disponibilidade de um produto?</p><a href={whatsapp} target="_blank" rel="noreferrer">Fale com a nossa equipe →</a></div></footer>
      <a className="whatsapp-float" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Falar com a Impakto Festas pelo WhatsApp"><img src="/whatsapp-logo.jpg" alt="" /></a>
    </>
  );
}
