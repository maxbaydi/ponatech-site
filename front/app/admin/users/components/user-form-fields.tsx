'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { UserRole } from '@/lib/api/types';
import { ROLE_BADGES, ROLE_OPTIONS } from '../users.constants';

const EMAIL_LABEL = 'Email *';
const ROLE_LABEL = 'Роль *';
const NAME_LABEL = 'Имя';
const PHONE_LABEL = 'Телефон';
const COMPANY_LABEL = 'Компания';
const ACTIVE_LABEL = 'Активен';
const EMAIL_PLACEHOLDER = 'user@example.com';
const ROLE_PLACEHOLDER = 'Выберите роль';
const NAME_PLACEHOLDER = 'Иван Иванов';
const PHONE_PLACEHOLDER = '+7...';
const COMPANY_PLACEHOLDER = 'ООО Пример';
const EMPTY_SELECT_VALUE = '';

export type UserBaseFields = {
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  company?: string;
  isActive: boolean;
};

type UserFormFieldsProps = {
  form: UseFormReturn<UserBaseFields>;
};

export function UserFormFields({ form }: UserFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{EMAIL_LABEL}</FormLabel>
              <FormControl>
                <Input placeholder={EMAIL_PLACEHOLDER} type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => {
            const roleValue = field.value ?? EMPTY_SELECT_VALUE;
            const roleLabel = field.value ? ROLE_BADGES[field.value].label : ROLE_PLACEHOLDER;

            return (
            <FormItem>
              <FormLabel>{ROLE_LABEL}</FormLabel>
              <Select key={roleValue} onValueChange={field.onChange} defaultValue={roleValue}>
                <FormControl>
                  <SelectTrigger>
                    <span className={field.value ? undefined : 'text-muted-foreground'}>{roleLabel}</span>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
            );
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{NAME_LABEL}</FormLabel>
              <FormControl>
                <Input placeholder={NAME_PLACEHOLDER} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{PHONE_LABEL}</FormLabel>
              <FormControl>
                <Input placeholder={PHONE_PLACEHOLDER} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="company"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{COMPANY_LABEL}</FormLabel>
            <FormControl>
              <Input placeholder={COMPANY_PLACEHOLDER} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} />
            </FormControl>
            <FormLabel>{ACTIVE_LABEL}</FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
