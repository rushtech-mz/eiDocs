'use client';

import { useState, useEffect, useCallback } from 'react';
import SuperadminLayout from '@/components/layouts/SuperadminLayout';
import superadminService, { Tenant, CreateTenantPayload } from '@/services/superadminService';
import { useToastContext } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Power, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';

const PLAN_LABELS: Record<string, string> = {
  trial: 'Trial',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const PLAN_COLORS: Record<string, string> = {
  trial: 'bg-yellow-100 text-yellow-800',
  starter: 'bg-blue-100 text-blue-800',
  pro: 'bg-purple-100 text-purple-800',
  enterprise: 'bg-green-100 text-green-800',
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface CreateTenantModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateTenantModal({ onClose, onCreated }: CreateTenantModalProps) {
  const toast = useToastContext();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateTenantPayload>({
    nome: '',
    slug: '',
    plano: 'trial',
  });

  function handleNomeChange(nome: string) {
    setForm(f => ({
      ...f,
      nome,
      slug: f.slug || nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.slug) return;
    setLoading(true);
    try {
      await superadminService.createTenant(form);
      toast.success('Empresa criada com sucesso');
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar empresa');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Nova Empresa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              value={form.nome}
              onChange={e => handleNomeChange(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
              required
            />
            <p className="mt-1 text-xs text-gray-500">{form.slug}.eidocs.pt</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              value={form.plano}
              onChange={e => setForm(f => ({ ...f, plano: e.target.value as any }))}
            >
              <option value="trial">Trial (14 dias)</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              {loading ? 'A criar…' : 'Criar Empresa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SuperadminPage() {
  const toast = useToastContext();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAtivo, setFilterAtivo] = useState<'' | 'true' | 'false'>('');
  const [filterPlano, setFilterPlano] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const limit = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.q = search;
      if (filterAtivo !== '') params.ativo = filterAtivo === 'true';
      if (filterPlano) params.plano = filterPlano;

      const result = await superadminService.listTenants(params);
      setTenants(result.data);
      setTotal(result.total);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterAtivo, filterPlano]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(tenant: Tenant) {
    setTogglingId(tenant._id);
    try {
      const result = await superadminService.toggleTenantStatus(tenant._id);
      setTenants(ts => ts.map(t => t._id === tenant._id ? { ...t, ativo: result.ativo } : t));
      toast.success(`Empresa ${result.ativo ? 'ativada' : 'desativada'}`);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar estado');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(tenant: Tenant) {
    const confirmed = window.confirm(
      `Eliminar "${tenant.nome}"?\n\nEsta ação irá apagar TODOS os documentos, utilizadores, departamentos e ficheiros desta empresa. O registo da empresa será mantido para histórico.\n\nEsta acção é irreversível.`
    );
    if (!confirmed) return;

    setDeletingId(tenant._id);
    try {
      await superadminService.deleteTenant(tenant._id);
      toast.success(`Empresa "${tenant.nome}" eliminada`);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao eliminar empresa');
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <SuperadminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
            <p className="text-sm text-gray-500 mt-1">{total} empresa{total !== 1 ? 's' : ''} registada{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-64 focus:border-indigo-500 focus:outline-none"
            placeholder="Pesquisar por nome ou slug…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            value={filterAtivo}
            onChange={e => { setFilterAtivo(e.target.value as any); setPage(1); }}
          >
            <option value="">Todos os estados</option>
            <option value="true">Ativas</option>
            <option value="false">Inativas</option>
          </select>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            value={filterPlano}
            onChange={e => { setFilterPlano(e.target.value); setPage(1); }}
          >
            <option value="">Todos os planos</option>
            <option value="trial">Trial</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizadores</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documentos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial expira</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">A carregar…</td>
                </tr>
              )}
              {!loading && tenants.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">Nenhuma empresa encontrada.</td>
                </tr>
              )}
              {!loading && tenants.map(tenant => (
                <tr key={tenant._id} className={`hover:bg-gray-50 ${tenant.deleted ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{tenant.nome}</span>
                      <span className="text-xs text-gray-500 font-mono">{tenant.slug}.eidocs.pt</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_COLORS[tenant.plano] ?? 'bg-gray-100 text-gray-800'}`}>
                      {PLAN_LABELS[tenant.plano] ?? tenant.plano}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {tenant.uso.utilizadores} / {tenant.limites.maxUtilizadores}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {tenant.uso.documentos} / {tenant.limites.maxDocumentos}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {formatBytes(tenant.uso.armazenamentoBytes)} / {tenant.limites.maxArmazenamentoGB} GB
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {tenant.plano === 'trial' ? formatDate(tenant.trialExpiraEm) : '—'}
                  </td>
                  <td className="px-4 py-4">
                    {tenant.deleted ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Eliminada</span>
                    ) : (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tenant.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {tenant.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {!tenant.deleted && (
                      <div className="flex justify-end gap-2">
                        <button
                          title={tenant.ativo ? 'Desativar' : 'Ativar'}
                          disabled={togglingId === tenant._id}
                          onClick={() => handleToggle(tenant)}
                          className={`rounded p-1.5 transition-colors ${tenant.ativo ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'} disabled:opacity-40`}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          title="Eliminar empresa"
                          disabled={deletingId === tenant._id}
                          onClick={() => handleDelete(tenant)}
                          className="rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {page} de {totalPages} ({total} resultados)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTenantModal onClose={() => setShowCreateModal(false)} onCreated={load} />
      )}
    </SuperadminLayout>
  );
}
