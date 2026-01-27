'use client';

import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  CreateUserRequest,
  UpdateUserPasswordRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  User,
  UsersFilters,
  UsersResponse,
} from '@/lib/api/types';

const USERS_QUERY_KEY = 'users';
const USERS_STATS_QUERY_KEY = 'usersStats';
const USER_QUERY_KEY = 'user';

const updateUsersCache = (previous: UsersResponse | undefined, user: User): UsersResponse | undefined => {
  if (!previous) {
    return previous;
  }

  return {
    ...previous,
    users: previous.users.map((item) => (item.id === user.id ? { ...item, ...user } : item)),
  };
};

const applyUserUpdate = (queryClient: QueryClient, user: User) => {
  queryClient.setQueryData([USER_QUERY_KEY, user.id], user);
  queryClient.setQueriesData<UsersResponse>({ queryKey: [USERS_QUERY_KEY] }, (previous) =>
    updateUsersCache(previous, user)
  );
};

export function useUsers(filters?: UsersFilters) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, filters],
    queryFn: () => apiClient.getUsers(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [USER_QUERY_KEY, id],
    queryFn: () => apiClient.getUser(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useUsersStats() {
  return useQuery({
    queryKey: [USERS_STATS_QUERY_KEY],
    queryFn: () => apiClient.getUsersStats(),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRoleRequest }) =>
      apiClient.updateUserRole(userId, data),
    onSuccess: (user) => {
      applyUserUpdate(queryClient, user);
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY], exact: false });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiClient.deactivateUser(userId),
    onSuccess: (user) => {
      applyUserUpdate(queryClient, user);
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY], exact: false });
    },
  });
}

export function useLogoutUserAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiClient.logoutUserAll(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY], exact: false });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => apiClient.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY], exact: false });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
      apiClient.updateUser(userId, data),
    onSuccess: (user) => {
      applyUserUpdate(queryClient, user);
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY], exact: false });
    },
  });
}

export function useUpdateUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserPasswordRequest }) =>
      apiClient.updateUserPassword(userId, data),
    onSuccess: (user) => {
      applyUserUpdate(queryClient, user);
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY], exact: false });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiClient.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY], exact: false });
    },
  });
}
