import type { Department } from "./departments";

/** Ilustração animada do topo de cada departamento. */
export function DepartmentHeroArt({ department }: { department: Department }) {
  switch (department.slug) {
    case "festas-tematicas":
      return (
        <div className="department-hero-art confetti-showcase" aria-hidden="true">
          <img className="confetti-popper" src={department.icon} alt="" width={112} height={112} decoding="async" />
          {Array.from({ length: 12 }, (_, index) => (
            <i className={`confetti-particle confetti-particle-${index + 1}`} key={index} />
          ))}
        </div>
      );
    case "confeitaria":
      return (
        <div className="department-hero-art cupcake-showcase" aria-hidden="true">
          <div className="cupcake-stage">
            <i className="cupcake-ground-shadow" />
            <img className="cupcake-icon" src={department.icon} alt="" width={112} height={112} decoding="async" />
            <span className="cupcake-candle">
              <i className="cupcake-wick" />
              <i className="cupcake-flame" />
            </span>
          </div>
        </div>
      );
    case "descartaveis":
      return (
        <div className="department-hero-art drink-showcase" aria-hidden="true">
          <div className="drink-stage">
            <img className="drink-icon" src={department.icon} alt="" width={112} height={112} decoding="async" />
            <i className="drink-sip-bubble drink-sip-bubble-1" />
            <i className="drink-sip-bubble drink-sip-bubble-2" />
            <i className="drink-sip-bubble drink-sip-bubble-3" />
          </div>
        </div>
      );
    case "decoracao":
      return (
        <div className="department-hero-art stars-showcase" aria-hidden="true">
          <div className="stars-orbit-stage">
            <img className="stars-orbit-group" src={department.icon} alt="" width={112} height={112} decoding="async" />
          </div>
        </div>
      );
    case "papelaria":
      return (
        <div className="department-hero-art gift-showcase" aria-hidden="true">
          <div className="gift-stage">
            <img className="gift-icon" src={department.icon} alt="" width={112} height={112} decoding="async" />
          </div>
        </div>
      );
    case "ofertas":
      return (
        <div className="department-hero-art sale-showcase" aria-hidden="true">
          <div className="sale-stage">
            <span className="sale-symbol">{department.icon}</span>
            {Array.from({ length: 8 }, (_, index) => (
              <i className={`sale-ray sale-ray-${index + 1}`} key={index} />
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className={`department-hero-art${department.slug === "baloes" ? " single-balloon-showcase" : ""}`} aria-hidden="true">
          <img src={department.icon} alt="" width={112} height={112} decoding="async" />
        </div>
      );
  }
}
