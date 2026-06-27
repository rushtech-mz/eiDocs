"use client";

import React, { useEffect, useState } from 'react';
import statsService from '@/services/statsService';
import DetailModal from '@/components/ui/DetailModal';
import { TipoDocumento } from '@/types';
import { 
  File, 
  Calendar, 
  Code, 
  CheckCircle,
  XCircle,
  Folder
} from 'lucide-react';

interface TipoDetailProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: TipoDocumento | null;
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

const TipoDetail: React.FC<TipoDetailProps> = ({
  isOpen,
  onClose,
  tipo
}) => {
  const [stats, setStats] = useState<import('@/services/statsService').TypeStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tipo) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tipo]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const apiStats = await statsService.getTypeStats();
      setStats(apiStats);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (!tipo) return null;

  const categoria = typeof tipo.categoria === 'string' ? null : tipo.categoria;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Tipo de Documento"
      size="lg"
    >
      <div className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
              <File className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tipo.nome}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  tipo.ativo
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                }`}>
                  {tipo.ativo ? (
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
              {tipo.descricao && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">{tipo.descricao}</p>
              )}
              
              {/* Categoria */}
              {categoria && (
                <div className="mb-3 flex items-center space-x-2">
                  <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Categoria:</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: categoria.cor || '#6B7280' }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{categoria.nome}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Code className="w-4 h-4" />
                  <span>Código: {tipo.codigo}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Criado em {formatDate(tipo.dataCriacao)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas do Tipo */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando estatísticas...</span>
          </div>
        ) : stats && tipo && (
          <>
            {/* Totais do Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total de Tipos</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.totais?.total ?? 0}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Ativos</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.totais?.ativos ?? 0}</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Inativos</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">{stats.totais?.inativos ?? 0}</p>
              </div>
            </div>

            {/* Uso por Tipo */}
            {stats.distribuicoes?.usoPorTipo?.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">Uso por Tipo</h4>
                <div className="space-y-2">
                  {stats.distribuicoes.usoPorTipo.filter(t => t.tipo === tipo.nome).map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.tipo}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t.quantidade} docs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mais Usados */}
            {stats.distribuicoes?.maisUsados?.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">Mais Usados</h4>
                <div className="space-y-2">
                  {stats.distribuicoes.maisUsados.filter(t => t.nome === tipo.nome).map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.nome}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t.quantidade} docs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recentes */}
            {stats.recentes?.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">Tipos Recentes</h4>
                <div className="space-y-2">
                  {stats.recentes.filter(t => t.nome === tipo.nome).map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.nome}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(t.dataCriacao)}</span>
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
              <span className="ml-2 text-gray-900 dark:text-gray-100">{formatDate(tipo.dataAtualizacao)}</span>
            </div>
          </div>
        </div>
      </div>
    </DetailModal>
  );
};

export default TipoDetail;
