'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/providers/AuthProvider';
import { useChildren } from '@/hooks/use-children';
import type { ChildWithRelation, ChildFilters, RelationshipType } from '@/types';
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon,
  MoreVerticalIcon,
  EditIcon,
  EyeIcon,
  UserPlusIcon,
  CalendarIcon,
  HeartIcon,
  TrendingUpIcon,
  UsersIcon,
  BookOpenIcon,
  RefreshCwIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ================================================================
// COMPONENTES AUXILIARES
// ================================================================

interface ChildCardProps {
  child: ChildWithRelation;
  onEdit: (child: ChildWithRelation) => void;
  onViewDetails: (child: ChildWithRelation) => void;
  onManageUsers: (child: ChildWithRelation) => void;
}

function ChildCard({ child, onEdit, onViewDetails, onManageUsers }: Readonly<ChildCardProps>) {
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getRelationshipColor = (type: RelationshipType) => {
    switch (type) {
      case 'parent': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'specialist': return 'bg-purple-100 text-purple-800';
      case 'observer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationshipLabel = (type: RelationshipType) => {
    switch (type) {
      case 'parent': return 'Padre/Madre';
      case 'teacher': return 'Docente';
      case 'specialist': return 'Especialista';
      case 'observer': return 'Observador';
      case 'family': return 'Familia';
      default: return type;
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={child.avatar_url ?? undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {child.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{child.name}</h3>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className={getRelationshipColor(child.relationship_type)}
                >
                  {getRelationshipLabel(child.relationship_type)}
                </Badge>
                {child.can_edit && (
                  <Badge variant="outline" className="text-xs">
                    Editor
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(child)}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              {child.can_edit && (
                <DropdownMenuItem onClick={() => onEdit(child)}>
                  <EditIcon className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {child.can_invite_others && (
                <DropdownMenuItem onClick={() => onManageUsers(child)}>
                  <UserPlusIcon className="mr-2 h-4 w-4" />
                  Gestionar usuarios
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información básica */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {child.birth_date && (
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {calculateAge(child.birth_date)} años
              </span>
            </div>
          )}
          
          {child.diagnosis && (
            <div className="flex items-center space-x-2">
              <HeartIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 truncate" title={child.diagnosis}>
                {child.diagnosis}
              </span>
            </div>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Registros</p>
            <p className="text-xs text-gray-500">Este mes</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Última actividad</p>
            <p className="text-xs text-gray-500">
              {child.updated_at ? format(new Date(child.updated_at), 'dd MMM', { locale: es }) : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FiltersCardProps {
  filters: ChildFilters;
  onFiltersChange: (filters: ChildFilters) => void;
}

function FiltersCard({ filters, onFiltersChange }: FiltersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <FilterIcon className="h-4 w-4 mr-2" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por nombre */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nombre del niño..."
                value={filters.search ?? ''}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Relación */}
          <Select 
            value={filters.relationship_type ?? 'all'} 
            onValueChange={(value) => onFiltersChange({ 
              ...filters, 
              relationship_type: value === 'all' ? undefined : value as RelationshipType 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de relación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las relaciones</SelectItem>
              <SelectItem value="parent">Padre/Madre</SelectItem>
              <SelectItem value="teacher">Docente</SelectItem>
              <SelectItem value="specialist">Especialista</SelectItem>
              <SelectItem value="observer">Observador</SelectItem>
              <SelectItem value="family">Familia</SelectItem>
            </SelectContent>
          </Select>

          {/* Rango de edad */}
          <div className="space-y-2">
            <label htmlFor="max-age-input" className="text-sm font-medium">Edad máxima</label>
            <Input
              id="max-age-input"
              type="number"
              placeholder="Años"
              min="0"
              max="25"
              value={filters.max_age ?? ''}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                max_age: e.target.value ? parseInt(e.target.value) : undefined 
              })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================

// Estadísticas rápidas extraídas
function ChildrenStats({ children }: { children: ChildWithRelation[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Niños</p>
              <p className="text-2xl font-bold">{children.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold">
                {children.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <EditIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Editables</p>
              <p className="text-2xl font-bold">
                {children.filter(c => c.can_edit).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUpIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Con Diagnóstico</p>
              <p className="text-2xl font-bold">
                {children.filter(c => c.diagnosis).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeletons extraídos
function ChildrenLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

// Error y vacío extraídos
/**
 * Displays an error or empty state for the children list in the dashboard.
 *
 * - If an error is present, shows an error message with a retry button.
 * - If there are no children (`childrenCount === 0`), prompts the user to add the first child.
 * - If there are children but none match the current filters, suggests clearing filters.
 *
 * @param error Optional error message to display if loading children fails.
 * @param childrenCount The number of children currently available.
 * @param onRetry Callback invoked when the user clicks the retry button after an error.
 * @param onClearFilters Callback invoked when the user clicks the button to clear filters.
 */
function ChildrenErrorOrEmpty({
  error,
  childrenCount,
  onRetry,
  onClearFilters,
}: Readonly<{
  error?: string;
  childrenCount: number;
  onRetry: () => void;
  onClearFilters: () => void;
}>) {
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="text-center py-12">
          <p className="text-red-600 mb-4">Error al cargar los niños: {error}</p>
          <Button variant="outline" onClick={onRetry}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="text-center py-12">
        <UsersIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        {childrenCount === 0 ? (
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay niños registrados
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando el primer niño para empezar el seguimiento
            </p>
            <Button asChild>
              <Link href="/dashboard/children/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                Agregar Primer Niño
              </Link>
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron niños
            </h3>
            <p className="text-gray-600 mb-6">
              No hay niños que coincidan con los filtros seleccionados
            </p>
            <Button 
              variant="outline"
              onClick={onClearFilters}
            >
              Limpiar Filtros
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Toggle de vista extraído
function ChildrenViewToggle({
  viewMode,
  setViewMode,
}: {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}) {
  return (
    <div className="flex justify-end">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Vista:</span>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          Tarjetas
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
        >
          Lista
        </Button>
      </div>
    </div>
  );
}

export default function ChildrenPage() {
  const { user } = useAuth();
  const { children, loading, error, filterChildren } = useChildren({ 
    includeInactive: false,
    realtime: true 
  });
  
  const [filters, setFilters] = useState<ChildFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredChildren = useMemo(() => filterChildren(filters), [children, filters, filterChildren]);

  const handleEdit = (child: ChildWithRelation) => {
    window.location.href = `/dashboard/children/${child.id}/edit`;
  };

  const handleViewDetails = (child: ChildWithRelation) => {
    window.location.href = `/dashboard/children/${child.id}`;
  };

  const handleManageUsers = (child: ChildWithRelation) => {
    window.location.href = `/dashboard/children/${child.id}/users`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de crear niño */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Niños</h1>
          <p className="text-gray-600">
            Gestiona y visualiza el progreso de los niños bajo tu cuidado
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button asChild>
            <Link href="/dashboard/children/new">
              <PlusIcon className="h-4 w-4 mr-2" />
              Crear Niño
            </Link>
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <ChildrenStats children={children} />

      {/* Filtros */}
      <FiltersCard filters={filters} onFiltersChange={setFilters} />

      {/* Lista/Grid de niños */}
      {loading ? (
        <ChildrenLoadingSkeleton />
      ) : error ?? filteredChildren.length === 0 ? (
        <ChildrenErrorOrEmpty
          error={error ?? undefined}
          childrenCount={children.length}
          onRetry={() => window.location.reload()}
          onClearFilters={() => setFilters({})}
        />
      ) : (
        <>
          <ChildrenViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChildren.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onEdit={handleEdit}
                onViewDetails={handleViewDetails}
                onManageUsers={handleManageUsers}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}