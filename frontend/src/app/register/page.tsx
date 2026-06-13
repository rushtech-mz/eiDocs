"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, ArrowRight, ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/authService";
import Link from "next/link";

// ── Tipos ───────────────────────────────────────────────────────────────────

interface EmpresaForm {
  nome: string;
  slug: string;
}

interface AdminForm {
  nome: string;
  apelido: string;
  username: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

type Step = 1 | 2 | 3;

// ── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
}

// ── Componentes de passo ────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "Empresa" },
    { n: 2, label: "Conta" },
    { n: 3, label: "Pronto" },
  ];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                current > s.n
                  ? "bg-green-500 text-white"
                  : current === s.n
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {current > s.n ? <Check className="w-4 h-4" /> : s.n}
            </div>
            <span className={`text-xs mt-1 ${current === s.n ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 h-0.5 mb-4 transition-colors ${current > s.n ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 dark:text-red-400">{msg}</p>;
}

// ── Página principal ────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registeredSlug, setRegisteredSlug] = useState("");

  const [empresa, setEmpresa] = useState<EmpresaForm>({ nome: "", slug: "" });
  const [admin, setAdmin] = useState<AdminForm>({
    nome: "", apelido: "", username: "", email: "", senha: "", confirmarSenha: ""
  });
  const [errors, setErrors] = useState<Partial<EmpresaForm & AdminForm>>({});

  // ── Validação passo 1
  function validateStep1(): boolean {
    const e: typeof errors = {};
    if (!empresa.nome.trim()) e.nome = "Nome da empresa é obrigatório";
    if (!empresa.slug.trim()) e.slug = "Subdomínio é obrigatório";
    else if (!/^[a-z0-9-]+$/.test(empresa.slug)) e.slug = "Apenas letras minúsculas, números e hífens";
    else if (empresa.slug.length < 2) e.slug = "Mínimo 2 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Validação passo 2
  function validateStep2(): boolean {
    const e: typeof errors = {};
    if (!admin.nome.trim()) e.nome = "Nome é obrigatório";
    if (!admin.apelido.trim()) e.apelido = "Apelido é obrigatório";
    if (!admin.username.trim()) e.username = "Username é obrigatório";
    else if (admin.username.length < 3) e.username = "Mínimo 3 caracteres";
    if (admin.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email)) e.email = "Email inválido";
    if (!admin.senha) e.senha = "Senha é obrigatória";
    else if (admin.senha.length < 6) e.senha = "Mínimo 6 caracteres";
    if (admin.senha !== admin.confirmarSenha) e.confirmarSenha = "As senhas não coincidem";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submeter registo
  async function handleSubmit() {
    if (!validateStep2()) return;
    setLoading(true);
    setError("");
    try {
      await authService.register({
        empresa: { nome: empresa.nome, slug: empresa.slug },
        admin: {
          nome: admin.nome,
          apelido: admin.apelido,
          username: admin.username.toLowerCase(),
          email: admin.email || undefined,
          senha: admin.senha,
        },
      });
      setRegisteredSlug(empresa.slug);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── Passo 1: Dados da empresa ──────────────────────────────────────────────
  const Step1 = (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da empresa</label>
        <input
          className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.nome ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`}
          placeholder="Acme Lda."
          value={empresa.nome}
          onChange={e => {
            const nome = e.target.value;
            setEmpresa(f => ({ nome, slug: f.slug || slugify(nome) }));
            setErrors(ev => ({ ...ev, nome: undefined }));
          }}
        />
        <FieldError msg={errors.nome} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subdomínio</label>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400">
          <input
            className={`flex-1 px-4 py-2.5 text-sm outline-none font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.slug ? "border-red-400 dark:border-red-500" : ""}`}
            placeholder="acme"
            value={empresa.slug}
            onChange={e => {
              setEmpresa(f => ({ ...f, slug: slugify(e.target.value) }));
              setErrors(ev => ({ ...ev, slug: undefined }));
            }}
          />
          <span className="flex items-center px-3 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-sm border-l border-gray-300 dark:border-gray-600 select-none">
            .eidocs.pt
          </span>
        </div>
        <FieldError msg={errors.slug} />
        {!errors.slug && empresa.slug && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">O teu sistema ficará em <strong>{empresa.slug}.eidocs.pt</strong></p>
        )}
      </div>
      <button
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        onClick={() => { if (validateStep1()) setStep(2); }}
      >
        Continuar <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  // ── Passo 2: Conta de admin ────────────────────────────────────────────────
  const Step2 = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
          <input
            className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.nome ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`}
            placeholder="João"
            value={admin.nome}
            onChange={e => { setAdmin(f => ({ ...f, nome: e.target.value })); setErrors(ev => ({ ...ev, nome: undefined })); }}
          />
          <FieldError msg={errors.nome} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apelido</label>
          <input
            className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.apelido ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`}
            placeholder="Silva"
            value={admin.apelido}
            onChange={e => { setAdmin(f => ({ ...f, apelido: e.target.value })); setErrors(ev => ({ ...ev, apelido: undefined })); }}
          />
          <FieldError msg={errors.apelido} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
        <input
          className={`w-full rounded-lg border px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.username ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`}
          placeholder="joaosilva"
          value={admin.username}
          onChange={e => { setAdmin(f => ({ ...f, username: e.target.value.toLowerCase() })); setErrors(ev => ({ ...ev, username: undefined })); }}
        />
        <FieldError msg={errors.username} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span></label>
        <input
          type="email"
          className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.email ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`}
          placeholder="joao@acme.pt"
          value={admin.email}
          onChange={e => { setAdmin(f => ({ ...f, email: e.target.value })); setErrors(ev => ({ ...ev, email: undefined })); }}
        />
        <FieldError msg={errors.email} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.senha ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`}
            placeholder="Mínimo 6 caracteres"
            value={admin.senha}
            onChange={e => { setAdmin(f => ({ ...f, senha: e.target.value })); setErrors(ev => ({ ...ev, senha: undefined })); }}
          />
          <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <FieldError msg={errors.senha} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar senha</label>
        <input
          type="password"
          className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.confirmarSenha ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`}
          placeholder="Repete a senha"
          value={admin.confirmarSenha}
          onChange={e => { setAdmin(f => ({ ...f, confirmarSenha: e.target.value })); setErrors(ev => ({ ...ev, confirmarSenha: undefined })); }}
        />
        <FieldError msg={errors.confirmarSenha} />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setStep(1)}
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "A criar conta…" : (<>Criar conta <ArrowRight className="w-4 h-4" /></>)}
        </button>
      </div>
    </div>
  );

  // ── Passo 3: Sucesso ───────────────────────────────────────────────────────
  const Step3 = (
    <div className="text-center space-y-6 py-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Conta criada com sucesso!</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          O teu espaço de trabalho está pronto em{" "}
          <strong className="text-indigo-600 dark:text-indigo-400">{registeredSlug}.eidocs.pt</strong>.
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tens <strong>14 dias de trial</strong> para experimentar gratuitamente.
        </p>
      </div>
      <div className="space-y-3">
        <button
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          onClick={() => router.push(`/dashboard`)}
        >
          Ir para o dashboard
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Verifica o teu email para as instruções de acesso.
        </p>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  const stepContent: Record<Step, React.ReactNode> = { 1: Step1, 2: Step2, 3: Step3 };
  const stepTitle: Record<Step, string> = {
    1: "Cria a tua empresa",
    2: "A tua conta de administrador",
    3: "Tudo pronto!",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">eiDocs</span>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Gestão documental para empresas</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <StepIndicator current={step} />

          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">{stepTitle[step]}</h2>

          {stepContent[step]}
        </div>

        {step < 3 && (
          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            Já tens conta?{" "}
            <Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
              Iniciar sessão
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
