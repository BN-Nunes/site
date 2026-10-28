import Link from "next/link";
import type { Department, Product } from "./departments";
import { AddToCartButton } from "./AddToCartButton";
import { ProductPhoto } from "./ProductPhoto";

/** Card de produto usado no departamento e na busca. `showDepartment` liga o selo com o departamento de origem. */
export function ProductCard({ product, department, showDepartment = false }: { product: Product; department: Department; showDepartment?: boolean }) {
  // Sem foto, ou com uma foto que não existe no servidor, o card mostra o ícone do departamento.
  const placeholder = department.slug !== "ofertas" && <img className="product-image-placeholder" src={department.icon} alt="" width={72} height={72} loading="lazy" decoding="async" />;
  return (
    <article className="product-card">
      <div className="product-image">
        {product.image ? <ProductPhoto src={product.image} alt={product.name} fallback={placeholder} /> : placeholder}
      </div>
      <div className="product-card-copy">
        {showDepartment
          ? <Link className="product-department" href={`/departamentos/${department.slug}`}>{department.name}</Link>
          : <span className={product.available ? "product-status" : "product-status is-unavailable"}>{product.available ? "Disponível" : "Indisponível"}</span>}
        <h3>{product.name}</h3>
        {product.description && <p>{product.description}</p>}
        {product.sku && <small className="product-sku">Cód. {product.sku}</small>}
        {product.price && <strong>{product.price}</strong>}
        <AddToCartButton product={product} department={department.name} />
      </div>
    </article>
  );
}
