import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "../../Icon";
import { JsonLd } from "../../JsonLd";
import { formatDistanceKm, sortByDistance } from "../../lib/geolocation";
import { canonicalUrl } from "../../lib/site-config";
import { storePhoneLink, storeWhatsappLink } from "../../lib/store-contact";
import { breadcrumbJsonLd, storeJsonLd } from "../../lib/structured-data";
import { StoreActions } from "../StoreActions";
import { StoreMap } from "../StoreMap";
import { getStore, storeAddress, storeSlug, stores } from "../stores";

const NEARBY_STORES = 3;

type StorePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return stores.map((store) => ({ slug: storeSlug(store) }));
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = getStore(slug);
  if (!store) return {};
  const title = `Loja ${store.name} | Impakto Festas`;
  const description = `Impakto Festas ${store.name}: ${storeAddress(store)}. Fale com a loja pelo WhatsApp, veja como chegar e monte seu orçamento de artigos para festas.`;
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/lojas/${slug}`) },
    // Ao compartilhar o link da loja (no WhatsApp, por exemplo), a prévia mostra a fachada dela.
    openGraph: {
      title,
      description,
      type: "website",
      locale: "pt_BR",
      siteName: "Impakto Festas",
      images: [store.photo ? { url: store.photo, alt: `Fachada da Impakto Festas ${store.name}` } : { url: "/og-festas.png", width: 1200, height: 630 }],
    },
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const store = getStore(slug);
  if (!store) notFound();

  const whatsapp = storeWhatsappLink(store);
  const phone = storePhoneLink(store);
  const nearbyStores = sortByDistance(stores.filter((candidate) => candidate !== store), store).slice(0, NEARBY_STORES);

  return (
    <main className="store-page-main" id="conteudo">
      <JsonLd data={storeJsonLd(store)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Nossas lojas", path: "/lojas" }, { name: store.name, path: `/lojas/${slug}` }])} />

      <section className="stores-hero store-page-hero">
        <div className="container store-page-hero-grid">
          <div className="store-page-copy">
            <nav className="department-breadcrumb" aria-label="Você está em"><Link href="/">Início</Link><span aria-hidden="true">/</span><Link href="/lojas">Nossas lojas</Link><span aria-hidden="true">/</span><strong aria-current="page">{store.name}</strong></nav>
            <span className="eyebrow">Loja Impakto Festas</span>
            <h1>Impakto <strong>{store.name}</strong></h1>
            <address className="store-page-address"><Icon name="pin" size={20} /><span>{store.street}, {store.number}<br />{store.city} — {store.state}, CEP {store.cep}</span></address>
            <StoreActions store={store} className="store-page-actions" />
          </div>
          <div className="store-page-photo">
            {store.photo
              ? <img src={store.photo} alt={`Fachada da Impakto Festas ${store.name}`} width={800} height={480} fetchPriority="high" decoding="async" />
              : <span aria-hidden="true">Impakto {store.name}</span>}
          </div>
        </div>
      </section>

      <section className="store-page-details section" aria-labelledby="store-contact-title">
        <div className="container store-page-grid">
          <div className="store-page-info">
            <span className="kicker">Atendimento</span>
            <h2 id="store-contact-title">Fale com a Impakto {store.name}</h2>
            <dl className="store-page-facts">
              <div><dt>Endereço</dt><dd>{storeAddress(store)}</dd></div>
              <div><dt>WhatsApp</dt><dd>{whatsapp.display}{!whatsapp.direct && " (central de atendimento)"}</dd></div>
              {phone && <div><dt>Telefone</dt><dd>{phone.display}</dd></div>}
              <div><dt>CNPJ</dt><dd>{store.cnpj}</dd></div>
            </dl>
            <div className="store-page-quote">
              <h3>Monte seu orçamento para esta loja</h3>
              <p>
                Escolha os produtos no site, abra o carrinho e selecione a <b>Impakto {store.name}</b>. A lista chega pronta pelo WhatsApp
                {whatsapp.direct ? " da loja" : " da central, que encaminha para a loja"}, e a equipe confirma preços e disponibilidade.
              </p>
              <Link className="button button-cta" href="/#categorias">Ver departamentos <Icon name="arrowRight" size={18} /></Link>
            </div>
          </div>
          <StoreMap store={store} />
        </div>
      </section>

      <section className="store-nearby section" aria-labelledby="store-nearby-title">
        <div className="container">
          <div className="section-title">
            <div><span className="kicker">Outras unidades</span><h2 id="store-nearby-title">Lojas perto da Impakto {store.name}</h2></div>
            <Link className="store-nearby-all" href="/lojas">Ver as {stores.length} lojas <Icon name="arrowRight" size={16} /></Link>
          </div>
          <ul className="store-nearby-list">
            {nearbyStores.map((candidate) => (
              <li key={candidate.cnpj}>
                <Link className="store-nearby-card" href={`/lojas/${storeSlug(candidate)}`}>
                  <span className="store-nearby-photo">
                    {candidate.photo ? <img src={candidate.photo} alt="" width={800} height={480} loading="lazy" decoding="async" /> : <Icon name="pin" size={26} />}
                  </span>
                  <span className="store-nearby-copy">
                    <strong>Impakto {candidate.name}</strong>
                    <small>{candidate.street}, {candidate.number} — {candidate.city}</small>
                    <em>A {formatDistanceKm(candidate.distanceKm)} desta loja</em>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
