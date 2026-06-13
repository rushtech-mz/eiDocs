"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ManageLayout from '@/components/ui/ManageLayout';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import FilterPanel, { FilterField } from '@/components/ui/FilterPanel';
import DepartamentoForm from '@/components/forms/DepartamentoForm';
import DepartamentoDetail from '@/components/details/DepartamentoDetail';
import { Building2, Edit, Trash2, Eye } from 'lucide-react';
import { Departamento } from '@/types';
import { useDepartamentos } from '@/hooks/useDepartamentos';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { useAuth } from '@/hooks/useAuth';

const DepartamentosPage = () => {
  const router = useRouter();
  const { isAdmin, canAccessAllDepartments, loading: authLoading } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  
  // Verificar permissões - apenas admin pode gerenciar departamentos
  useEffect(() => {
    if (!authLoading && !isAdmin()) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);
  
  const {
    carregarPaginado,
    remover
  } = useDepartamentos();

  // Hook de paginação com dados da API
  const {
    data: departamentos,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    handleSort,
    paginationProps,
    refetch
  } = usePaginatedData({
    fetchData: carregarPaginado,
    initialItemsPerPage: 10
  });

  useEffect(() => {
    // O usePaginatedData já carrega os dados automaticamente
  }, []);

  // Configuração dos filtros
  const filterFields: FilterField[] = [
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

  const handleDelete = async (departamento: Departamento) => {
    if (!confirm(`Deseja realmente excluir o departamento "${departamento.nome}"?`)) {
      return;
    }

    try {
      await remover(departamento._id);
      refetch(); // Recarregar lista
    } catch (err) {
      // Erro já tratado pelo hook
      console.error('Erro ao excluir departamento:', err);
    }
  };

  const handleAdd = () => {
    setSelectedDepartamento(null);
    setIsFormOpen(true);
  };

  const handleEdit = (departamento: Departamento) => {
    setSelectedDepartamento(departamento);
    setIsFormOpen(true);
  };

  const handleView = (departamento: Departamento) => {
    setSelectedDepartamento(departamento);
    setIsDetailOpen(true);
  };

  const handleFormSuccess = () => {
    refetch(); // Recarregar lista após sucesso
    setIsFormOpen(false); // Fechar modal
    setSelectedDepartamento(null); // Limpar seleção
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedDepartamento(null);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedDepartamento(null);
  };

  const columns: TableColumn<Departamento>[] = [
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
          <div className="flex-shrink-0">
            <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
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

  const actions: TableAction<Departamento>[] = [
    {
      key: 'view',
      label: 'Visualizar',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleView,
    },
    // Apenas admin pode editar/deletar departamentos
    ...(isAdmin() ? [
      {
        key: 'edit' as const,
        label: 'Editar',
        icon: <Edit className="w-4 h-4" />,
        onClick: handleEdit,
      },
      {
        key: 'delete' as const,
        label: 'Excluir',
        icon: <Trash2 className="w-4 h-4" />,
        onClick: handleDelete,
        variant: 'danger' as const,
      },
    ] : [])
  ];

  return (
    <ManageLayout>
      <div>
        <PageHeader
          title="Departamentos"
          subtitle="Gerencie os departamentos da organização"
          onAdd={isAdmin() ? handleAdd : undefined} // Apenas admin pode adicionar
          onSearch={handleSearch}
          onFilter={() => setIsFilterOpen(true)}
          addButtonText="Novo Departamento"
          searchPlaceholder="Pesquisar departamentos..."
        />

        <DataTable
          data={departamentos}
          columns={columns}
          actions={actions}
          loading={loading}
          emptyMessage="Nenhum departamento encontrado"
          pagination={paginationProps}
          onSort={handleSort}
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
          title={selectedDepartamento ? 'Editar Departamento' : 'Novo Departamento'}
        >
          <DepartamentoForm
            departamento={selectedDepartamento}
            onSuccess={handleFormSuccess}
          />
        </FormModal>

        {/* Painel de Filtros */}
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          fields={filterFields}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          initialValues={activeFilters}
        />

        {/* Modal de Detalhes */}
        <DepartamentoDetail
          isOpen={isDetailOpen}
          onClose={handleDetailClose}
          departamento={selectedDepartamento}
        />
      </div>
    </ManageLayout>
  );
};

export default DepartamentosPage;
