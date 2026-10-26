import Link from "next/link";
import { departments } from "./departamentos/departments";
import { ScrollReveal } from "./ScrollReveal";

export function CategoryExplorer() {
  return (
    <section className="categories section" id="categorias" aria-labelledby="categorias-title">
      <ScrollReveal selector=".category-card" />
      <div className="container">
        <div className="section-title">
          <div><span className="kicker">Encontre rapidinho</span><h2 id="categorias-title">Departamentos em destaque</h2></div>
        </div>

        <ul className="category-grid" data-reveal>
          {departments.filter((department) => department.featured !== false).map((department) => (
            <li key={department.slug}>
              <Link className={`category-card ${department.className}`} href={`/departamentos/${department.slug}`}>
                <span className="category-art" aria-hidden="true">
                  {department.slug === "ofertas" ? (
                    <span className="category-icon category-icon-text">{department.icon}</span>
                  ) : (
                    <img className="category-icon" src={department.icon} alt="" width={72} height={72} loading="lazy" decoding="async" />
                  )}
                </span>
                <strong>{department.name}</strong>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
