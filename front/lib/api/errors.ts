export type ApiFieldErrors = Record<string, string>;

type NestHttpErrorBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly endpoint: string;
  readonly fieldErrors?: ApiFieldErrors;
  readonly payload?: unknown;

  constructor(opts: { status: number; endpoint: string; message: string; fieldErrors?: ApiFieldErrors; payload?: unknown }) {
    super(opts.message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.endpoint = opts.endpoint;
    this.fieldErrors = opts.fieldErrors;
    this.payload = opts.payload;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

export const toApiError = (opts: { status: number; endpoint: string; payload?: unknown }): ApiError => {
  const { status, endpoint, payload } = opts;
  const parsed = parseNestHttpErrorBody(payload);
  const rawMessages = normalizeNestMessages(parsed?.message);
  const fieldErrors = deriveFieldErrors(rawMessages);
  const message = humanizeMessage({ status, endpoint, rawMessages });
  return new ApiError({ status, endpoint, message, fieldErrors, payload });
};

const parseNestHttpErrorBody = (payload: unknown): NestHttpErrorBody | undefined => {
  if (!payload || typeof payload !== 'object') return undefined;
  const obj = payload as Partial<NestHttpErrorBody>;
  if (!('message' in obj) && !('error' in obj) && !('statusCode' in obj)) return undefined;
  return obj;
};

const normalizeNestMessages = (message?: string | string[]): string[] => {
  if (!message) return [];
  if (Array.isArray(message)) return message.filter((m): m is string => typeof m === 'string');
  return [message];
};

const deriveFieldErrors = (messages: string[]): ApiFieldErrors | undefined => {
  const errors: ApiFieldErrors = {};

  for (const msg of messages) {
    const lower = msg.toLowerCase();

    if (lower.includes('email')) {
      errors.email = 'Введите корректный email';
      continue;
    }

    if (lower.includes('password')) {
      if (lower.includes('longer') || lower.includes('min')) {
        errors.password = 'Пароль должен содержать минимум 8 символов';
      } else {
        errors.password = 'Некорректный пароль';
      }
      continue;
    }

    if (lower.startsWith('name ')) {
      errors.name = 'Введите ваше имя';
      continue;
    }

    if (lower.startsWith('phone ')) {
      errors.phone = 'Введите корректный номер телефона';
      continue;
    }

    if (lower.startsWith('description ') || lower.includes('description')) {
      errors.description = 'Опишите ваш запрос (минимум 10 символов)';
      continue;
    }
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
};

const humanizeMessage = (opts: { status: number; endpoint: string; rawMessages: string[] }): string => {
  const { status, endpoint, rawMessages } = opts;

  if (status === 0) {
    return 'Сервис недоступен. Проверьте, что бэкенд запущен и адрес API указан верно.';
  }

  if (status === 404) {
    if (endpoint.startsWith('/auth/')) {
      return 'Сервис авторизации недоступен или эндпоинт не найден. Проверьте настройки адреса auth API.';
    }
    return 'Эндпоинт не найден. Проверьте настройки адреса API.';
  }

  if (endpoint === '/auth/register') {
    if (status === 409) {
      return 'Пользователь с таким email уже зарегистрирован.';
    }
    if (status === 400) {
      return 'Проверьте корректность email и пароля.';
    }
  }

  if (endpoint === '/auth/login') {
    if (status === 401) {
      return 'Неверный email или пароль.';
    }
    if (status === 400) {
      return 'Проверьте корректность email и пароля.';
    }
  }

  if (status === 401) {
    return 'Требуется авторизация. Войдите в аккаунт заново.';
  }

  const joined = rawMessages.map((m) => m.trim()).filter((m) => m.length > 0).join(' ');
  if (joined) return joined;

  if (status >= 500) {
    return 'Ошибка сервера. Попробуйте позже.';
  }

  return 'Не удалось выполнить запрос. Попробуйте ещё раз.';
};
