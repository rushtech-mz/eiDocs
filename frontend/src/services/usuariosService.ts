// Service de Usuários - Implementação completa

import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete 
} from '@/lib/api';
import {
  ApiResponse,
  ApiPaginatedResponse,
  Usuario,
  UsuarioQueryParams,
  UserRole,
  CreateUsuario,
  UpdateUsuario
} from '@/types';

export class UsuariosService {
  // Listar todos os usuários (com paginação e filtros)
  static async listar(params?: UsuarioQueryParams): Promise<ApiPaginatedResponse<Usuario>> {
    return apiGet<ApiPaginatedResponse<Usuario>>('/usuarios', params as Record<string, string | number | boolean>);
  }

  // Buscar usuário por ID
  static async buscarPorId(id: string): Promise<ApiResponse<Usuario>> {
    return apiGet<ApiResponse<Usuario>>(`/usuarios/${id}`);
  }

  // Criar novo usuário
  static async criar(usuario: CreateUsuario): Promise<ApiResponse<Usuario>> {
    return apiPost<ApiResponse<Usuario>>('/usuarios', usuario);
  }

  // Atualizar usuário existente
  static async atualizar(id: string, usuario: UpdateUsuario): Promise<ApiResponse<Usuario>> {
    return apiPut<ApiResponse<Usuario>>(`/usuarios/${id}`, usuario);
  }

  // Remover usuário
  static async remover(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiDelete<ApiResponse<{ message: string }>>(`/usuarios/${id}`);
  }

  // Buscar usuários por texto (busca em nome, apelido e username)
  static async buscarPorTexto(texto: string, filtros?: Partial<UsuarioQueryParams>): Promise<ApiPaginatedResponse<Usuario>> {
    const params: UsuarioQueryParams = {
      q: texto,
      limit: 100,
      ...filtros
    };
    return this.listar(params);
  }

  // Buscar usuários por departamento
  static async buscarPorDepartamento(departamentoId: string, params?: UsuarioQueryParams): Promise<ApiPaginatedResponse<Usuario>> {
    return this.listar({
      ...params,
      departamento: departamentoId
    });
  }

  // Buscar usuários por role
  static async buscarPorRole(role: string, params?: UsuarioQueryParams): Promise<ApiPaginatedResponse<Usuario>> {
    return this.listar({
      ...params,
      role: role as UserRole
    });
  }

  // Verificar se username já existe
  static async verificarUsernameExistente(username: string): Promise<boolean> {
    try {
      const response = await this.buscarPorTexto(username);
      return response.data.some(usuario => usuario.username === username);
    } catch (error) {
      console.error('Erro ao verificar username:', error);
      return false;
    }
  }

  // Listar apenas usuários ativos
  static async listarAtivos(): Promise<ApiResponse<Usuario[]>> {
    const response = await this.listar({ ativo: true, limit: 100 });
    return {
      success: response.success,
      data: response.data
    };
  }

  // Obter usuários para seleção (id + nome completo)
  static async obterParaSelect(): Promise<{ value: string; label: string }[]> {
    try {
      const response = await this.listarAtivos();
      return response.data.map(usuario => ({
        value: usuario._id,
        label: `${usuario.nome} ${usuario.apelido}`
      }));
    } catch (error) {
      console.error('Erro ao obter usuários para seleção:', error);
      return [];
    }
  }

  // Obter estatísticas de usuários
  static async obterEstatisticas(): Promise<{
    total: number;
    ativos: number;
    inativos: number;
    porRole: Record<string, number>;
  }> {
    try {
      const response = await this.listar({ limit: 100 });
      const usuarios = response.data;
      
      const ativos = usuarios.filter(u => u.ativo).length;
      const inativos = usuarios.length - ativos;

      const porRole: Record<string, number> = {};
      usuarios.forEach(usuario => {
        porRole[usuario.role] = (porRole[usuario.role] || 0) + 1;
      });

      return {
        total: usuarios.length,
        ativos,
        inativos,
        porRole
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de usuários:', error);
      return {
        total: 0,
        ativos: 0,
        inativos: 0,
        porRole: {}
      };
    }
  }
}
