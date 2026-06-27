"use client";

import React from "react";
import { Shield, Database, Zap } from "lucide-react";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  type?: "login" | "register";
  className?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({
  children,
  title,
  subtitle,
  type = "login",
  className = ""
}) => {
  const getIcon = () => {
    switch (type) {
      case "login":
        return <Shield className="h-8 w-8 text-green-600" />;
      case "register":
        return <Database className="h-8 w-8 text-green-600" />;
      default:
        return <Zap className="h-8 w-8 text-purple-600" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case "login":
        return "from-green-50 to-emerald-50";
      case "register":
        return "from-green-50 to-emerald-50";
      default:
        return "from-purple-50 to-pink-50";
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${getGradient()} p-4`}>
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className={`
          bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20
          p-8 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl
          ${className}
        `}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4">
              {getIcon()}
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 text-sm">
                {subtitle}
              </p>
            )}
          </div>

          {/* Conteúdo */}
          <div className="space-y-6">
            {children}
          </div>
        </div>

        {/* Footer com informações da plataforma */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
            <Zap className="h-4 w-4" />
            <span>Plataforma Inteligente de Documentos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
