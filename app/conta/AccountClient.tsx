"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../supabase-client";

type AccountMode = "login" | "register" | "forgot" | "recovery";
type Feedback = { type: "success" | "error"; text: string } | null;
type DashboardPanel = "profile" | "orders" | "address" | null;
type CustomerAddress = {
  postal_code: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

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

  const configured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setReady(true);
      return;
    }

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
    if (!session) return;
    const metadata = session.user.user_metadata ?? {};
    setProfileName(typeof metadata.full_name === "string" ? metadata.full_name : "");
    setProfilePhone(typeof metadata.phone === "string" ? metadata.phone : "");
    const savedAddress = metadata.address;
    if (savedAddress && typeof savedAddress === "object") {
      setAddress({ ...emptyAddress, ...(savedAddress as Partial<CustomerAddress>) });
    } else {
      setAddress(emptyAddress);
    }
  }, [session]);

  const displayName = useMemo(() => {
    const metadataName = session?.user.user_metadata?.full_name;
    return typeof metadataName === "string" && metadataName.trim() ? metadataName : "Cliente Impakto";
  }, [session]);

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
    const { error } = await supabase.auth.updateUser({
      data: {
        ...session.user.user_metadata,
        full_name: profileName.trim(),
        phone: profilePhone.trim(),
      },
    });
    setDashboardSaving(false);
    setDashboardFeedback(error
      ? { type: "error", text: "Não foi possível salvar seus dados." }
      : { type: "success", text: "Seus dados foram atualizados." });
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
    const { error } = await supabase.auth.updateUser({
      data: {
        ...session.user.user_metadata,
        address: normalizedAddress,
      },
    });
    setDashboardSaving(false);
    setDashboardFeedback(error
      ? { type: "error", text: "Não foi possível salvar o endereço." }
      : { type: "success", text: "Endereço principal salvo com sucesso." });
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
            <span aria-hidden="true">♙</span><div><strong>Meus dados</strong><p>Nome, e-mail e telefone da sua conta.</p></div><small>Conta ativa</small>
          </button>
          <button className={activePanel === "orders" ? "is-active" : ""} type="button" onClick={() => toggleDashboardPanel("orders")} aria-expanded={activePanel === "orders"}>
            <span aria-hidden="true">▣</span><div><strong>Meus pedidos</strong><p>Acompanhe suas solicitações.</p></div><small>Histórico</small>
          </button>
          <button className={activePanel === "address" ? "is-active" : ""} type="button" onClick={() => toggleDashboardPanel("address")} aria-expanded={activePanel === "address"}>
            <span aria-hidden="true">⌖</span><div><strong>Meus endereços</strong><p>Cadastre seu endereço principal.</p></div><small>Cadastro</small>
          </button>
        </div>

        {activePanel === "profile" && (
          <section className="customer-detail-panel" aria-labelledby="profile-panel-title">
            <div className="customer-panel-heading"><div><span>Informações pessoais</span><h3 id="profile-panel-title">Meus dados</h3></div><button type="button" onClick={() => setActivePanel(null)} aria-label="Fechar meus dados">×</button></div>
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
            <div className="customer-panel-heading"><div><span>Histórico da conta</span><h3 id="orders-panel-title">Meus pedidos</h3></div><button type="button" onClick={() => setActivePanel(null)} aria-label="Fechar meus pedidos">×</button></div>
            <div className="customer-empty-orders"><span aria-hidden="true">▣</span><h4>Nenhum pedido registrado</h4><p>Quando houver solicitações vinculadas à sua conta, elas aparecerão aqui.</p><a href="/#categorias">Explorar departamentos</a></div>
          </section>
        )}

        {activePanel === "address" && (
          <section className="customer-detail-panel" aria-labelledby="address-panel-title">
            <div className="customer-panel-heading"><div><span>Endereço principal</span><h3 id="address-panel-title">Meus endereços</h3></div><button type="button" onClick={() => setActivePanel(null)} aria-label="Fechar meus endereços">×</button></div>
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
        <small>Ao continuar, você concorda com o uso dos seus dados para identificação e acesso à conta.</small>
      </div>
    </section>
  );
}
