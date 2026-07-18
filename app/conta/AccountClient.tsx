"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../supabase-client";

type AccountMode = "login" | "register" | "forgot" | "recovery";
type Feedback = { type: "success" | "error"; text: string } | null;

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (normalized.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

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

  const displayName = useMemo(() => {
    const metadataName = session?.user.user_metadata?.full_name;
    return typeof metadataName === "string" && metadataName.trim() ? metadataName : "Cliente Impakto";
  }, [session]);

  function switchMode(nextMode: AccountMode) {
    setMode(nextMode);
    setFeedback(null);
    setPassword("");
    setPasswordConfirmation("");
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
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      setFeedback({ type: "success", text: "Login realizado com sucesso." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
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
          <article><span aria-hidden="true">♙</span><div><strong>Meus dados</strong><p>Nome e e-mail da sua conta.</p></div><small>Conta ativa</small></article>
          <article><span aria-hidden="true">▣</span><div><strong>Meus pedidos</strong><p>Seus pedidos aparecerão aqui.</p></div><small>Em breve</small></article>
          <article><span aria-hidden="true">⌖</span><div><strong>Meus endereços</strong><p>Endereços para entrega e cobrança.</p></div><small>Em breve</small></article>
        </div>
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
        {mode === "login" && <button type="button" onClick={() => switchMode("forgot")}>Esqueci minha senha</button>}
        {(isForgot || isRecovery) && <button type="button" onClick={() => switchMode("login")}>← Voltar para o login</button>}
        <small>Ao continuar, você concorda com o uso dos seus dados para identificação e acesso à conta.</small>
      </div>
    </section>
  );
}
