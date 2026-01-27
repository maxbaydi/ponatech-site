'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, MoreHorizontal, Pencil, Plus, Search, Shield, Trash2, UserCheck, UserX } from 'lucide-react';
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
import {
  useDeactivateUser,
  useDeleteUser,
  useLogoutUserAll,
  useUpdateUser,
  useUpdateUserRole,
  useUsers,
} from '@/lib/hooks/use-users';
import type { UserRole } from '@/lib/api/types';
import { ROLE_BADGES, ROLES } from './users.constants';
const USERS_PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 500;
const DATE_LOCALE = 'ru-RU';
const DATE_OPTIONS: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
const SKELETON_ROWS = 5;
const SEARCH_PLACEHOLDER = 'Поиск по email, имени, телефону или компании...';
const ADD_USER_LABEL = 'Добавить пользователя';
const EDIT_USER_LABEL = 'Редактировать';
const DELETE_USER_LABEL = 'Удалить';
const ACTIVATE_USER_LABEL = 'Активировать';
const CONFIRM_ACTIVATE_MESSAGE = 'Активировать пользователя? Он сможет войти в систему.';
const CONFIRM_DELETE_MESSAGE = 'Удалить пользователя? Действие необратимо.';

export default function UsersPage() {
  const { isAdmin, user: currentUser } = useAuth();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useUsers({
    search: searchQuery || undefined,
    page,
    limit: USERS_PAGE_LIMIT,
  });
  const updateRole = useUpdateUserRole();
  const updateUser = useUpdateUser();
  const deactivate = useDeactivateUser();
  const deleteUser = useDeleteUser();
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
    }, SEARCH_DEBOUNCE_MS);
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

  const handleActivate = async (userId: string) => {
    if (confirm(CONFIRM_ACTIVATE_MESSAGE)) {
      await updateUser.mutateAsync({ userId, data: { isActive: true } });
    }
  };

  const handleLogoutAll = async (userId: string) => {
    if (confirm('Завершить все сессии пользователя?')) {
      await logoutAll.mutateAsync(userId);
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm(CONFIRM_DELETE_MESSAGE)) {
      await deleteUser.mutateAsync(userId);
    }
  };

  if (!isAdmin) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(DATE_LOCALE, DATE_OPTIONS);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Пользователи</h1>
          <p className="text-muted-foreground">Управление пользователями системы</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            {ADD_USER_LABEL}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={SEARCH_PLACEHOLDER}
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
              {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              <p>Ошибка загрузки пользователей</p>
            </div>
          ) : data && data.users.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Пользователь</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead className="hidden sm:table-cell">Статус</TableHead>
                      <TableHead className="hidden md:table-cell">Дата регистрации</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.map((user) => {
                      const roleBadge = ROLE_BADGES[user.role];
                      const isCurrentUser = user.id === currentUser?.id;
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="pl-4">
                            <div className="flex flex-col gap-1 text-sm sm:text-base">
                              <div className="font-medium flex flex-col sm:flex-row sm:items-center sm:gap-1">
                                {user.name && <span>{user.name}</span>}
                                {user.name && user.company && (
                                  <span className="hidden sm:inline text-muted-foreground/60">•</span>
                                )}
                                {user.company && <span>{user.company}</span>}
                                {!user.name && !user.company && <span className="break-all">{user.email}</span>}
                                {isCurrentUser && (
                                  <span className="ml-1 text-xs text-muted-foreground">(вы)</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:gap-1">
                                {(user.name || user.company) && <span className="break-all">{user.email}</span>}
                                {(user.name || user.company) && user.phone && (
                                  <span className="hidden sm:inline text-muted-foreground/60">•</span>
                                )}
                                {user.phone && <span>{user.phone}</span>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={roleBadge.variant} className="text-xs sm:text-sm">{roleBadge.label}</Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
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
                          <TableCell className="text-muted-foreground hidden md:table-cell">
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
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${user.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {EDIT_USER_LABEL}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
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
                                {user.isActive ? (
                                  <DropdownMenuItem
                                    onClick={() => handleDeactivate(user.id)}
                                    className="text-destructive"
                                  >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Деактивировать
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleActivate(user.id)}>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    {ACTIVATE_USER_LABEL}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(user.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {DELETE_USER_LABEL}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {data.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t">
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
