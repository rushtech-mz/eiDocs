"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import UserLayout from '@/components/ui/UserLayout';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import { FileText, Edit, Trash2, Eye, Download, Calendar, Plus } from 'lucide-react';
import { Documento } from '@/types';
import { useDocumentos } from '@/hooks/useDocumentos';
import { useAuth } from '@/hooks/useAuth';
import { DocumentosService } from '@/services/documentosService';
import Link from 'next/link';
import DocumentoViewModal from '@/components/details/DocumentoViewModal';
import DocumentoEditModal from '@/components/forms/DocumentoEditModal';

// Dynamic import to avoid SSR issues with react-pdf
const DocumentPreview = dynamic(
  () => import('@/components/ui/DocumentPreview').then(mod => ({ default: mod.DocumentPreview })),
  { ssr: false }
);

const MeusDocumentosPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { user } = useAuth();
  
  const {
    documentos,
    loading,
    carregar,
    buscarPorTexto,
    buscarPorUsuario,
    remover,
    baixar
  } = useDocumentos();

  useEffect(() => {
    // Carregar documentos do usuário logado
    if (user?._id) {
      buscarPorUsuario(user._id);
    }
  }, [user, buscarPorUsuario]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() && user?._id) {
      // Se não há busca, volta a mostrar documentos do usuário
      buscarPorUsuario(user._id);
      return;
    }
    // Busca por texto mas ainda filtrando pelos documentos do usuário
    if (user?._id) {
      buscarPorUsuario(user._id, { q: query });
    }
  };

  const handleDelete = async (documento: Documento) => {
    if (!confirm(`Deseja realmente excluir o documento "${documento.titulo}"?`)) {
      return;
    }

    try {
      await remover(documento._id);
      // Recarregar lista de documentos do usuário
      if (user?._id) {
        buscarPorUsuario(user._id);
      }
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
    }
  };

  const handleDownload = async (documento: Documento) => {
    try {
      await baixar(documento._id);
    } catch (err) {
      console.error('Erro ao baixar documento:', err);
    }
  };

  const handleEdit = (documento: Documento) => {
    setSelectedDocumento(documento);
    setIsEditModalOpen(true);
  };

  const handleView = (documento: Documento) => {
    setSelectedDocumento(documento);
    setIsViewModalOpen(true); // Abre modal de detalhes
  };

  const handlePreview = (documento: Documento) => {
    setSelectedDocumento(documento);
    setIsPreviewOpen(true); // Abre preview do documento
  };

  const handleSaveEdit = async (documento: Documento, formData: any) => {
    try {
      console.log('Salvando edições do documento:', documento._id, formData);
      
      // Preparar dados para atualização
      const updateData: any = {};
      
      // Apenas incluir campos que têm valores (categoria e tipo omitidos por enquanto)
      if (formData.titulo?.trim()) updateData.titulo = formData.titulo.trim();
      if (formData.descricao?.trim()) updateData.descricao = formData.descricao.trim();
      if (formData.tipoMovimento) updateData.tipoMovimento = formData.tipoMovimento;
      if (formData.remetente?.trim()) updateData.remetente = formData.remetente.trim();
      if (formData.destinatario?.trim()) updateData.destinatario = formData.destinatario.trim();
      if (formData.responsavel?.trim()) updateData.responsavel = formData.responsavel.trim();
      if (formData.dataEnvio) updateData.dataEnvio = formData.dataEnvio + 'T00:00:00.000Z';
      if (formData.dataRecebimento) updateData.dataRecebimento = formData.dataRecebimento + 'T00:00:00.000Z';
      if (formData.status) updateData.ativo = formData.status === 'ativo';

      console.log('Dados preparados para atualização:', updateData);

      // Atualizar documento via serviço
      await DocumentosService.atualizar(documento._id, updateData);
      
      // Recarregar documentos do usuário
      if (user?._id) {
        buscarPorUsuario(user._id);
      }
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      throw error;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return '0 KB';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getMovementBadge = (tipoMovimento: string, record: any) => {
    const movementConfig: Record<string, { bg: string; text: string; label: string }> = {
      'recebido': { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', label: 'Recebido' },
      'enviado': { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', label: 'Enviado' },
      'interno': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', label: 'Interno' }
    };
    
    const config = movementConfig[tipoMovimento] || movementConfig.interno;
    
    let person = '';
    let personLabel = '';
    
    if (tipoMovimento === 'recebido' && record.remetente) {
      person = record.remetente;
      personLabel = 'De:';
    } else if (tipoMovimento === 'enviado' && record.destinatario) {
      person = record.destinatario;
      personLabel = 'Para:';
    } else if (tipoMovimento === 'interno' && record.responsavel) {
      person = record.responsavel;
      personLabel = 'Responsável:';
    }
    
    return (
      <div className="space-y-1">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
          {config.label}
        </span>
        {person && (
          <div className="text-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400">{personLabel}</div>
            <div className="text-gray-900 dark:text-gray-100 font-medium truncate">{person}</div>
          </div>
        )}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      'ativo': { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', label: 'Ativo' },
      'arquivado': { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300', label: 'Arquivado' },
      'rascunho': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', label: 'Rascunho' }
    };
    
    const config = statusConfig[status] || statusConfig.ativo;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const columns: TableColumn[] = [
    {
      key: 'titulo',
      title: 'Documento',
      sortable: true,
      ellipsis: true,
      maxWidth: '350px',
      render: (value, record: any) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{value}</div>
            {record.descricao && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{record.descricao}</div>
            )}
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center space-x-2 min-w-0">
              <span className="truncate">{record.arquivo?.originalName || 'Arquivo não encontrado'}</span>
              <span className="flex-shrink-0">•</span>
              <span className="flex-shrink-0">{formatFileSize(record.arquivo?.size || 0)}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'categoria',
      title: 'Categoria',
      width: 'w-32',
      render: (value: any) => (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: value?.cor || '#6B7280' }}></div>
          <span className="text-sm font-medium">{value?.nome || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'tipoMovimento',
      title: 'Tipo/Responsável',
      sortable: false,
      width: 'w-40',
      render: (value, record: any) => getMovementBadge(value, record),
    },
    {
      key: 'dataCriacao',
      title: 'Data de Criação',
      sortable: true,
      width: 'w-32',
      render: (value) => (
        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(value)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      width: 'w-24',
      render: (value) => getStatusBadge(value || 'ativo'),
    },
  ];

  const actions: TableAction[] = [
    {
      key: 'preview',
      label: 'Pré-visualizar',
      icon: <Eye className="w-4 h-4" />,
      onClick: handlePreview,
    },
    {
      key: 'download',
      label: 'Download',
      icon: <Download className="w-4 h-4" />,
      onClick: handleDownload,
      variant: 'success',
    },
    {
      key: 'view',
      label: 'Detalhes',
      icon: <FileText className="w-4 h-4" />,
      onClick: handleView,
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEdit,
    },
    {
      key: 'delete',
      label: 'Excluir',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'danger',
    },
  ];

  return (
    <UserLayout>
      <div>
        <PageHeader
          title="Meus Documentos"
          subtitle="Documentos que você criou e gerencia"
          onSearch={handleSearch}
          onFilter={() => console.log('Filtrar meus documentos')}
          searchPlaceholder="Pesquisar nos meus documentos..."
          addButtonText="Novo Documento"
          onAdd={() => window.location.href = '/user/upload'}
        />

        <DataTable
          data={documentos}
          columns={columns}
          actions={actions}
          loading={loading}
          emptyMessage={
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhum documento encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Você ainda não criou nenhum documento. Comece criando seu primeiro documento.
              </p>
              <Link
                href="/user/upload"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Documento
              </Link>
            </div>
          }
          onSort={(column, direction) => {
            console.log('Ordenar por:', column, direction);
          }}
        />

        {/* Modais */}
        {/* Preview do Documento */}
        {selectedDocumento && (
          <DocumentPreview
            isOpen={isPreviewOpen}
            onClose={() => {
              setIsPreviewOpen(false);
              setSelectedDocumento(null);
            }}
            documento={selectedDocumento}
            onDownload={() => handleDownload(selectedDocumento)}
          />
        )}

        {/* Detalhes do Documento */}
        <DocumentoViewModal
          documento={selectedDocumento}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDocumento(null);
          }}
          onEdit={handleEdit}
          onDownload={handleDownload}
        />

        {/* Edição do Documento */}
        <DocumentoEditModal
          documento={selectedDocumento}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDocumento(null);
          }}
          onSave={handleSaveEdit}
        />
      </div>
    </UserLayout>
  );
};

export default MeusDocumentosPage;
