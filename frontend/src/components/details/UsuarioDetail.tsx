"use client";

import React, { useState, useEffect } from 'react';
import DetailModal from '@/components/ui/DetailModal';
import { Usuario, Departamento, UserRole } from '@/types';
import { 
  User, 
  Calendar, 
  Building2, 
  Shield, 
  FileText, 
  Activity, 
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Upload,
  Download,
  Eye
} from 'lucide-react';

interface UsuarioDetailProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
}

interface UsuarioStats {
  totalDocumentos: number;
  documentosEnviados: number;
  documentosRecebidos: number;
  documentosInternos: number;
  ultimoDocumento?: {
    titulo: string;
    tipo: string;
    data: string;
  };
  atividadeRecente: {
    acao: string;
    documento: string;
    data: string;
  }[];
  estatisticasMensais: {
    mes: string;
    documentos: number;
  }[];
}

const UsuarioDetail: React.FC<UsuarioDetailProps> = ({
  isOpen,
  onClose,
  usuario
}) => {
  const [stats, setStats] = useState<UsuarioStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && usuario) {
      loadStats();
    }
  }, [isOpen, usuario]);

  const loadStats = async () => {
    if (!usuario) return;
    
    setLoading(true);
    try {
      // TODO: Implementar chamada real para API
      // Simulando dados por enquanto
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const totalEnviados = Math.floor(Math.random() * 30) + 5;
      const totalRecebidos = Math.floor(Math.random() * 25) + 3;
      const totalInternos = Math.floor(Math.random() * 20) + 2;
      
      setStats({
        totalDocumentos: totalEnviados + totalRecebidos + totalInternos,
        documentosEnviados: totalEnviados,
        documentosRecebidos: totalRecebidos,
        documentosInternos: totalInternos,
        ultimoDocumento: {
          titulo: "Relatório de Atividades Q1",
          tipo: "Relatório",
          data: new Date().toISOString()
        },
        atividadeRecente: [
          { acao: "Criou documento", documento: "Contrato de Serviços", data: "2024-01-20" },
          { acao: "Visualizou documento", documento: "Política de Segurança", data: "2024-01-19" },
          { acao: "Baixou documento", documento: "Manual do Usuário", data: "2024-01-18" },
          { acao: "Editou documento", documento: "Relatório Mensal", data: "2024-01-17" }
        ],
        estatisticasMensais: [
          { mes: "Jan", documentos: 12 },
          { mes: "Fev", documentos: 8 },
          { mes: "Mar", documentos: 15 },
          { mes: "Abr", documentos: 10 }
        ]
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDepartmentName = (departamento: string | Departamento | null): string => {
    if (!departamento) {
      return 'Sem departamento';
    }
    if (typeof departamento === 'string') {
      return 'Carregando...'; // TODO: Buscar nome do departamento
    }
    return departamento.nome;
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig: Record<UserRole, { bg: string; text: string; label: string }> = {
      'superadmin': { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-800 dark:text-purple-300', label: 'Super Administrador' },
      'org_admin': { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-800 dark:text-indigo-300', label: 'Administrador da Organização' },
      'admin': { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-300', label: 'Administrador' },
      'editor': { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-300', label: 'Editor (Gerente)' },
      'user': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', label: 'Usuário' }
    };

    const config = roleConfig[role] || roleConfig.user;
    return (
      <span 
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getActionIcon = (acao: string) => {
    if (acao.includes('Criou')) return <Upload className="w-3 h-3" />;
    if (acao.includes('Baixou')) return <Download className="w-3 h-3" />;
    if (acao.includes('Visualizou')) return <Eye className="w-3 h-3" />;
    return <Activity className="w-3 h-3" />;
  };

  if (!usuario) return null;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Usuário"
      size="xl"
    >
      <div className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{usuario.nome}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  usuario.ativo
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                }`}>
                  {usuario.ativo ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Inativo
                    </>
                  )}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>@{usuario.username}</span>
                  </div>
                  {usuario.apelido && (
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>"{usuario.apelido}"</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-4 h-4" />
                    <span>Departamento: {getDepartmentName(usuario.departamento)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Membro desde {formatDate(usuario.dataCriacao)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Função:</span>
                  {getRoleBadge(usuario.role)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando estatísticas...</span>
          </div>
        ) : null}

        {/* Metadados */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Informações do Sistema</h4>
          <div className="text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Última Atualização:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">{formatDate(usuario.dataAtualizacao)}</span>
            </div>
          </div>
        </div>
      </div>
    </DetailModal>
  );
};

export default UsuarioDetail;
