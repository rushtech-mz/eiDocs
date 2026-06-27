"use client";

import React, { Suspense, useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, Building2, ShieldCheck, FolderLock, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";

interface TenantInfo {
  id: string;
  nome: string;
  slug: string;
  plano: string;
}

function getSubdomainSlug(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  const rootDomains = ["eidocs.pt", "localhost", "127.0.0.1"];
  const parts = host.split(".");
  if (parts.length > 1 && !rootDomains.includes(host)) {
    return parts[0];
  }
  return null;
}

const features = [
  {
    icon: ShieldCheck,
    title: "Segurança e controlo de acesso",
    description: "Permissões por departamento e perfil de utilizador.",
  },
  {
    icon: FolderLock,
    title: "Organização centralizada",
    description: "Categorias, tipos e departamentos para encontrar tudo rapidamente.",
  },
  {
    icon: History,
    title: "Auditoria e histórico",
    description: "Acompanhe quem criou e editou cada documento.",
  },
];

const LoginForm = () => {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(false);
  const { login, loading, user } = useAuth();
  const { addToast } = useToastContext();
  const router = useRouter();

  // Detectar tenant via slug param ou subdomínio
  useEffect(() => {
    const slug = searchParams.get("slug") ?? getSubdomainSlug();
    if (!slug) return;
    setLoadingTenant(true);
    authService.getTenantInfo(slug).then((info) => {
      setTenantInfo(info);
    }).finally(() => setLoadingTenant(false));
  }, [searchParams]);

  // Redirecionar se já autenticado
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !senha.trim()) {
      addToast("warning", "Campos obrigatórios", "Por favor, preencha username e senha.");
      return;
    }

    try {
      await login(username, senha);
      addToast("success", "Login realizado com sucesso!");
    } catch (error: any) {
      let errorTitle = "Erro ao realizar login";
      let errorMessage = "";

      if (error?.message) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError") || error.message.includes("fetch")) {
          errorTitle = "Erro de conexão";
          errorMessage = "Não foi possível conectar ao servidor. Verifique a sua ligação à internet.";
        } else if (error.message.includes("Credenciais inválidas") || error.message.includes("401") || error.message.includes("Unauthorized")) {
          errorTitle = "Credenciais inválidas";
          errorMessage = "Username ou senha incorretos.";
        } else if (error.message.includes("402") || error.message.includes("trial")) {
          errorTitle = "Trial expirado";
          errorMessage = "O período de trial da sua empresa expirou. Contacte o suporte.";
        } else if (error.message.includes("500")) {
          errorTitle = "Erro do servidor";
          errorMessage = "Ocorreu um erro interno. Tente novamente mais tarde.";
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      }

      addToast("error", errorTitle, errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* Painel institucional (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-dark text-white overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-blue/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-96 h-96 bg-primary-purple/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.jpg" alt="eiDocs Logo" className="w-10 h-10 rounded-lg object-cover shadow-lg" />
          <span className="text-xl font-bold tracking-tight">eiDocs</span>
        </div>

        <div className="relative z-10 max-w-md space-y-10">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight">
              Gestão documental, simplificada para a sua empresa.
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Centralize, organize e controle o acesso a todos os documentos da sua organização num único lugar seguro.
            </p>
          </div>

          <div className="space-y-5">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{title}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} eiDocs. Todos os direitos reservados.
        </p>
      </div>

      {/* Painel de autenticação */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-sm">
          {/* Logo (mobile) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/logo.jpg" alt="eiDocs Logo" className="w-10 h-10 rounded-lg object-cover shadow-lg" />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">eiDocs</span>
          </div>

          {/* Cabeçalho */}
          <div className="space-y-2 mb-8">
            {loadingTenant ? (
              <div className="h-7 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ) : tenantInfo ? (
              <>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{tenantInfo.nome}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bem-vindo de volta</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Entre na conta da <strong>{tenantInfo.nome}</strong></p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bem-vindo de volta</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Entre com as suas credenciais para aceder à plataforma</p>
              </>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-gray-500" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite o seu username"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="senha" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-gray-500" />
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite a sua senha"
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim() || !senha.trim()}
              className="w-full bg-gradient-primary text-white font-semibold py-2.5 px-4 rounded-lg shadow-soft hover:shadow-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-soft flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>A entrar...</span>
                </>
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

const LoginPage = () => (
  <Suspense fallback={null}>
    <LoginForm />
  </Suspense>
);

export default LoginPage;
