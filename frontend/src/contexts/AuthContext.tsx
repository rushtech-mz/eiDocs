'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, UserRole } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isSuperAdmin: () => boolean;
  isOrgAdmin: () => boolean;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  canEdit: () => boolean;
  canManageUsers: () => boolean;
  canDeleteDocuments: () => boolean;
  canAccessAllDepartments: () => boolean;
  canAccessDepartment: (departmentId: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasMinimumRole: (minRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificar se o usuário está autenticado ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  // Sessão tornou-se inválida (access token e refresh token expirados/inválidos)
  // — limpar estado local e voltar ao login.
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      router.push('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [router]);

  const checkAuth = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, senha: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ username, senha });
      setUser(response.data.usuario);
      
      // Redirecionar baseado no role
      const dashboardPath = authService.getDashboardPath(response.data.usuario);
      router.push(dashboardPath);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Retornar o erro para que a página de login possa lidar com ele
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error: any) {
      // Mesmo que o pedido falhe (ex: token já expirado), continuar o logout local
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  // Métodos de verificação de permissões
  const isSuperAdmin = () => user ? authService.isSuperAdmin(user) : false;
  const isOrgAdmin = () => user ? authService.isOrgAdmin(user) : false;
  const isAdmin = () => user ? authService.isAdmin(user) : false;
  const isEditor = () => user ? authService.isEditor(user) : false;
  const canEdit = () => user ? authService.canEdit(user) : false;
  const canManageUsers = () => user ? authService.canManageUsers(user) : false;
  const canDeleteDocuments = () => user ? authService.canDeleteDocuments(user) : false;
  const canAccessAllDepartments = () => user ? authService.canAccessAllDepartments(user) : false;
  const canAccessDepartment = (departmentId: string) => user ? authService.canAccessDepartment(user, departmentId) : false;
  const hasRole = (role: UserRole) => user ? authService.hasRole(user, role) : false;
  const hasAnyRole = (roles: UserRole[]) => user ? authService.hasAnyRole(user, roles) : false;
  const hasMinimumRole = (minRole: UserRole) => user ? authService.hasMinimumRole(user, minRole) : false;

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isSuperAdmin,
    isOrgAdmin,
    isAdmin,
    isEditor,
    canEdit,
    canManageUsers,
    canDeleteDocuments,
    canAccessAllDepartments,
    canAccessDepartment,
    hasRole,
    hasAnyRole,
    hasMinimumRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
