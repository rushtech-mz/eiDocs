"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ManageLayout from '@/components/ui/ManageLayout';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import FilterPanel, { FilterField } from '@/components/ui/FilterPanel';
import CategoriaForm from '@/components/forms/CategoriaForm';
import CategoriaDetail from '@/components/details/CategoriaDetail';
import {
  FolderOpen, Edit, Trash2, Eye,
  FileText, Mail, BarChart3, Calculator, Receipt, FileCheck,
  Table2, Banknote, Scale, Tag, Folder, type LucideIcon,
} from 'lucide-react';

const ICONE_MAP: Record<string, LucideIcon> = {
  'file-contract':   FileText,
  'envelope':        Mail,
  'chart-bar':       BarChart3,
  'calculator':      Calculator,
  'receipt':         Receipt,
  'document-check':  FileCheck,
  'table':           Table2,
  'currency':        Banknote,
  'scale':           Scale,
  'tag':             Tag,
  'folder':          Folder,
};

function CategoriaIcone({ icone, cor }: { icone?: string; cor?: string }) {
  const Icon = icone ? (ICONE_MAP[icone] ?? FolderOpen) : null;
  const bg = cor ?? '#6b7280';
  if (!Icon) return (
    <div className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0"
      style={{ backgroundColor: bg }} />
  );
  return (
    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: bg }}>
      <Icon className="w-4 h-4 text-white" />
    </div>
  );
}
import { CategoriaDocumento } from '@/types';
import { useCategorias } from '@/hooks/useCategorias';
import { useDepartamentos } from '@/hooks/useDepartamentos';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { useAuth } from '@/hooks/useAuth';

const CategoriasPage = () => {
  const { user, isAdmin } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaDocumento | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  
  const {
    carregarPaginado,
    remover
  } = useCategorias();

  const { departamentos, carregar: carregarDepartamentos } = useDepartamentos();

  // Determinar filtro de departamento baseado no role
  const departmentId = user?.role === 'editor' && user?.departamento
    ? (typeof user.departamento === 'string' ? user.departamento : user.departamento._id)
    : undefined;

  // Memorizar a função fetchData para evitar re-renderizações
  const fetchData = useCallback(async (params: any) => {
    // Se for editor, adicionar filtro de departamento
    if (departmentId) {
      return carregarPaginado({
        ...params,
        departamento: departmentId
      });
    }
    
    // Admin vê todos
    return carregarPaginado(params);
  }, [departmentId, carregarPaginado]);

  // Hook de paginação com dados da API
  const {
    data: categorias,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    handleSort,
    paginationProps,
    refetch
  } = usePaginatedData({
    fetchData,
    initialItemsPerPage: 10
  });

  useEffect(() => {
    // O usePaginatedData já carrega os dados automaticamente
    if (isAdmin()) {
      carregarDepartamentos();
    }
  }, [isAdmin, carregarDepartamentos]);

  // Configuração dos filtros (apenas para Admin)
  const filterFields: FilterField[] = isAdmin() ? [
    {
      id: 'departamento',
      label: 'Departamento',
      type: 'select',
      placeholder: 'Todos os departamentos',
      options: departamentos.map(dept => ({
        id: dept._id,
        label: dept.nome,
        value: dept._id
      }))
    },
    {
      id: 'ativo',
      label: 'Status',
      type: 'select',
      placeholder: 'Todos',
      options: [
        { id: 'true', label: 'Ativos', value: 'true' },
        { id: 'false', label: 'Inativos', value: 'false' }
      ]
    }
  ] : [
    {
      id: 'ativo',
      label: 'Status',
      type: 'select',
      placeholder: 'Todos',
      options: [
        { id: 'true', label: 'Ativos', value: 'true' },
        { id: 'false', label: 'Inativos', value: 'false' }
      ]
    }
  ];

  const handleApplyFilters = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    // TODO: Implementar lógica de filtragem na API
    console.log('Filtros aplicados:', filters);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    refetch();
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  };

  const handleDelete = async (categoria: CategoriaDocumento) => {
    if (!confirm(`Deseja realmente excluir a categoria "${categoria.nome}"?`)) {
      return;
    }

    try {
      await remover(categoria._id);
      refetch(); // Recarregar lista
    } catch (err) {
      // Erro já tratado pelo hook
      console.error('Erro ao excluir categoria:', err);
    }
  };

  const handleAdd = () => {
    setSelectedCategoria(null);
    setIsFormOpen(true);
  };

  const handleEdit = (categoria: CategoriaDocumento) => {
    setSelectedCategoria(categoria);
    setIsFormOpen(true);
  };

  const handleView = (categoria: CategoriaDocumento) => {
    setSelectedCategoria(categoria);
    setIsDetailOpen(true);
  };

  const handleFormSuccess = () => {
    refetch(); // Recarregar lista após sucesso
    setIsFormOpen(false); // Fechar modal
    setSelectedCategoria(null); // Limpar seleção
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCategoria(null);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedCategoria(null);
  };

  const getColorDisplay = (cor?: string) => {
    if (!cor) return { bg: '#6b7280', text: '#fff' }; // gray por padrão
    return {
      bg: cor,
      text: '#fff' // texto branco para contraste
    };
  };

  const columns: TableColumn<CategoriaDocumento>[] = [
    {
      key: 'codigo',
      title: 'Código',
      sortable: true,
      width: 'w-24',
      render: (value) => (
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'nome',
      title: 'Nome',
      sortable: true,
      ellipsis: true,
      maxWidth: '350px',
      render: (value, record) => (
        <div className="flex items-center space-x-3">
          <CategoriaIcone icone={record.icone} cor={record.cor} />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">{value}</div>
            {record.descricao && (
              <div className="text-sm text-gray-500 dark:text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                {record.descricao}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'ativo',
      title: 'Status',
      sortable: true,
      width: 'w-20',
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            value
              ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
          }`}
        >
          {value ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'dataCriacao',
      title: 'Data de Criação',
      sortable: true,
      width: 'w-32',
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
  ];

  const actions: TableAction<CategoriaDocumento>[] = [
    {
      key: 'view',
      label: 'Visualizar',
      icon: <Eye className="w-4 h-4" />,
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
    <ManageLayout>
      <div>
        <PageHeader
          title="Categorias"
          subtitle="Gerencie as categorias de documentos"
          onAdd={handleAdd}
          onSearch={handleSearch}
          onFilter={() => setIsFilterOpen(true)}
          addButtonText="Nova Categoria"
          searchPlaceholder="Pesquisar categorias..."
        />

        <DataTable
          data={categorias}
          columns={columns}
          actions={actions}
          loading={loading}
          emptyMessage="Nenhuma categoria encontrada"
          onSort={handleSort}
          pagination={paginationProps}
        />

        {/* Painel de Filtros */}
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          fields={filterFields}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          initialValues={activeFilters}
        />

        {/* Formulário Modal */}
        <FormModal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          title={selectedCategoria ? 'Editar Categoria' : 'Nova Categoria'}
        >
          <CategoriaForm
            categoria={selectedCategoria}
            onSuccess={handleFormSuccess}
          />
        </FormModal>

        {/* Modal de Detalhes */}
        <CategoriaDetail
          isOpen={isDetailOpen}
          onClose={handleDetailClose}
          categoria={selectedCategoria}
        />
      </div>
    </ManageLayout>
  );
};

export default CategoriasPage;
