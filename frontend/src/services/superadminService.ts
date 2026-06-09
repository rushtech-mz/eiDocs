import { apiGet, apiPost, apiPut, apiPatch, apiDelete, ApiPaginatedResponse, ApiResponse } from '@/lib/api';

export interface Tenant {
  _id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  deleted: boolean;
  deletedAt?: string;
  plano: 'trial' | 'starter' | 'pro' | 'enterprise';
  trialExpiraEm?: string;
  limites: {
    maxUtilizadores: number;
    maxArmazenamentoGB: number;
    maxDocumentos: number;
  };
  uso: {
    utilizadores: number;
    armazenamentoBytes: number;
    documentos: number;
  };
  dataCriacao: string;
}

export interface TenantStats {
  tenant: {
    _id: string;
    nome: string;
    slug: string;
    plano: string;
    ativo: boolean;
    trialExpiraEm?: string;
  };
  uso: {
    utilizadores: number;
    documentos: number;
    departamentos: number;
    armazenamentoBytes: number;
    armazenamentoGB: number;
  };
  limites: {
    maxUtilizadores: number;
    maxArmazenamentoGB: number;
    maxDocumentos: number;
  };
  percentagens: {
    utilizadores: number;
    documentos: number;
    armazenamento: number;
  };
}

export interface CreateTenantPayload {
  nome: string;
  slug: string;
  plano?: 'trial' | 'starter' | 'pro' | 'enterprise';
  trialExpiraEm?: string;
  limites?: {
    maxUtilizadores?: number;
    maxArmazenamentoGB?: number;
    maxDocumentos?: number;
  };
}

const superadminService = {
  async listTenants(params?: {
    page?: number;
    limit?: number;
    q?: string;
    ativo?: boolean;
    plano?: string;
  }): Promise<ApiPaginatedResponse<Tenant>> {
    return apiGet<ApiPaginatedResponse<Tenant>>('/admin/tenants', params as any);
  },

  async getTenant(id: string): Promise<Tenant> {
    const response = await apiGet<ApiResponse<Tenant>>(`/admin/tenants/${id}`);
    return response.data;
  },

  async getTenantStats(id: string): Promise<TenantStats> {
    const response = await apiGet<ApiResponse<TenantStats>>(`/admin/tenants/${id}/stats`);
    return response.data;
  },

  async createTenant(data: CreateTenantPayload): Promise<Tenant> {
    const response = await apiPost<ApiResponse<Tenant>>('/admin/tenants', data);
    return response.data;
  },

  async updateTenant(id: string, data: Partial<CreateTenantPayload>): Promise<Tenant> {
    const response = await apiPut<ApiResponse<Tenant>>(`/admin/tenants/${id}`, data);
    return response.data;
  },

  async toggleTenantStatus(id: string): Promise<{ _id: string; slug: string; ativo: boolean }> {
    const response = await apiPatch<ApiResponse<{ _id: string; slug: string; ativo: boolean }>>(
      `/admin/tenants/${id}/ativo`,
      {}
    );
    return response.data;
  },

  async deleteTenant(id: string): Promise<void> {
    await apiDelete(`/admin/tenants/${id}`);
  },

  getExportUrl(id: string): string {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return `${base}/admin/tenants/${id}/export`;
  },
};

export default superadminService;
