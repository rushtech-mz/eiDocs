// Service de Tipos de Documentos - Implementação completa baseada no FRONTEND_REQUIREMENTS.md

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete
} from '@/lib/api';
import {
  TipoDocumento,
  ApiResponse,
  ApiPaginatedResponse,
  TipoQueryParams
} from '@/types';

export class TiposService {
  // Listar todos os tipos (com paginação e filtros)
  static async listar(params?: TipoQueryParams): Promise<ApiPaginatedResponse<TipoDocumento>> {
    return apiGet<ApiPaginatedResponse<TipoDocumento>>('/tipos', params as Record<string, string | number | boolean>);
  }

  // Listar tipos por departamento
  static async listarPorDepartamento(departamentoId: string, params?: TipoQueryParams): Promise<ApiPaginatedResponse<TipoDocumento>> {
    return apiGet<ApiPaginatedResponse<TipoDocumento>>(`/tipos/departamento/${departamentoId}`, params as Record<string, string | number | boolean>);
  }

  // Buscar tipo por ID
  static async buscarPorId(id: string): Promise<ApiResponse<TipoDocumento>> {
    return apiGet<ApiResponse<TipoDocumento>>(`/tipos/${id}`);
  }

  // Criar novo tipo
  static async criar(tipo: Omit<TipoDocumento, '_id' | 'dataCriacao' | 'dataAtualizacao'>): Promise<ApiResponse<TipoDocumento>> {
    return apiPost<ApiResponse<TipoDocumento>>('/tipos', tipo);
  }

  // Atualizar tipo existente
  static async atualizar(id: string, tipo: Partial<Omit<TipoDocumento, '_id' | 'dataCriacao' | 'dataAtualizacao'>>): Promise<ApiResponse<TipoDocumento>> {
    return apiPut<ApiResponse<TipoDocumento>>(`/tipos/${id}`, tipo);
  }

  // Remover tipo
  static async remover(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiDelete<ApiResponse<{ message: string }>>(`/tipos/${id}`);
  }

  // Buscar tipos por texto (busca em nome e código)
  static async buscarPorTexto(texto: string, ativo?: boolean): Promise<ApiPaginatedResponse<TipoDocumento>> {
    const params: TipoQueryParams = {
      q: texto,
      ativo,
      limit: 100
    };
    return this.listar(params);
  }

  // Listar apenas tipos ativos
  static async listarAtivos(): Promise<ApiPaginatedResponse<TipoDocumento>> {
    const params: TipoQueryParams = {
      ativo: true,
      limit: 100
    };
    return this.listar(params);
  }

  // Listar apenas tipos ativos de um departamento específico
  static async listarAtivosPorDepartamento(departamentoId: string): Promise<ApiPaginatedResponse<TipoDocumento>> {
    const params: TipoQueryParams = {
      ativo: true,
      limit: 100
    };
    return this.listarPorDepartamento(departamentoId, params);
  }

  // Verificar se código já existe
  static async verificarCodigoExistente(codigo: string, excluirId?: string): Promise<boolean> {
    try {
      const params: TipoQueryParams = {
        q: codigo,
        limit: 100
      };

      const response = await this.listar(params);

      // Se estamos editando, excluir o próprio registro da verificação
      if (excluirId) {
        return response.data.some(tipo => tipo._id !== excluirId && tipo.codigo === codigo);
      }

      return response.data.some(tipo => tipo.codigo === codigo);
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      return false;
    }
  }

  // Obter tipos para select/dropdown (admin - todos os tipos)
  static async obterParaSelect(): Promise<{ value: string; label: string }[]> {
    try {
      const response = await this.listarAtivos();
      return response.data.map(tipo => ({
        value: tipo._id,
        label: tipo.nome
      }));
    } catch (error) {
      console.error('Erro ao obter tipos para select:', error);
      return [];
    }
  }

  // Obter tipos para select/dropdown (editor/user - por departamento)
  static async obterParaSelectPorDepartamento(departamentoId: string): Promise<{ value: string; label: string }[]> {
    try {
      const response = await this.listarAtivosPorDepartamento(departamentoId);
      return response.data.map(tipo => ({
        value: tipo._id,
        label: tipo.nome
      }));
    } catch (error) {
      console.error('Erro ao obter tipos para select:', error);
      return [];
    }
  }
}
