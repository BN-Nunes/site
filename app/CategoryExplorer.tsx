import { departments } from "./departamentos/departments";
import { ScrollReveal } from "./ScrollReveal";

export function CategoryExplorer() {
  return (
    <section className="categories section" id="categorias">
      <ScrollReveal selector=".category-card" />
      <div className="container">
        <div className="section-title">
          <div><span className="kicker">Encontre rapidinho</span><h2>Departamentos em destaque</h2></div>
        </div>

        <div className="category-grid" role="list" aria-label="Departamentos">
          {departments.filter((department) => department.featured !== false).map((department) => (
            <a
              className={`category-card ${department.className}`}
              href={`/departamentos/${department.slug}`}
              role="listitem"
              aria-label={`Acessar o departamento ${department.name}`}
              key={department.slug}
            >
              <span className="category-art" aria-hidden="true">
                {department.slug === "ofertas" ? (
                  <span className="category-icon category-icon-text">{department.icon}</span>
                ) : (
                  <img className="category-icon" src={department.icon} alt="" width={72} height={72} loading="lazy" decoding="async" />
                )}
              </span>
              <strong>{department.name}</strong>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
