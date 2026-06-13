"use client";

import React, { useEffect, useState } from 'react';
import statsService from '@/services/statsService';
import DetailModal from '@/components/ui/DetailModal';
import { Departamento } from '@/types';
import { 
  Building2, 
  Calendar, 
  Code, 
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DepartamentoDetailProps {
  isOpen: boolean;
  onClose: () => void;
  departamento: Departamento | null;
}



const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const DepartamentoDetail: React.FC<DepartamentoDetailProps> = ({
  isOpen,
  onClose,
  departamento
}) => {
  const [stats, setStats] = useState<import('@/services/statsService').SingleDepartmentStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && departamento) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, departamento]);

  const loadStats = async () => {
    if (!departamento) return;
    setLoading(true);
    try {
      const apiStats = await statsService.getSingleDepartmentStats(departamento._id);
      setStats(apiStats);
    } catch (error) {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (!departamento) return null;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Departamento"
      size="xl"
    >
      <div className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{departamento.nome}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  departamento.ativo
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                }`}>
                  {departamento.ativo ? (
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
              {departamento.descricao && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">{departamento.descricao}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Code className="w-4 h-4" />
                  <span>Código: {departamento.codigo}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Criado em {formatDate(departamento.dataCriacao)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas do Departamento */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando estatísticas...</span>
          </div>
        ) : stats && (
          <>
            {/* Cards de Totais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total de Documentos</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{stats.documentos?.total ?? 0}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Ativos</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.documentos?.ativos ?? 0}</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Arquivados</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">{stats.documentos?.arquivados ?? 0}</p>
              </div>
            </div>

            {/* Documentos por Categoria */}
            {stats.documentos?.porCategoria?.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">Documentos por Categoria</h4>
                <div className="space-y-2">
                  {stats.documentos.porCategoria.map((cat: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cat.categoria}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{cat.quantidade} docs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documentos por Tipo */}
            {stats.documentos?.porTipo?.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">Documentos por Tipo</h4>
                <div className="space-y-2">
                  {stats.documentos.porTipo.map((tipo: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{tipo.tipo}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{tipo.quantidade} docs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documentos Recentes */}
            {stats.documentos?.recentes?.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">Documentos Recentes</h4>
                <div className="space-y-2">
                  {stats.documentos.recentes.map((doc: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.titulo}</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{formatDate(doc.dataCriacao)}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{doc.categoria?.nome} / {doc.tipo?.nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Metadados */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Informações do Sistema</h4>
          <div className="text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Última Atualização:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">{formatDate(departamento.dataAtualizacao)}</span>
            </div>
          </div>
        </div>
      </div>
    </DetailModal>
  );
};

export default DepartamentoDetail;
