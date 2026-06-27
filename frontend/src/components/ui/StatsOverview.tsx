'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Building2, 
  Users, 
  FolderOpen, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/formatters';
import { useGlobalStats } from '@/hooks/useStats';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'text-green-600 bg-green-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-xs ml-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const StatCardSkeleton: React.FC = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
    </CardContent>
  </Card>
);

interface StatsOverviewProps {
  showRefresh?: boolean;
  onRefresh?: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  showRefresh = false, 
  onRefresh 
}) => {
  const { data: stats, loading, error, refetch } = useGlobalStats();

  const handleRefresh = () => {
    refetch();
    if (onRefresh) {
      onRefresh();
    }
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Erro ao carregar estatísticas: {error}</span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Tentar Novamente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showRefresh && (
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Resumo Geral</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Total de Documentos"
              value={formatNumber(stats.resumo.totalDocumentos)}
              description={`${stats.resumo.documentosAtivos} ativos, ${stats.resumo.documentosArquivados} arquivados`}
              icon={<FileText className="w-4 h-4" />}
              color="blue"
            />
            
            <StatCard
              title="Departamentos"
              value={stats.resumo.totalDepartamentos}
              description="Departamentos ativos"
              icon={<Building2 className="w-4 h-4" />}
              color="green"
            />
            
            <StatCard
              title="Usuários"
              value={stats.resumo.totalUsuarios}
              description="Usuários cadastrados"
              icon={<Users className="w-4 h-4" />}
              color="purple"
            />
            
            <StatCard
              title="Categorias"
              value={stats.resumo.totalCategorias}
              description={`${stats.resumo.totalTipos} tipos de documentos`}
              icon={<FolderOpen className="w-4 h-4" />}
              color="yellow"
            />
          </>
        ) : null}
      </div>

      {/* Atividade Recente */}
      {stats && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
            <CardDescription>
              Documentos criados nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">
                {stats.tendencias.crescimentoSemanal}
              </span>
              <span className="text-sm text-muted-foreground">
                novos documentos
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Taxa de documentos ativos: {stats.tendencias.taxaAtivos}%
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatsOverview;
