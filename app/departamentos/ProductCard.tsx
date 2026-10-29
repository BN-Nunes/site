import Link from "next/link";
import type { Department, Product } from "./departments";
import { AddToCartButton } from "./AddToCartButton";
import { ProductPhoto } from "./ProductPhoto";
import { productPath } from "../lib/product-page";

/** Card de produto usado no departamento, na busca e na página do produto. `showDepartment` liga o selo com o departamento de origem. */
export function ProductCard({ product, department, showDepartment = false }: { product: Product; department: Department; showDepartment?: boolean }) {
  // Sem foto, ou com uma foto que não existe no servidor, o card mostra o ícone do departamento.
  const placeholder = department.slug !== "ofertas" && <img className="product-image-placeholder" src={department.icon} alt="" width={72} height={72} loading="lazy" decoding="async" />;
  const href = productPath(product);
  return (
    <article className="product-card">
      {/* A foto também leva à página do produto, fora da ordem do Tab: o link do nome já faz isso. */}
      <Link className="product-image" href={href} tabIndex={-1} aria-hidden="true">
        {product.image ? <ProductPhoto src={product.image} alt={product.name} fallback={placeholder} /> : placeholder}
      </Link>
      <div className="product-card-copy">
        {showDepartment
          ? <Link className="product-department" href={`/departamentos/${department.slug}`}>{department.name}</Link>
          : <span className={product.available ? "product-status" : "product-status is-unavailable"}>{product.available ? "Disponível" : "Indisponível"}</span>}
        {/* A descrição fica na página do produto: o nome já ocupa até 4 linhas no card. */}
        <h3><Link className="product-card-link" href={href}>{product.name}</Link></h3>
        {product.sku && <small className="product-sku">Cód. {product.sku}</small>}
        {product.price && <strong>{product.price}</strong>}
        <AddToCartButton product={product} department={department.name} />
      </div>
    </article>
  );
}
