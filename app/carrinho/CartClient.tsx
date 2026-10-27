"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "../CartContext";
import { Icon } from "../Icon";
import { stores } from "../lojas/stores";
import { getSupabaseBrowserClient } from "../supabase-client";
import { createQuoteRequest } from "../conta/customer-data";
import { MAX_QUANTITY, MIN_QUANTITY } from "../lib/cart-quantity";
import { buildQuoteEvent, recordQuoteEvent } from "../lib/quote-events";
import { siteContacts } from "../lib/site-contacts";
import { buildQuoteMessage, MAX_QUOTE_NOTES_LENGTH } from "../lib/quote-message";

const storesByCity = Array.from(
  stores.reduce((groups, store) => groups.set(store.city, [...(groups.get(store.city) ?? []), store]), new Map<string, typeof stores>()),
).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));

export function CartClient() {
  const { items, itemCount, removeItem, updateQuantity, clearCart } = useCart();
  const [storeCnpj, setStoreCnpj] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [quoteSent, setQuoteSent] = useState(false);

  // Quem está logado não precisa digitar o nome de novo.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      const fullName = data.session?.user.user_metadata?.full_name;
      if (!cancelled && typeof fullName === "string") setCustomerName((current) => current || fullName);
    });
    return () => { cancelled = true; };
  }, []);

  const selectedStore = stores.find((store) => store.cnpj === storeCnpj);
  const whatsappNumber = selectedStore?.whatsapp || siteContacts.whatsapp.numberE164;

  const quoteMessage = useMemo(() => {
    if (!selectedStore) return "";
    return buildQuoteMessage(customerName, items, notes);
  }, [customerName, items, notes, selectedStore]);

  const whatsappUrl = quoteMessage ? `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(quoteMessage)}` : "";

  function handleQuoteSent() {
    if (!selectedStore) return;
    setQuoteSent(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    // Todo envio entra na estatística de orçamentos por loja e produto, sem nome nem
    // observações. Quem está logado também ganha o orçamento no histórico da conta.
    supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user.id;
      recordQuoteEvent(supabase, buildQuoteEvent(selectedStore, items, Boolean(userId)));
      if (!userId) return;
      createQuoteRequest(supabase, userId, {
        store_cnpj: selectedStore.cnpj,
        store_name: selectedStore.name,
        items: items.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, sku: item.sku })),
      });
    });
  }

  function finishQuote() {
    clearCart();
    setQuoteSent(false);
    setNotes("");
  }

  if (items.length === 0) {
    return (
      <section className="cart-empty" aria-labelledby="cart-empty-title">
        <div aria-hidden="true"><Icon name="cart" size={44} /></div>
        <span>Seu orçamento</span>
        <h2 id="cart-empty-title">O carrinho está vazio.</h2>
        <p>Escolha os produtos nos departamentos e adicione tudo que deseja consultar.</p>
        <Link href="/#categorias">Explorar departamentos <Icon name="arrowRight" size={16} /></Link>
      </section>
    );
  }

  return (
    <div className="quote-layout">
      <section className="quote-items" aria-labelledby="quote-items-title">
        <div className="quote-section-heading"><div><span>Produtos selecionados</span><h2 id="quote-items-title">Seu orçamento</h2></div><strong>{itemCount} {itemCount === 1 ? "item" : "itens"}</strong></div>
        <ul className="quote-item-list">
          {items.map((item) => (
            <li className="quote-item" key={item.id}>
              <div className="quote-item-image">{item.image ? <img src={item.image} alt="" width={600} height={600} loading="lazy" decoding="async" /> : <Icon name="sparkles" size={28} />}</div>
              <div className="quote-item-copy"><small>{item.department}</small><h3>{item.name}</h3>{item.sku && <p>Código: {item.sku}</p>}</div>
              <div className="quote-quantity" role="group" aria-label={`Quantidade de ${item.name}`}>
                <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= MIN_QUANTITY} aria-label="Diminuir quantidade">−</button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={MIN_QUANTITY}
                  max={MAX_QUANTITY}
                  value={item.quantity}
                  onChange={(event) => { if (event.target.value !== "") updateQuantity(item.id, Number(event.target.value)); }}
                  onFocus={(event) => event.target.select()}
                  aria-label={`Quantidade de ${item.name}`}
                />
                <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= MAX_QUANTITY} aria-label="Aumentar quantidade">+</button>
              </div>
              <button className="quote-remove" type="button" onClick={() => removeItem(item.id)} aria-label={`Remover ${item.name} do orçamento`}>Remover</button>
            </li>
          ))}
        </ul>
        <div className="quote-items-footer"><Link href="/#categorias">← Continuar escolhendo</Link><button type="button" onClick={clearCart}>Limpar carrinho</button></div>
      </section>

      <aside className="quote-summary" aria-labelledby="quote-summary-title">
        {quoteSent ? (
          <div className="quote-sent" role="status">
            <span className="quote-sent-icon" aria-hidden="true"><Icon name="check" size={26} /></span>
            <span className="quote-step">Orçamento encaminhado</span>
            <h2 id="quote-summary-title">Continue a conversa no WhatsApp</h2>
            <p>Abrimos o WhatsApp com a sua lista para a <b>Impakto {selectedStore?.name}</b>. Se a mensagem não abriu, <a href={whatsappUrl} target="_blank" rel="noreferrer">toque aqui para tentar de novo</a>.</p>
            <button className="quote-finish-button" type="button" onClick={finishQuote}>Já enviei — limpar carrinho</button>
            <button className="quote-back-button" type="button" onClick={() => setQuoteSent(false)}>Voltar e editar o orçamento</button>
          </div>
        ) : (
          <>
            <span className="quote-step">Próximo passo</span><h2 id="quote-summary-title">Enviar para uma filial</h2><p>Escolha onde deseja consultar a disponibilidade. Nenhuma compra será realizada pelo site.</p>
            <label><span>Filial desejada *</span>
              <select value={storeCnpj} onChange={(event) => setStoreCnpj(event.target.value)} required>
                <option value="">Selecione uma filial</option>
                {storesByCity.map(([city, cityStores]) => (
                  <optgroup label={city} key={city}>
                    {cityStores.map((store) => <option value={store.cnpj} key={store.cnpj}>Impakto {store.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </label>
            <label><span>Seu nome *</span><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Como devemos chamar você?" autoComplete="name" required /></label>
            <label><span>Observações <small>(opcional)</small></span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={MAX_QUOTE_NOTES_LENGTH} rows={3} placeholder="Data da festa, cores, tema, retirada ou entrega…" /></label>
            {selectedStore && <div className="quote-store"><strong>Impakto {selectedStore.name}</strong><span>{selectedStore.street}, {selectedStore.number}</span><span>{selectedStore.city}/{selectedStore.state} — CEP {selectedStore.cep}</span>{!selectedStore.whatsapp && <small>A mensagem será encaminhada pelo atendimento central para esta filial.</small>}</div>}
            {whatsappUrl ? <a className="quote-whatsapp-button" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={handleQuoteSent}><img src="/whatsapp-logo.png" alt="" width={200} height={200} decoding="async" />Enviar orçamento pelo WhatsApp</a> : <button className="quote-whatsapp-button" type="button" disabled><img src="/whatsapp-logo.png" alt="" width={200} height={200} decoding="async" />{selectedStore ? "Informe seu nome para continuar" : "Escolha uma filial para continuar"}</button>}
            <small className="quote-disclaimer">O orçamento será enviado como mensagem. Preços, estoque e condições serão confirmados pela equipe da filial.</small>
          </>
        )}
      </aside>
    </div>
  );
}
