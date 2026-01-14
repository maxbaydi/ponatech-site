(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/front/lib/api/errors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "isApiError",
    ()=>isApiError,
    "toApiError",
    ()=>toApiError
]);
class ApiError extends Error {
    status;
    endpoint;
    fieldErrors;
    payload;
    constructor(opts){
        super(opts.message);
        this.name = 'ApiError';
        this.status = opts.status;
        this.endpoint = opts.endpoint;
        this.fieldErrors = opts.fieldErrors;
        this.payload = opts.payload;
    }
}
const isApiError = (error)=>error instanceof ApiError;
const toApiError = (opts)=>{
    const { status, endpoint, payload } = opts;
    const parsed = parseNestHttpErrorBody(payload);
    const rawMessages = normalizeNestMessages(parsed?.message);
    const fieldErrors = deriveFieldErrors(rawMessages);
    const message = humanizeMessage({
        status,
        endpoint,
        rawMessages
    });
    return new ApiError({
        status,
        endpoint,
        message,
        fieldErrors,
        payload
    });
};
const parseNestHttpErrorBody = (payload)=>{
    if (!payload || typeof payload !== 'object') return undefined;
    const obj = payload;
    if (!('message' in obj) && !('error' in obj) && !('statusCode' in obj)) return undefined;
    return obj;
};
const normalizeNestMessages = (message)=>{
    if (!message) return [];
    if (Array.isArray(message)) return message.filter((m)=>typeof m === 'string');
    return [
        message
    ];
};
const deriveFieldErrors = (messages)=>{
    const errors = {};
    for (const msg of messages){
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
    }
    return Object.keys(errors).length > 0 ? errors : undefined;
};
const humanizeMessage = (opts)=>{
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
    const joined = rawMessages.map((m)=>m.trim()).filter((m)=>m.length > 0).join(' ');
    if (joined) return joined;
    if (status >= 500) {
        return 'Ошибка сервера. Попробуйте позже.';
    }
    return 'Не удалось выполнить запрос. Попробуйте ещё раз.';
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/front/lib/api/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiClient",
    ()=>apiClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/front/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$api$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front/lib/api/errors.ts [app-client] (ecmascript)");
;
;
const ENV_KEYS = {
    api: 'NEXT_PUBLIC_API_URL',
    catalog: 'NEXT_PUBLIC_CATALOG_API_URL',
    auth: 'NEXT_PUBLIC_AUTH_API_URL'
};
const NEXT_PUBLIC_API_URL = ("TURBOPACK compile-time value", "http://localhost:5000");
const NEXT_PUBLIC_CATALOG_API_URL = ("TURBOPACK compile-time value", "http://localhost:5000");
const NEXT_PUBLIC_AUTH_API_URL = ("TURBOPACK compile-time value", "http://localhost:4000");
const getRequiredEnv = (value, key)=>{
    if (!value) {
        throw new Error(`Missing ${ENV_KEYS[key]}`);
    }
    return value;
};
const DEFAULT_CATALOG_API_URL = NEXT_PUBLIC_CATALOG_API_URL || NEXT_PUBLIC_API_URL;
const DEFAULT_AUTH_API_URL = NEXT_PUBLIC_AUTH_API_URL;
const CATALOG_API_URL = getRequiredEnv(DEFAULT_CATALOG_API_URL, 'catalog');
_c = CATALOG_API_URL;
const AUTH_API_URL = getRequiredEnv(DEFAULT_AUTH_API_URL, 'auth');
_c1 = AUTH_API_URL;
const ACCESS_TOKEN_KEY = 'pona_access_token';
const REFRESH_TOKEN_KEY = 'pona_refresh_token';
class ApiClient {
    catalogBaseUrl;
    authBaseUrl;
    constructor(opts){
        this.catalogBaseUrl = opts.catalogBaseUrl;
        this.authBaseUrl = opts.authBaseUrl;
    }
    getAccessToken() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(ACCESS_TOKEN_KEY);
    }
    getRefreshToken() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(REFRESH_TOKEN_KEY);
    }
    setTokens(accessToken, refreshToken) {
        __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].set(ACCESS_TOKEN_KEY, accessToken, {
            expires: 1
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].set(REFRESH_TOKEN_KEY, refreshToken, {
            expires: 7
        });
    }
    clearTokens() {
        __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove(ACCESS_TOKEN_KEY);
        __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove(REFRESH_TOKEN_KEY);
    }
    async request(endpoint, options = {}) {
        const baseUrl = endpoint.startsWith('/auth/') ? this.authBaseUrl : this.catalogBaseUrl;
        const url = `${baseUrl}${endpoint}`;
        const accessToken = this.getAccessToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
        let response;
        try {
            response = await fetch(url, {
                ...options,
                headers
            });
        } catch (error) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$api$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"]({
                status: 0,
                endpoint,
                message: 'Сервис недоступен. Проверьте, что бэкенд запущен и адрес API указан верно.',
                payload: error
            });
        }
        if (response.status === 401) {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
                return this.request(endpoint, options);
            }
            this.clearTokens();
            throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$api$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toApiError"])({
                status: 401,
                endpoint,
                payload: await safeParseResponseBody(response)
            });
        }
        if (!response.ok) {
            const payload = await safeParseResponseBody(response);
            throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$api$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toApiError"])({
                status: response.status,
                endpoint,
                payload
            });
        }
        if (response.status === 204) {
            return undefined;
        }
        const payload = await safeParseResponseBody(response);
        return payload;
    }
    async refreshAccessToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return false;
        try {
            const response = await fetch(`${this.authBaseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken
                })
            });
            if (!response.ok) return false;
            const data = await safeParseResponseBody(response);
            if (!data?.accessToken || !data?.refreshToken) return false;
            this.setTokens(data.accessToken, data.refreshToken);
            return true;
        } catch  {
            return false;
        }
    }
    async login(data) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        this.setTokens(response.accessToken, response.refreshToken);
        return response;
    }
    async register(data) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        this.setTokens(response.accessToken, response.refreshToken);
        return response;
    }
    async logout() {
        try {
            await this.request('/auth/logout', {
                method: 'POST'
            });
        } finally{
            this.clearTokens();
        }
    }
    async getCurrentUser() {
        return this.request('/auth/me');
    }
    async getProducts(filters) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value])=>{
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, String(value));
                }
            });
        }
        const query = params.toString();
        return this.request(`/products${query ? `?${query}` : ''}`);
    }
    async getProduct(id) {
        return this.request(`/products/${id}`);
    }
    async getProductBySlug(slug) {
        return this.request(`/products/slug/${slug}`);
    }
    async createProduct(data) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async updateProduct(id, data) {
        return this.request(`/products/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }
    async getBrands() {
        return this.request('/brands');
    }
    async getBrand(id) {
        return this.request(`/brands/${id}`);
    }
    async createBrand(data) {
        return this.request('/brands', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async updateBrand(id, data) {
        return this.request(`/brands/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
    async deleteBrand(id) {
        return this.request(`/brands/${id}`, {
            method: 'DELETE'
        });
    }
    async getCategories() {
        return this.request('/categories');
    }
    async getCategory(id) {
        return this.request(`/categories/${id}`);
    }
    async createCategory(data) {
        return this.request('/categories', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async updateCategory(id, data) {
        return this.request(`/categories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
    async deleteCategory(id) {
        return this.request(`/categories/${id}`, {
            method: 'DELETE'
        });
    }
    async getUsers(filters) {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', String(filters.page));
        if (filters?.limit) params.append('limit', String(filters.limit));
        if (filters?.search) params.append('search', filters.search);
        const query = params.toString();
        return this.request(`/auth/admin/users${query ? `?${query}` : ''}`);
    }
    async updateUserRole(userId, data) {
        return this.request(`/auth/admin/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
    async deactivateUser(userId) {
        return this.request(`/auth/admin/users/${userId}/deactivate`, {
            method: 'POST'
        });
    }
    async logoutUserAll(userId) {
        return this.request(`/auth/admin/users/${userId}/logout-all`, {
            method: 'POST'
        });
    }
    isAuthenticated() {
        return !!this.getAccessToken();
    }
}
const safeParseResponseBody = async (response)=>{
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json().catch(()=>undefined);
    }
    return response.text().catch(()=>undefined);
};
const apiClient = new ApiClient({
    catalogBaseUrl: CATALOG_API_URL,
    authBaseUrl: AUTH_API_URL
});
var _c, _c1;
__turbopack_context__.k.register(_c, "CATALOG_API_URL");
__turbopack_context__.k.register(_c1, "AUTH_API_URL");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/front/lib/auth/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front/lib/api/client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const ROLE_HIERARCHY = {
    CUSTOMER: 0,
    MANAGER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3
};
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const fetchUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[fetchUser]": async ()=>{
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].isAuthenticated()) {
                setIsLoading(false);
                return;
            }
            try {
                const currentUser = await __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].getCurrentUser();
                setUser(currentUser);
            } catch  {
                __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].clearTokens();
                setUser(null);
            } finally{
                setIsLoading(false);
            }
        }
    }["AuthProvider.useCallback[fetchUser]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            fetchUser();
        }
    }["AuthProvider.useEffect"], [
        fetchUser
    ]);
    const login = async (data)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].login(data);
        setUser(response.user);
    };
    const register = async (data)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].register(data);
        setUser(response.user);
    };
    const logout = async ()=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].logout();
        setUser(null);
    };
    const hasRole = (roles)=>{
        if (!user) return false;
        const rolesArray = Array.isArray(roles) ? roles : [
            roles
        ];
        return rolesArray.includes(user.role);
    };
    const hasMinRole = (minRole)=>{
        if (!user) return false;
        return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole];
    };
    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        hasRole,
        isManager: hasMinRole('MANAGER'),
        isAdmin: hasMinRole('ADMIN'),
        isSuperAdmin: hasMinRole('SUPER_ADMIN')
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/front/lib/auth/auth-context.tsx",
        lineNumber: 93,
        columnNumber: 10
    }, this);
}
_s(AuthProvider, "4gM6yAU9805uQ79dzTdvmVdXGBM=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/front/components/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$auth$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front/lib/auth/auth-context.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function Providers({ children }) {
    _s();
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Providers.useState": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                        retry: 1
                    }
                }
            })
    }["Providers.useState"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$front$2f$lib$2f$auth$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
            children: children
        }, void 0, false, {
            fileName: "[project]/front/components/providers.tsx",
            lineNumber: 27,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/front/components/providers.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_s(Providers, "qQA3572PjlNLDye1d4ScR80/vT8=");
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=front_dad44001._.js.map