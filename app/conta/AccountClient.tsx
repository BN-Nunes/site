"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { Icon } from "../Icon";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../supabase-client";
import {
  fetchDefaultAddress,
  fetchProfile,
  fetchQuoteRequests,
  saveDefaultAddress as persistDefaultAddress,
  saveProfile as persistProfile,
  type CustomerAddress,
  type QuoteRequest,
} from "./customer-data";

type AccountMode = "login" | "register" | "forgot" | "recovery";
type Feedback = { type: "success" | "error"; text: string } | null;
type DashboardPanel = "profile" | "orders" | "address" | null;

const emptyAddress: CustomerAddress = {
  postal_code: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
};

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (normalized.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (normalized.includes("email address not authorized")) return "O envio de confirmação ainda não está liberado para este endereço. Configure o SMTP do projeto.";
  if (normalized.includes("user already registered")) return "Já existe uma conta com este e-mail.";
  if (normalized.includes("password should be")) return "A senha não atende aos requisitos de segurança.";
  if (normalized.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  return "Não foi possível concluir a operação. Verifique os dados e tente novamente.";
}

export function AccountClient() {
  const [mode, setMode] = useState<AccountMode>("login");
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [canResendConfirmation, setCanResendConfirmation] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [activePanel, setActivePanel] = useState<DashboardPanel>(null);
  const [dashboardSaving, setDashboardSaving] = useState(false);
  const [dashboardFeedback, setDashboardFeedback] = useState<Feedback>(null);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [address, setAddress] = useState<CustomerAddress>(emptyAddress);
  const [profileTableReady, setProfileTableReady] = useState(true);
  const [addressTableReady, setAddressTableReady] = useState(true);
  const [orders, setOrders] = useState<QuoteRequest[] | null>(null);
  const [ordersTableReady, setOrdersTableReady] = useState(true);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    // Se não houver cliente Supabase configurado, a tela de configuração é
    // exibida antes de qualquer verificação de `ready` — nada para sincronizar aqui.
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setReady(true);
      if (event === "PASSWORD_RECOVERY") {
        setMode("recovery");
        setFeedback({ type: "success", text: "Crie agora uma nova senha para sua conta." });
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!session || !supabase) return;
    let cancelled = false;

    const metadata = session.user.user_metadata ?? {};
    const legacyName = typeof metadata.full_name === "string" ? metadata.full_name : "";
    const legacyPhone = typeof metadata.phone === "string" ? metadata.phone : "";

    fetchProfile(supabase, session.user.id).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setProfileTableReady(true);
        setProfileName(result.data?.full_name ?? legacyName);
        setProfilePhone(result.data?.phone ?? legacyPhone);
      } else {
        setProfileTableReady(result.reason !== "not-configured");
        setProfileName(legacyName);
        setProfilePhone(legacyPhone);
      }
    });

    fetchDefaultAddress(supabase, session.user.id).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setAddressTableReady(true);
        setAddress(result.data ?? emptyAddress);
      } else {
        setAddressTableReady(result.reason !== "not-configured");
        setAddress(emptyAddress);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!session || !supabase || activePanel !== "orders") return;
    let cancelled = false;
    fetchQuoteRequests(supabase, session.user.id).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setOrdersTableReady(true);
        setOrders(result.data);
      } else {
        setOrdersTableReady(result.reason !== "not-configured");
        setOrders([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [session, activePanel]);
  const ordersLoading = activePanel === "orders" && orders === null;

  // Prefere o nome salvo em "Meus dados": o metadata do login guarda só o nome informado no cadastro.
  const displayName = useMemo(() => {
    if (profileName.trim()) return profileName.trim();
    const metadataName = session?.user.user_metadata?.full_name;
    return typeof metadataName === "string" && metadataName.trim() ? metadataName : "Cliente Impakto";
  }, [profileName, session]);

  function switchMode(nextMode: AccountMode) {
    setMode(nextMode);
    setFeedback(null);
    setCanResendConfirmation(false);
    setPassword("");
    setPasswordConfirmation("");
  }

  async function resendConfirmation() {
    const supabase = getSupabaseBrowserClient();
    const normalizedEmail = email.trim();
    if (!supabase || !normalizedEmail) {
      setFeedback({ type: "error", text: "Informe o e-mail usado no cadastro." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: { emailRedirectTo: `${window.location.origin}/conta` },
      });
      if (error) throw error;
      setFeedback({ type: "success", text: "Enviamos novamente o e-mail de confirmação. Verifique também a pasta de spam." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setFeedback({ type: "error", text: friendlyAuthError(message) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setFeedback(null);
    setSubmitting(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/conta`,
        });
        if (error) throw error;
        setFeedback({ type: "success", text: "Enviamos um link de recuperação para o seu e-mail." });
        return;
      }

      if (mode === "recovery") {
        if (password.length < 8) throw new Error("password should be at least 8 characters");
        if (password !== passwordConfirmation) {
          setFeedback({ type: "error", text: "As senhas não são iguais." });
          return;
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setFeedback({ type: "success", text: "Senha atualizada com sucesso." });
        setPassword("");
        setPasswordConfirmation("");
        return;
      }

      if (mode === "register") {
        if (name.trim().length < 3) {
          setFeedback({ type: "error", text: "Informe seu nome completo." });
          return;
        }
        if (password.length < 8) {
          setFeedback({ type: "error", text: "A senha precisa ter pelo menos 8 caracteres." });
          return;
        }
        if (password !== passwordConfirmation) {
          setFeedback({ type: "error", text: "As senhas não são iguais." });
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/conta`,
          },
        });
        if (error) throw error;
        setFeedback(data.session
          ? { type: "success", text: "Conta criada. Você já está conectado." }
          : { type: "success", text: "Conta criada! Abra seu e-mail para confirmar o cadastro." });
        setCanResendConfirmation(!data.session);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      setFeedback({ type: "success", text: "Login realizado com sucesso." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setCanResendConfirmation(message.toLowerCase().includes("email not confirmed"));
      setFeedback({ type: "error", text: friendlyAuthError(message) });
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSubmitting(true);
    const { error } = await supabase.auth.signOut();
    setSubmitting(false);
    if (error) setFeedback({ type: "error", text: "Não foi possível sair da conta." });
    else switchMode("login");
  }

  function toggleDashboardPanel(panel: Exclude<DashboardPanel, null>) {
    setDashboardFeedback(null);
    setActivePanel((current) => current === panel ? null : panel);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !session) return;
    if (profileName.trim().length < 3) {
      setDashboardFeedback({ type: "error", text: "Informe seu nome completo." });
      return;
    }

    setDashboardSaving(true);
    setDashboardFeedback(null);
    const result = await persistProfile(supabase, session.user.id, {
      full_name: profileName.trim(),
      phone: profilePhone.trim(),
    });
    setDashboardSaving(false);
    if (!result.ok) setProfileTableReady(result.reason !== "not-configured");
    setDashboardFeedback(result.ok
      ? { type: "success", text: "Seus dados foram atualizados." }
      : { type: "error", text: result.reason === "not-configured" ? "A tabela de perfis ainda não foi configurada no Supabase." : "Não foi possível salvar seus dados." });
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !session) return;

    setDashboardSaving(true);
    setDashboardFeedback(null);
    const normalizedAddress = Object.fromEntries(
      Object.entries(address).map(([key, value]) => [key, value.trim()]),
    ) as CustomerAddress;
    const result = await persistDefaultAddress(supabase, session.user.id, normalizedAddress);
    setDashboardSaving(false);
    if (!result.ok) setAddressTableReady(result.reason !== "not-configured");
    setDashboardFeedback(result.ok
      ? { type: "success", text: "Endereço principal salvo com sucesso." }
      : { type: "error", text: result.reason === "not-configured" ? "A tabela de endereços ainda não foi configurada no Supabase." : "Não foi possível salvar o endereço." });
  }

  if (!configured) {
    return (
      <section className="account-setup" aria-labelledby="account-setup-title">
        <span>Configuração necessária</span>
        <h2 id="account-setup-title">Conecte seu projeto Supabase</h2>
        <p>A área do cliente já está pronta. Para ativar cadastros reais, crie o arquivo <code>.env.local</code> usando o modelo <code>.env.example</code> e reinicie o servidor.</p>
        <div><strong>1</strong><span>Crie um projeto no Supabase.</span><strong>2</strong><span>Copie a URL e a chave pública.</span><strong>3</strong><span>Cadastre os URLs de redirecionamento.</span></div>
      </section>
    );
  }

  if (!ready) return <div className="account-loading" role="status">Carregando sua conta…</div>;

  if (session && mode !== "recovery") {
    const initials = displayName.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    return (
      <section className="customer-dashboard" aria-labelledby="customer-name">
        <div className="customer-welcome">
          <div className="customer-avatar" aria-hidden="true">{initials}</div>
          <div><span>Bem-vindo à Impakto</span><h2 id="customer-name">{displayName}</h2><p>{session.user.email}</p></div>
          <button type="button" onClick={signOut} disabled={submitting}>Sair da conta</button>
        </div>
        <div className="customer-dashboard-grid">
          <button className={activePanel === "profile" ? "is-active" : ""} type="button" onClick={() => toggleDashboardPanel("profile")} aria-expanded={activePanel === "profile"}>
            <span><Icon name="user" /></span><div><strong>Meus dados</strong><p>Nome, e-mail e telefone da sua conta.</p></div><small>Conta ativa</small>
          </button>
          <button className={activePanel === "orders" ? "is-active" : ""} type="button" onClick={() => toggleDashboardPanel("orders")} aria-expanded={activePanel === "orders"}>
            <span><Icon name="cart" /></span><div><strong>Meus orçamentos</strong><p>Histórico dos orçamentos enviados pelo carrinho.</p></div><small>Histórico</small>
          </button>
          <button className={activePanel === "address" ? "is-active" : ""} type="button" onClick={() => toggleDashboardPanel("address")} aria-expanded={activePanel === "address"}>
            <span><Icon name="pin" /></span><div><strong>Meus endereços</strong><p>Cadastre seu endereço principal.</p></div><small>Cadastro</small>
          </button>
        </div>

        {activePanel === "profile" && (
          <section className="customer-detail-panel" aria-labelledby="profile-panel-title">
            <div className="customer-panel-heading"><div><span>Informações pessoais</span><h3 id="profile-panel-title">Meus dados</h3></div><button type="button" onClick={() => setActivePanel(null)} aria-label="Fechar meus dados"><Icon name="close" size={18} /></button></div>
            {!profileTableReady && <div className="account-feedback error" role="status">A tabela de perfis ainda não foi configurada no Supabase. Aplique a migration em <code>supabase/migrations/20260727_customer_profiles.sql</code> para ativar o salvamento.</div>}
            <form className="customer-form" onSubmit={saveProfile}>
              <label><span>Nome completo</span><input type="text" autoComplete="name" value={profileName} onChange={(event) => setProfileName(event.target.value)} required /></label>
              <label><span>E-mail</span><input type="email" value={session.user.email ?? ""} readOnly aria-readonly="true" /></label>
              <label className="customer-form-wide"><span>Telefone / WhatsApp</span><input type="tel" autoComplete="tel" inputMode="tel" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} placeholder="(11) 99999-9999" /></label>
              {dashboardFeedback && <div className={`account-feedback ${dashboardFeedback.type} customer-form-wide`} role="status">{dashboardFeedback.text}</div>}
              <div className="customer-form-actions customer-form-wide"><button type="submit" disabled={dashboardSaving}>{dashboardSaving ? "Salvando…" : "Salvar meus dados"}</button></div>
            </form>
          </section>
        )}

        {activePanel === "orders" && (
          <section className="customer-detail-panel" aria-labelledby="orders-panel-title">
            <div className="customer-panel-heading"><div><span>Histórico da conta</span><h3 id="orders-panel-title">Meus orçamentos</h3></div><button type="button" onClick={() => setActivePanel(null)} aria-label="Fechar meus orçamentos"><Icon name="close" size={18} /></button></div>
            {!ordersTableReady ? (
              <div className="account-feedback error" role="status">A tabela de orçamentos ainda não foi configurada no Supabase. Aplique a migration em <code>supabase/migrations/20260727_customer_profiles.sql</code> para ativar o histórico.</div>
            ) : ordersLoading ? (
              <div className="account-loading" role="status">Carregando seus orçamentos…</div>
            ) : (orders ?? []).length === 0 ? (
              <div className="customer-empty-orders"><span><Icon name="cart" size={26} /></span><h4>Nenhum orçamento registrado</h4><p>Quando você enviar um orçamento pelo carrinho estando conectado, ele aparecerá aqui.</p><Link href="/#categorias">Explorar departamentos</Link></div>
            ) : (
              <ul className="customer-orders-list">
                {(orders ?? []).map((order) => (
                  <li key={order.id}>
                    <div><strong>{order.store_name}</strong><span>{new Date(order.created_at).toLocaleDateString("pt-BR")}</span></div>
                    <p>{order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {activePanel === "address" && (
          <section className="customer-detail-panel" aria-labelledby="address-panel-title">
            <div className="customer-panel-heading"><div><span>Endereço principal</span><h3 id="address-panel-title">Meus endereços</h3></div><button type="button" onClick={() => setActivePanel(null)} aria-label="Fechar meus endereços"><Icon name="close" size={18} /></button></div>
            {!addressTableReady && <div className="account-feedback error" role="status">A tabela de endereços ainda não foi configurada no Supabase. Aplique a migration em <code>supabase/migrations/20260727_customer_profiles.sql</code> para ativar o salvamento.</div>}
            <form className="customer-form customer-address-form" onSubmit={saveAddress}>
              <label><span>CEP</span><input type="text" inputMode="numeric" autoComplete="postal-code" value={address.postal_code} onChange={(event) => setAddress((current) => ({ ...current, postal_code: event.target.value }))} placeholder="00000-000" required /></label>
              <label className="customer-form-street"><span>Rua / Avenida</span><input type="text" autoComplete="address-line1" value={address.street} onChange={(event) => setAddress((current) => ({ ...current, street: event.target.value }))} required /></label>
              <label><span>Número</span><input type="text" value={address.number} onChange={(event) => setAddress((current) => ({ ...current, number: event.target.value }))} required /></label>
              <label><span>Complemento</span><input type="text" autoComplete="address-line2" value={address.complement} onChange={(event) => setAddress((current) => ({ ...current, complement: event.target.value }))} placeholder="Apartamento, bloco…" /></label>
              <label><span>Bairro</span><input type="text" value={address.district} onChange={(event) => setAddress((current) => ({ ...current, district: event.target.value }))} required /></label>
              <label><span>Cidade</span><input type="text" autoComplete="address-level2" value={address.city} onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))} required /></label>
              <label><span>Estado</span><input type="text" autoComplete="address-level1" maxLength={2} value={address.state} onChange={(event) => setAddress((current) => ({ ...current, state: event.target.value.toUpperCase() }))} placeholder="SP" required /></label>
              {dashboardFeedback && <div className={`account-feedback ${dashboardFeedback.type} customer-form-wide`} role="status">{dashboardFeedback.text}</div>}
              <div className="customer-form-actions customer-form-wide"><button type="submit" disabled={dashboardSaving}>{dashboardSaving ? "Salvando…" : "Salvar endereço"}</button></div>
            </form>
          </section>
        )}
      </section>
    );
  }

  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const isRecovery = mode === "recovery";
  const title = isRegister ? "Crie sua conta" : isForgot ? "Recupere sua senha" : isRecovery ? "Defina uma nova senha" : "Acesse sua conta";

  return (
    <section className="account-auth-card" aria-labelledby="account-form-title">
      <div className="account-auth-intro">
        <span>Minha Impakto</span>
        <h2 id="account-form-title">{title}</h2>
        <p>{isRegister ? "Cadastre-se para acompanhar suas informações e aproveitar uma experiência mais completa." : isForgot ? "Informe o e-mail da conta e enviaremos as instruções." : isRecovery ? "Escolha uma senha segura com pelo menos 8 caracteres." : "Entre para acessar seu perfil e acompanhar suas informações."}</p>
      </div>

      {!isForgot && !isRecovery && (
        <div className="account-mode-tabs" role="tablist" aria-label="Entrar ou cadastrar">
          <button type="button" role="tab" aria-selected={!isRegister} onClick={() => switchMode("login")}>Entrar</button>
          <button type="button" role="tab" aria-selected={isRegister} onClick={() => switchMode("register")}>Criar conta</button>
        </div>
      )}

      <form className="account-form" onSubmit={handleSubmit}>
        {isRegister && <label><span>Nome completo</span><input type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Como devemos chamar você?" required /></label>}
        {!isRecovery && <label><span>E-mail</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" required /></label>}
        {!isForgot && <label><span>{isRecovery ? "Nova senha" : "Senha"}</span><input type="password" autoComplete={isRegister || isRecovery ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" minLength={8} required /></label>}
        {(isRegister || isRecovery) && <label><span>Confirme a senha</span><input type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="Digite a senha novamente" minLength={8} required /></label>}

        {feedback && <div className={`account-feedback ${feedback.type}`} role="status">{feedback.text}</div>}

        <button className="account-submit" type="submit" disabled={submitting}>{submitting ? "Aguarde…" : isRegister ? "Criar minha conta" : isForgot ? "Enviar link de recuperação" : isRecovery ? "Salvar nova senha" : "Entrar na minha conta"}</button>
      </form>

      <div className="account-form-footer">
        {canResendConfirmation && <button type="button" onClick={resendConfirmation} disabled={submitting}>Reenviar e-mail de confirmação</button>}
        {mode === "login" && <button type="button" onClick={() => switchMode("forgot")}>Esqueci minha senha</button>}
        {(isForgot || isRecovery) && <button type="button" onClick={() => switchMode("login")}>← Voltar para o login</button>}
        <small>Ao continuar, você concorda com o uso dos seus dados para identificação e acesso à conta, conforme a <Link href="/politica-de-privacidade">política de privacidade</Link>.</small>
      </div>
    </section>
  );
}
