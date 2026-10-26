import Link from "next/link";
import type { Department, Product } from "./departments";
import { AddToCartButton } from "./AddToCartButton";

/** Card de produto usado no departamento e na busca. `showDepartment` liga o selo com o departamento de origem. */
export function ProductCard({ product, department, showDepartment = false }: { product: Product; department: Department; showDepartment?: boolean }) {
  return (
    <article className="product-card">
      <div className="product-image">
        {product.image
          ? <img src={product.image} alt={product.name} width={600} height={600} loading="lazy" decoding="async" />
          : department.slug !== "ofertas" && <img className="product-image-placeholder" src={department.icon} alt="" width={72} height={72} loading="lazy" decoding="async" />}
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
