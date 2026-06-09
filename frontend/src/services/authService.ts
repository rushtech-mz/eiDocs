import { apiPost, apiGet } from '@/lib/api';

export type UserRole = 'superadmin' | 'org_admin' | 'admin' | 'editor' | 'user';

export interface User {
  _id: string;
  username: string;
  nome: string;
  apelido: string;
  tenantId?: string;
  departamento: {
    _id: string;
    nome: string;
    codigo: string;
  } | null;
  role: UserRole;
  ativo: boolean;
}

export interface LoginRequest {
  username: string;
  senha: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    usuario: User;
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiPost<AuthResponse>('/auth/login', credentials);
  }

  async logout(): Promise<void> {
    await apiPost('/auth/logout', {});
  }

  async refreshToken(): Promise<void> {
    await apiPost('/auth/refresh', {});
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiGet<{ success: boolean; data: User }>('/auth/me');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiPost('/auth/change-password', {
      senhaAtual: currentPassword,
      novaSenha: newPassword
    });
  }

  async forgotPassword(username: string, tenantSlug: string): Promise<void> {
    await apiPost('/auth/forgot-password', { username, tenantSlug });
  }

  async resetPassword(token: string, novaSenha: string): Promise<void> {
    await apiPost('/auth/reset-password', { token, novaSenha });
  }

  async getTenantInfo(slug: string): Promise<{ id: string; nome: string; slug: string; plano: string } | null> {
    try {
      const response = await apiGet<{ success: boolean; data: { id: string; nome: string; slug: string; plano: string } }>(`/tenant/info?slug=${encodeURIComponent(slug)}`);
      return response.data;
    } catch {
      return null;
    }
  }

  private readonly ROLE_HIERARCHY: Record<UserRole, number> = {
    superadmin: 5,
    org_admin: 4,
    admin: 3,
    editor: 2,
    user: 1,
  };

  isSuperAdmin(user: User): boolean {
    return user.role === 'superadmin';
  }

  isOrgAdmin(user: User): boolean {
    return user.role === 'org_admin' || user.role === 'admin';
  }

  isAdmin(user: User): boolean {
    return this.isOrgAdmin(user) || this.isSuperAdmin(user);
  }

  isEditor(user: User): boolean {
    return user.role === 'editor';
  }

  isUser(user: User): boolean {
    return user.role === 'user';
  }

  canEdit(user: User): boolean {
    return this.ROLE_HIERARCHY[user.role] >= this.ROLE_HIERARCHY['editor'];
  }

  canManageUsers(user: User): boolean {
    return this.isAdmin(user);
  }

  canDeleteDocuments(user: User): boolean {
    return this.ROLE_HIERARCHY[user.role] >= this.ROLE_HIERARCHY['editor'];
  }

  canAccessAllDepartments(user: User): boolean {
    return this.isAdmin(user);
  }

  canAccessDepartment(user: User, departmentId: string): boolean {
    if (this.isAdmin(user)) return true;
    return user.departamento?._id === departmentId;
  }

  hasRole(user: User, role: UserRole): boolean {
    return user.role === role;
  }

  hasAnyRole(user: User, roles: UserRole[]): boolean {
    return roles.includes(user.role);
  }

  hasMinimumRole(user: User, minRole: UserRole): boolean {
    return this.ROLE_HIERARCHY[user.role] >= this.ROLE_HIERARCHY[minRole];
  }

  getDashboardPath(user: User): string {
    if (this.isSuperAdmin(user)) return '/dashboard/superadmin';
    if (this.isOrgAdmin(user)) return '/dashboard/admin';
    return '/dashboard/user';
  }
}

export const authService = new AuthService();
