import type { Metadata } from "next";
import { StoresExplorer } from "./StoresExplorer";
import { JsonLd } from "../JsonLd";
import { canonicalUrl } from "../lib/site-config";
import { storeJsonLd } from "../lib/structured-data";
import { stores } from "./stores";

export const metadata: Metadata = {
  title: "Nossas lojas | Impakto Festas",
  description: "Encontre a unidade Impakto Festas mais próxima de você.",
  alternates: { canonical: canonicalUrl("/lojas") },
};

export default function StoresPage() {
  return (
    <main className="stores-main" id="conteudo">
      {stores.map((store) => <JsonLd key={store.cnpj} data={storeJsonLd(store)} />)}

      <section className="stores-hero">
        <div className="container stores-hero-grid">
          <div><span className="eyebrow">Nossas lojas</span><h1>Encontre a Impakto <strong>mais próxima de você.</strong></h1><p>Pesquise por cidade, endereço ou CEP e descubra a melhor unidade para visitar.</p></div>
          <aside><strong>{stores.length}</strong><span>filiais ativas em São Paulo</span><p>Escolha uma loja e abra a rota completa no Google Maps.</p></aside>
        </div>
      </section>

      <section className="stores-directory section" aria-label="Lista de filiais">
        <div className="container"><StoresExplorer /></div>
      </section>
    </main>
  );
}
