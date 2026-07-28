"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "../CartContext";
import { stores } from "../lojas/stores";
import { getSupabaseBrowserClient } from "../supabase-client";
import { createQuoteRequest } from "../conta/customer-data";
import { siteContacts } from "../lib/site-contacts";
import { buildQuoteMessage } from "../lib/quote-message";

export function CartClient() {
  const { items, itemCount, removeItem, updateQuantity, clearCart } = useCart();
  const [storeCnpj, setStoreCnpj] = useState("");
  const [customerName, setCustomerName] = useState("");

  const selectedStore = stores.find((store) => store.cnpj === storeCnpj);
  const whatsappNumber = selectedStore?.whatsapp || siteContacts.whatsapp.numberE164;

  const quoteMessage = useMemo(() => {
    if (!selectedStore) return "";
    return buildQuoteMessage(customerName, items);
  }, [customerName, items, selectedStore]);

  const whatsappUrl = quoteMessage ? `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(quoteMessage)}` : "";

  function handleQuoteSent() {
    if (!selectedStore) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    // Salva o orçamento apenas se o visitante estiver autenticado; nada é
    // persistido para quem não tem conta — o WhatsApp continua funcionando normalmente.
    supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user.id;
      if (!userId) return;
      createQuoteRequest(supabase, userId, {
        store_cnpj: selectedStore.cnpj,
        store_name: selectedStore.name,
        items: items.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, sku: item.sku })),
      });
    });
  }

  if (items.length === 0) {
    return <section className="cart-empty" aria-labelledby="cart-empty-title"><div aria-hidden="true">🛒</div><span>Seu orçamento</span><h2 id="cart-empty-title">O carrinho está vazio.</h2><p>Escolha os produtos nos departamentos e adicione tudo que deseja consultar.</p><Link href="/#categorias">Explorar departamentos <span aria-hidden="true">→</span></Link></section>;
  }

  return (
    <div className="quote-layout">
      <section className="quote-items" aria-labelledby="quote-items-title">
        <div className="quote-section-heading"><div><span>Produtos selecionados</span><h2 id="quote-items-title">Seu orçamento</h2></div><strong>{itemCount} {itemCount === 1 ? "item" : "itens"}</strong></div>
        <div className="quote-item-list">
          {items.map((item) => (
            <article className="quote-item" key={item.id}>
              <div className="quote-item-image">{item.image ? <img src={item.image} alt="" width={600} height={600} loading="lazy" decoding="async" /> : <span aria-hidden="true">🎉</span>}</div>
              <div className="quote-item-copy"><small>{item.department}</small><h3>{item.name}</h3>{item.sku && <p>Código: {item.sku}</p>}</div>
              <div className="quote-quantity" aria-label={`Quantidade de ${item.name}`}><button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Diminuir quantidade">−</button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Aumentar quantidade">+</button></div>
              <button className="quote-remove" type="button" onClick={() => removeItem(item.id)}>Remover</button>
            </article>
          ))}
        </div>
        <div className="quote-items-footer"><Link href="/#categorias">← Continuar escolhendo</Link><button type="button" onClick={clearCart}>Limpar carrinho</button></div>
      </section>

      <aside className="quote-summary" aria-labelledby="quote-summary-title">
        <span className="quote-step">Próximo passo</span><h2 id="quote-summary-title">Enviar para uma filial</h2><p>Escolha onde deseja consultar a disponibilidade. Nenhuma compra será realizada pelo site.</p>
        <label><span>Filial desejada *</span><select value={storeCnpj} onChange={(event) => setStoreCnpj(event.target.value)} required><option value="">Selecione uma filial</option>{stores.map((store) => <option value={store.cnpj} key={store.cnpj}>Impakto {store.name} — {store.city}</option>)}</select></label>
        <label><span>Seu nome *</span><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Como devemos chamar você?" required /></label>
        {selectedStore && <div className="quote-store"><strong>Impakto {selectedStore.name}</strong><span>{selectedStore.street}, {selectedStore.number}</span><span>{selectedStore.city}/{selectedStore.state} — CEP {selectedStore.cep}</span>{!selectedStore.whatsapp && <small>A mensagem será encaminhada pelo atendimento central para esta filial.</small>}</div>}
        {whatsappUrl ? <a className="quote-whatsapp-button" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={handleQuoteSent}><img src="/whatsapp-logo.png" alt="" width={200} height={200} decoding="async" />Enviar orçamento pelo WhatsApp</a> : <button className="quote-whatsapp-button" type="button" disabled><img src="/whatsapp-logo.png" alt="" width={200} height={200} decoding="async" />{selectedStore ? "Informe seu nome para continuar" : "Escolha uma filial para continuar"}</button>}
        <small className="quote-disclaimer">O orçamento será enviado como mensagem. Preços, estoque e condições serão confirmados pela equipe da filial.</small>
      </aside>
    </div>
  );
}
