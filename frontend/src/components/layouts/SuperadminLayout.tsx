'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface SuperadminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    title: 'Empresas',
    href: '/dashboard/superadmin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9" />
      </svg>
    ),
  },
];

export default function SuperadminLayout({ children }: SuperadminLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="eiDocs Logo" className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <h1 className="text-base font-bold text-white leading-tight">eiDocs</h1>
              <p className="text-xs text-gray-400">Rush Tech Admin</p>
            </div>
          </div>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="ml-64">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <span className="text-lg font-semibold text-gray-900">Superadmin — Gestão de Empresas</span>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.nome || user?.username}</span>
            <Button variant="outline" size="sm" onClick={logout} className="text-red-600 hover:text-red-700">
              Sair
            </Button>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
