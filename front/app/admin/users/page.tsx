'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MoreHorizontal, UserX, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth/auth-context';
import { useUsers, useUpdateUserRole, useDeactivateUser, useLogoutUserAll } from '@/lib/hooks/use-users';
import type { UserRole } from '@/lib/api/types';

const ROLE_BADGES: Record<UserRole, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  SUPER_ADMIN: { label: 'Супер-админ', variant: 'destructive' },
  ADMIN: { label: 'Администратор', variant: 'default' },
  MANAGER: { label: 'Менеджер', variant: 'secondary' },
  CUSTOMER: { label: 'Покупатель', variant: 'outline' },
};

const ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER'];

export default function UsersPage() {
  const { isAdmin, user: currentUser } = useAuth();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useUsers({ search: searchQuery || undefined, page, limit: 20 });
  const updateRole = useUpdateUserRole();
  const deactivate = useDeactivateUser();
  const logoutAll = useLogoutUserAll();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAdmin, router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    if (confirm(`Изменить роль пользователя на "${ROLE_BADGES[role].label}"?`)) {
      await updateRole.mutateAsync({ userId, data: { role } });
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (confirm('Деактивировать пользователя? Он не сможет войти в систему.')) {
      await deactivate.mutateAsync(userId);
    }
  };

  const handleLogoutAll = async (userId: string) => {
    if (confirm('Завершить все сессии пользователя?')) {
      await logoutAll.mutateAsync(userId);
    }
  };

  if (!isAdmin) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <p className="text-muted-foreground">Управление пользователями системы</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              <p>Ошибка загрузки пользователей</p>
            </div>
          ) : data && data.users.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users.map((user) => {
                    const roleBadge = ROLE_BADGES[user.role];
                    const isCurrentUser = user.id === currentUser?.id;
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">
                            {user.email}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-muted-foreground">(вы)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Активен
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              Неактивен
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isCurrentUser}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Изменить роль
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {ROLES.map((role) => (
                                    <DropdownMenuItem
                                      key={role}
                                      onClick={() => handleRoleChange(user.id, role)}
                                      disabled={user.role === role}
                                    >
                                      {ROLE_BADGES[role].label}
                                      {user.role === role && ' ✓'}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleLogoutAll(user.id)}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Завершить все сессии
                              </DropdownMenuItem>
                              {user.isActive && (
                                <DropdownMenuItem
                                  onClick={() => handleDeactivate(user.id)}
                                  className="text-destructive"
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Деактивировать
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Страница {data.page} из {data.totalPages} (всего {data.total})
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Назад
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page >= data.totalPages}
                    >
                      Вперёд
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>Пользователи не найдены</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
