"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToastContext } from "@/contexts/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";
import Link from "next/link";

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

const LoginPage = () => {
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

  const slugParam = searchParams.get("slug") ?? getSubdomainSlug();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto">
              <img
                src="/logo.jpg"
                alt="eiDocs Logo"
                className="w-16 h-16 rounded-xl object-cover shadow-lg"
              />
            </div>
            {loadingTenant ? (
              <div className="h-7 w-40 mx-auto bg-gray-100 rounded animate-pulse" />
            ) : tenantInfo ? (
              <>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{tenantInfo.nome}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Entrar</h1>
                <p className="text-gray-600 text-sm">Entre na conta da <strong>{tenantInfo.nome}</strong></p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">eiDocuments</h1>
                <p className="text-gray-600">Entre na sua conta</p>
              </>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite o seu username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="senha" className="text-sm font-medium text-gray-700">
                  Senha
                </label>
                <Link
                  href={`/forgot-password${slugParam ? `?slug=${slugParam}` : ""}`}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite a sua senha"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim() || !senha.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

export default LoginPage;
