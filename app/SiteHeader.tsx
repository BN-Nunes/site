import Link from "next/link";
import { CartHeaderLink } from "./CartLinks";
import { Icon } from "./Icon";
import { MainNav, type NavItem } from "./MainNav";
import { MercadoLivreSymbol } from "./MercadoLivreSymbol";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { departments } from "./departamentos/departments";
import { siteContacts } from "./lib/site-contacts";
import { stores } from "./lojas/stores";

const navItems: NavItem[] = [
  ...departments.map((department) => ({
    label: department.name,
    href: `/departamentos/${department.slug}`,
    highlight: department.slug === "ofertas",
  })),
  { label: "Nossas lojas", href: "/lojas" },
];

/** Cabeçalho único do site: as mesmas ações (busca, conta, carrinho, tema) e categorias em todas as páginas. */
export function SiteHeader() {
  return (
    <>
      <div className="utility-bar">
        <a href={siteContacts.mercadoLivreUrl} target="_blank" rel="noreferrer"><MercadoLivreSymbol /> Compre no Mercado Livre</a>
        <i aria-hidden="true" />
        <span>5% OFF na primeira compra</span>
        <i aria-hidden="true" />
        <span>{stores.length} lojas em São Paulo</span>
      </div>

      <header className="site-header">
        <div className="container header-main">
          <Link className="brand" href="/" aria-label="Impakto Festas — página inicial">
            <img className="brand-logo" src="/impakto-logo.png" alt="" width={1056} height={321} fetchPriority="high" decoding="async" />
          </Link>

          <SearchBar />

          <div className="header-actions">
            <Link className="header-action" href="/conta" aria-label="Minha conta">
              <span className="header-action-icon"><Icon name="user" /></span>
              <b>Minha conta</b>
            </Link>
            <CartHeaderLink />
            <ThemeToggle />
          </div>
        </div>

        <MainNav items={navItems} />
      </header>
    </>
  );
}
