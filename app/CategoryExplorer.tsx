import { departments } from "./departamentos/departments";

export function CategoryExplorer() {
  return (
    <section className="categories section" id="categorias">
      <div className="container">
        <div className="section-title">
          <div><span className="kicker">Encontre rapidinho</span><h2>Departamentos em destaque</h2></div>
          <span className="category-guide-note">Escolha um departamento <span aria-hidden="true">→</span></span>
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
              <span className="category-art" aria-hidden="true">{department.icon}</span>
              <strong>{department.name}</strong>
              <small>Acessar departamento <span aria-hidden="true">→</span></small>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
