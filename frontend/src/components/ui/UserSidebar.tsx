'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  FileText,
  Building2,
  Home,
  Menu,
  X,
  LogOut,
  Settings,
  Search
} from 'lucide-react';

interface UserSidebarProps {
  className?: string;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Apenas itens de visualização para usuários
  const userMenuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      href: '/dashboard/user',
      description: 'Visão geral'
    },
    {
      title: 'Documentos do Departamento',
      icon: Building2,
      href: '/user/documentos',
      description: 'Ver documentos do seu departamento'
    },
    {
      title: 'Buscar Documentos',
      icon: Search,
      href: '/user/buscar',
      description: 'Pesquisar documentos disponíveis'
    },
    // {
    //   title: 'Configurações',
    //   icon: Settings,
    //   href: '/user/configuracoes',
    //   description: 'Suas configurações pessoais'
    // }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard/user') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`
      ${isCollapsed ? 'w-16' : 'w-64'} 
      h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
      transition-all duration-300 ease-in-out
      flex flex-col
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2">
            <img
              src="/logo.jpg"
              alt="eiDocs Logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">eiDocuments</span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <img
              src="/logo.jpg"
              alt="eiDocs Logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {isCollapsed ? <Menu className="w-5 h-5 dark:text-gray-300" /> : <X className="w-5 h-5 dark:text-gray-300" />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {userMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center space-x-3 p-3 rounded-lg transition-colors
                ${active
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && (
                <>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{item.description}</div>
                  </div>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {/* User Info */}
        {!isCollapsed && user && (
          <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg mb-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user.nome?.charAt(0) || user.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.nome || user.username}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.departamento?.nome || 'Usuário'}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;
