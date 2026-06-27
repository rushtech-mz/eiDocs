"use client";

import React, { useEffect, useState } from 'react';
import statsService from '@/services/statsService';
import DetailModal from '@/components/ui/DetailModal';
import { CategoriaDocumento, Departamento } from '@/types';
import { 
  FolderOpen, 
  Calendar, 
  Building2, 
  Code, 
  CheckCircle,
  XCircle,
  Palette
} from 'lucide-react';

interface CategoriaDetailProps {
  isOpen: boolean;
  onClose: () => void;
  categoria: CategoriaDocumento | null;
}


const CategoriaDetail: React.FC<CategoriaDetailProps> = ({
  isOpen,
  onClose,
  categoria
}) => {
  const [stats, setStats] = useState<import('@/services/statsService').CategoryStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && categoria) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, categoria]);

  const loadStats = async () => {
    if (!categoria) return;
    setLoading(true);
    try {
      const apiStats = await statsService.getCategoryStats();
      setStats(apiStats);
    } catch {
      setStats(null);
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

  const getDepartmentName = (departamento: string | Departamento): string => {
    if (typeof departamento === 'string') {
      return 'Carregando...'; // TODO: Buscar nome do departamento
    }
    return departamento.nome;
  };

  const getColorDisplay = (cor?: string) => {
    if (!cor) return { bg: '#6b7280', text: '#fff' };
    return { bg: cor, text: '#fff' };
  };

  if (!categoria) return null;

  const colorStyle = getColorDisplay(categoria.cor);

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Categoria"
      size="xl"
    >
      <div className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colorStyle.bg }}
            >
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{categoria.nome}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  categoria.ativo
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                }`}>
                  {categoria.ativo ? (
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
              {categoria.descricao && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">{categoria.descricao}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Code className="w-4 h-4" />
                  <span>Código: {categoria.codigo}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building2 className="w-4 h-4" />
                  <span>Departamento: {getDepartmentName(categoria.departamento)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Palette className="w-4 h-4" />
                  <span>Cor: {categoria.cor || '#6b7280'}</span>
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: colorStyle.bg }}
                  ></div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Criado em {formatDate(categoria.dataCriacao)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando estatísticas...</span>
          </div>
        ) : stats && categoria && (
          <>
            {/* Totais da Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total de Categorias</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.totais?.total ?? 0}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Ativas</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.totais?.ativas ?? 0}</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Inativas</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">{stats.totais?.inativas ?? 0}</p>
              </div>
            </div>

            {/* Uso por Categoria */}
            {stats.distribuicoes?.usoPorCategoria?.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">Uso por Categoria</h4>
                <div className="space-y-2">
                  {stats.distribuicoes.usoPorCategoria.filter(cat => cat.categoria === categoria.nome).map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cat.categoria}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{cat.quantidade} docs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Distribuição por Departamento */}
            {stats.distribuicoes?.porDepartamento?.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">Distribuição por Departamento</h4>
                <div className="space-y-2">
                  {stats.distribuicoes.porDepartamento.map((dep, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{dep.departamento}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{dep.quantidade} docs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recentes */}
            {stats.recentes?.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">Categorias Recentes</h4>
                <div className="space-y-2">
                  {stats.recentes.filter(cat => cat.nome === categoria.nome).map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cat.nome}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(cat.dataCriacao)}</span>
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
              <span className="ml-2 text-gray-900 dark:text-gray-100">{formatDate(categoria.dataAtualizacao)}</span>
            </div>
          </div>
        </div>
      </div>
    </DetailModal>
  );
};

export default CategoriaDetail;
