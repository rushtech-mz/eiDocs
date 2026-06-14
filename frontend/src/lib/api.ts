// Configuração base da API

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

// Tipos base para respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages?: number; // Opcional para compatibilidade
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: any;
}

// Endpoints de autenticação que nunca devem disparar uma tentativa de refresh
// (evita loops: o próprio /auth/refresh, login e logout)
const AUTH_ENDPOINTS_WITHOUT_REFRESH = ['/auth/login', '/auth/refresh', '/auth/logout'];

// Promise partilhada para evitar múltiplos refreshes simultâneos quando
// vários pedidos falham com 401 ao mesmo tempo.
let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Extrai o slug do tenant a partir do hostname do browser (espelha
// `extractSubdomainSlug` no backend). Usado pelo backend como guard extra de
// consistência tenant-vs-subdomínio em `resolveTenant`.
function getTenantSlugFromHostname(): string | null {
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname.toLowerCase();
  const parts = host.split('.');

  // Desenvolvimento: <slug>.localhost
  if (host.endsWith('.localhost') && parts.length >= 2) {
    return parts[0];
  }

  // Domínio raiz (ex: dominio.exemplo) ou localhost simples → sem subdomínio de tenant
  if (parts.length <= 2) return null;

  const slug = parts[0];
  return /^[a-z0-9-]+$/.test(slug) ? slug : null;
}

// Função base para requisições
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Criar AbortController para timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const tenantSlug = getTenantSlugFromHostname();

  const config: RequestInit = {
    credentials: 'include', // Incluir cookies em todas as requisições
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(tenantSlug ? { 'X-Tenant-Slug': tenantSlug } : {}),
      ...options.headers,
    },
    signal: controller.signal,
  };

  // Se o body é FormData, não definir Content-Type (deixar o browser definir)
  if (options.body instanceof FormData) {
    delete (config.headers as Record<string, string>)['Content-Type'];
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Access token expirado: tentar renovar via refresh token e repetir o pedido uma vez
    if (response.status === 401 && !isRetry && !AUTH_ENDPOINTS_WITHOUT_REFRESH.some((p) => endpoint.startsWith(p))) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiRequest<T>(endpoint, options, true);
      }

      // Refresh também falhou: sessão definitivamente inválida — avisar a app
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }

    if (!response.ok) {
      let errorData;
      try {
        // Tentar parsear JSON apenas se há conteúdo
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const responseText = await response.text();
          if (responseText) {
            errorData = JSON.parse(responseText);
          } else {
            errorData = {
              success: false,
              message: `HTTP ${response.status}: ${response.statusText}`
            };
          }
        } else {
          errorData = {
            success: false,
            message: `HTTP ${response.status}: ${response.statusText}`
          };
        }
      } catch (parseError) {
        errorData = {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      // Se a mensagem contém "Credenciais inválidas", mesmo com status 500, tratar como 401
      if (errorData.message && errorData.message.includes('Credenciais inválidas')) {
        throw new Error('Credenciais inválidas');
      }
      
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Se a resposta é 204 (No Content), retornar objeto vazio
    if (response.status === 204) {
      // console.log('Response 204 - No Content detected');
      return { success: true } as T;
    }

    // Verificar se há conteúdo para parsear
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // Se não há JSON, retornar sucesso genérico
    return { success: true } as T;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Se é um erro de timeout
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error('Tempo limite da requisição esgotado. Verifique sua conexão e tente novamente.');
    }
    
    // Se é um erro de rede
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Erro de conexão: Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
    }
    
    // Se é um erro de abort
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Requisição cancelada.');
    }
    
    // Se já é um erro customizado, repassar
    if (error instanceof Error) {
      throw error;
    }
    
    // Para outros tipos de erro
    throw new Error('Ocorreu um erro inesperado na comunicação com o servidor.');
  }
}

// Funções específicas para cada método HTTP
export async function apiGet<T>(
  endpoint: string, 
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const searchParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }
  
  const queryString = searchParams.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  return apiRequest<T>(url, {
    method: 'GET',
  });
}

export async function apiPost<T>(
  endpoint: string, 
  data: any
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
}

export async function apiPut<T>(
  endpoint: string, 
  data: any
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
}

export async function apiDelete<T>(
  endpoint: string
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
  });
}

export async function apiPatch<T>(
  endpoint: string, 
  data: any
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
}