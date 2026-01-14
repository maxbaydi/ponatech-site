/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("node:path");

/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(7), exports);
__exportStar(__webpack_require__(9), exports);
__exportStar(__webpack_require__(11), exports);
__exportStar(__webpack_require__(14), exports);
__exportStar(__webpack_require__(15), exports);
__exportStar(__webpack_require__(8), exports);


/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommonModule = void 0;
const common_1 = __webpack_require__(1);
const app_logger_service_1 = __webpack_require__(8);
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        providers: [app_logger_service_1.AppLogger],
        exports: [app_logger_service_1.AppLogger],
    })
], CommonModule);


/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppLogger = void 0;
const common_1 = __webpack_require__(1);
const request_context_1 = __webpack_require__(9);
let AppLogger = class AppLogger {
    log(message, ...optionalParams) {
        this.write('log', message, optionalParams);
    }
    error(message, ...optionalParams) {
        this.write('error', message, optionalParams);
    }
    warn(message, ...optionalParams) {
        this.write('warn', message, optionalParams);
    }
    debug(message, ...optionalParams) {
        this.write('debug', message, optionalParams);
    }
    verbose(message, ...optionalParams) {
        this.write('verbose', message, optionalParams);
    }
    write(level, message, optionalParams) {
        const context = request_context_1.RequestContextStorage.get();
        const payload = {
            timestamp: new Date().toISOString(),
            level,
            message: this.stringifyMessage(message),
            traceId: context?.traceId,
            userId: context?.userId,
            ...this.buildMeta(optionalParams),
        };
        const output = JSON.stringify(payload);
        if (level === 'error') {
            console.error(output);
            return;
        }
        console.log(output);
    }
    stringifyMessage(message) {
        if (typeof message === 'string') {
            return message;
        }
        if (message instanceof Error) {
            return message.message;
        }
        const serialized = JSON.stringify(message);
        return serialized ?? String(message);
    }
    buildMeta(optionalParams) {
        if (optionalParams.length === 0) {
            return {};
        }
        if (optionalParams.length === 1 && this.isRecord(optionalParams[0])) {
            return optionalParams[0];
        }
        return { params: optionalParams };
    }
    isRecord(value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
};
exports.AppLogger = AppLogger;
exports.AppLogger = AppLogger = __decorate([
    (0, common_1.Injectable)()
], AppLogger);


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequestContextStorage = void 0;
const node_async_hooks_1 = __webpack_require__(10);
class RequestContextStorage {
    static storage = new node_async_hooks_1.AsyncLocalStorage();
    static run(context, callback) {
        return this.storage.run(context, callback);
    }
    static get() {
        return this.storage.getStore();
    }
}
exports.RequestContextStorage = RequestContextStorage;


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("node:async_hooks");

/***/ }),
/* 11 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AllExceptionsFilter = void 0;
const common_1 = __webpack_require__(1);
const microservices_1 = __webpack_require__(4);
const grpc_js_1 = __webpack_require__(12);
const rxjs_1 = __webpack_require__(13);
const app_logger_service_1 = __webpack_require__(8);
const request_context_1 = __webpack_require__(9);
let AllExceptionsFilter = class AllExceptionsFilter {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const contextType = host.getType();
        if (contextType === 'rpc') {
            return this.handleRpc(exception);
        }
        this.handleHttp(exception, host);
    }
    handleHttp(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const traceId = request_context_1.RequestContextStorage.get()?.traceId;
        const statusCode = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof Error ? exception.message : 'Unexpected error';
        const payload = {
            statusCode,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            traceId,
        };
        this.logger.error('Unhandled HTTP exception', {
            statusCode,
            message,
            traceId,
        });
        response.status(statusCode).json(payload);
    }
    handleRpc(exception) {
        const traceId = request_context_1.RequestContextStorage.get()?.traceId;
        const message = exception instanceof Error ? exception.message : 'Unexpected error';
        const grpcStatus = this.mapGrpcStatus(exception);
        if (exception instanceof microservices_1.RpcException) {
            const normalized = this.normalizeRpcError(exception.getError());
            this.logger.error('RPC exception', {
                grpcStatus: normalized.code,
                message: normalized.message,
                traceId,
            });
            return (0, rxjs_1.throwError)(() => new microservices_1.RpcException({
                code: normalized.code,
                message: normalized.message,
                traceId,
            }));
        }
        this.logger.error('Unhandled RPC exception', {
            grpcStatus,
            message,
            traceId,
        });
        return (0, rxjs_1.throwError)(() => new microservices_1.RpcException({
            code: grpcStatus,
            message,
            traceId,
        }));
    }
    mapGrpcStatus(exception) {
        if (exception instanceof common_1.HttpException) {
            const code = exception.getStatus();
            switch (code) {
                case common_1.HttpStatus.BAD_REQUEST:
                    return grpc_js_1.status.INVALID_ARGUMENT;
                case common_1.HttpStatus.UNAUTHORIZED:
                    return grpc_js_1.status.UNAUTHENTICATED;
                case common_1.HttpStatus.FORBIDDEN:
                    return grpc_js_1.status.PERMISSION_DENIED;
                case common_1.HttpStatus.NOT_FOUND:
                    return grpc_js_1.status.NOT_FOUND;
                case common_1.HttpStatus.CONFLICT:
                    return grpc_js_1.status.ALREADY_EXISTS;
                default:
                    return grpc_js_1.status.INTERNAL;
            }
        }
        if (exception instanceof microservices_1.RpcException) {
            return grpc_js_1.status.INTERNAL;
        }
        return grpc_js_1.status.INTERNAL;
    }
    normalizeRpcError(error) {
        if (typeof error === 'string') {
            return { code: grpc_js_1.status.INTERNAL, message: error };
        }
        if (error && typeof error === 'object') {
            const record = error;
            const code = typeof record.code === 'number' ? record.code : grpc_js_1.status.INTERNAL;
            const message = typeof record.message === 'string' ? record.message : 'Unexpected error';
            return { code, message };
        }
        return { code: grpc_js_1.status.INTERNAL, message: 'Unexpected error' };
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [typeof (_a = typeof app_logger_service_1.AppLogger !== "undefined" && app_logger_service_1.AppLogger) === "function" ? _a : Object])
], AllExceptionsFilter);


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("@grpc/grpc-js");

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),
/* 14 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const common_1 = __webpack_require__(1);
const rxjs_1 = __webpack_require__(13);
const app_logger_service_1 = __webpack_require__(8);
let LoggingInterceptor = class LoggingInterceptor {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    intercept(context, next) {
        const startedAt = Date.now();
        const contextName = this.getContextName(context);
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                this.logger.log('Request completed', {
                    context: contextName,
                    durationMs: Date.now() - startedAt,
                });
            },
            error: (error) => {
                this.logger.error('Request failed', {
                    context: contextName,
                    durationMs: Date.now() - startedAt,
                    error: error instanceof Error ? error.message : error,
                });
            },
        }));
    }
    getContextName(context) {
        if (context.getType() === 'http') {
            const request = context.switchToHttp().getRequest();
            const method = request.method ?? 'UNKNOWN';
            const url = request.url ?? '';
            return `${method} ${url}`.trim();
        }
        const handler = context.getHandler();
        const className = context.getClass().name;
        return `${className}.${handler.name}`;
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof app_logger_service_1.AppLogger !== "undefined" && app_logger_service_1.AppLogger) === "function" ? _a : Object])
], LoggingInterceptor);


/***/ }),
/* 15 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequestContextInterceptor = void 0;
const node_crypto_1 = __webpack_require__(16);
const common_1 = __webpack_require__(1);
const request_context_1 = __webpack_require__(9);
let RequestContextInterceptor = class RequestContextInterceptor {
    intercept(context, next) {
        const traceId = this.getTraceId(context) ?? (0, node_crypto_1.randomUUID)();
        const userId = this.getUserId(context);
        return request_context_1.RequestContextStorage.run({ traceId, userId }, () => next.handle());
    }
    getTraceId(context) {
        if (context.getType() === 'http') {
            const request = context.switchToHttp().getRequest();
            return this.normalizeHeader(request.headers?.['x-trace-id']);
        }
        return undefined;
    }
    getUserId(context) {
        if (context.getType() === 'http') {
            const request = context.switchToHttp().getRequest();
            return request.user?.id;
        }
        return undefined;
    }
    normalizeHeader(value) {
        if (!value) {
            return undefined;
        }
        if (Array.isArray(value)) {
            return value[0];
        }
        return value;
    }
};
exports.RequestContextInterceptor = RequestContextInterceptor;
exports.RequestContextInterceptor = RequestContextInterceptor = __decorate([
    (0, common_1.Injectable)()
], RequestContextInterceptor);


/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AUTH_SERVICE_NAME = exports.AUTH_PROTO_PACKAGE = void 0;
exports.AUTH_PROTO_PACKAGE = 'auth';
exports.AUTH_SERVICE_NAME = 'AuthService';


/***/ }),
/* 18 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const common_2 = __webpack_require__(6);
const auth_module_1 = __webpack_require__(19);
const env_validation_1 = __webpack_require__(37);
const envFilePath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath,
                validationSchema: env_validation_1.authValidationSchema,
            }),
            common_2.CommonModule,
            auth_module_1.AuthModule,
        ],
    })
], AppModule);


/***/ }),
/* 19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const common_2 = __webpack_require__(6);
const prisma_module_1 = __webpack_require__(20);
const auth_controller_1 = __webpack_require__(23);
const admin_controller_1 = __webpack_require__(31);
const auth_service_1 = __webpack_require__(24);
const auth_repository_1 = __webpack_require__(25);
const jwt_auth_guard_1 = __webpack_require__(30);
const rate_limit_guard_1 = __webpack_require__(36);
const roles_guard_1 = __webpack_require__(35);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [common_2.CommonModule, prisma_module_1.PrismaModule],
        controllers: [auth_controller_1.AuthController, admin_controller_1.AuthAdminController, auth_controller_1.AuthGrpcController],
        providers: [
            auth_service_1.AuthService,
            auth_repository_1.AuthRepository,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            {
                provide: core_1.APP_GUARD,
                useClass: rate_limit_guard_1.RateLimitGuard,
            },
        ],
    })
], AuthModule);


/***/ }),
/* 20 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaModule = void 0;
const common_1 = __webpack_require__(1);
const prisma_service_1 = __webpack_require__(21);
let PrismaModule = class PrismaModule {
};
exports.PrismaModule = PrismaModule;
exports.PrismaModule = PrismaModule = __decorate([
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], PrismaModule);


/***/ }),
/* 21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(1);
const client_1 = __webpack_require__(22);
let PrismaService = class PrismaService extends client_1.PrismaClient {
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);


/***/ }),
/* 22 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 23 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthGrpcController = exports.AuthController = void 0;
const common_1 = __webpack_require__(1);
const microservices_1 = __webpack_require__(4);
const auth_service_1 = __webpack_require__(24);
const auth_dto_1 = __webpack_require__(27);
const validate_token_dto_1 = __webpack_require__(29);
const jwt_auth_guard_1 = __webpack_require__(30);
const auth_grpc_1 = __webpack_require__(17);
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async login(dto) {
        return this.authService.login(dto);
    }
    async refresh(dto) {
        return this.authService.refresh(dto);
    }
    async logout(dto) {
        await this.authService.logout(dto);
    }
    async me(request) {
        const userId = request.user?.userId;
        if (!userId) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const user = await this.authService.getProfile(userId);
        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof auth_dto_1.RegisterDto !== "undefined" && auth_dto_1.RegisterDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof auth_dto_1.LoginDto !== "undefined" && auth_dto_1.LoginDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof auth_dto_1.RefreshTokenDto !== "undefined" && auth_dto_1.RefreshTokenDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof auth_dto_1.RefreshTokenDto !== "undefined" && auth_dto_1.RefreshTokenDto) === "function" ? _h : Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);
let AuthGrpcController = class AuthGrpcController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async validateToken(request) {
        const user = await this.authService.validateToken(request.accessToken);
        if (!user) {
            return {
                isValid: false,
                userId: '',
                role: '',
            };
        }
        return {
            isValid: true,
            userId: user.userId,
            role: user.role,
        };
    }
};
exports.AuthGrpcController = AuthGrpcController;
__decorate([
    (0, microservices_1.GrpcMethod)(auth_grpc_1.AUTH_SERVICE_NAME, 'ValidateToken'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof validate_token_dto_1.ValidateTokenDto !== "undefined" && validate_token_dto_1.ValidateTokenDto) === "function" ? _m : Object]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], AuthGrpcController.prototype, "validateToken", null);
exports.AuthGrpcController = AuthGrpcController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_l = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _l : Object])
], AuthGrpcController);


/***/ }),
/* 24 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(1);
const auth_repository_1 = __webpack_require__(25);
const role_enum_1 = __webpack_require__(26);
let AuthService = class AuthService {
    authRepository;
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async register(dto) {
        const existing = await this.authRepository.findUserByEmail(dto.email);
        if (existing) {
            throw new common_1.ConflictException('User already exists');
        }
        let user;
        try {
            user = await this.authRepository.createUser(dto.email, dto.password, role_enum_1.Role.Customer);
        }
        catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new common_1.ConflictException('User already exists');
            }
            throw error;
        }
        return this.issueTokens(user);
    }
    async login(dto) {
        const user = await this.authRepository.findUserByEmail(dto.email);
        if (!user || !user.isActive || !this.authRepository.verifyPassword(dto.password, user.passwordHash)) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.issueTokens(user);
    }
    async refresh(dto) {
        const rotated = await this.authRepository.rotateRefreshToken(dto.refreshToken);
        if (!rotated) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        return this.issueTokens(rotated.user, rotated.refreshToken);
    }
    async logout(dto) {
        await this.authRepository.revokeRefreshToken(dto.refreshToken);
    }
    async validateToken(accessToken) {
        return this.authRepository.validateToken(accessToken);
    }
    async getProfile(userId) {
        const user = await this.authRepository.findUserById(userId);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async getAllUsers(options) {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 20;
        const { users, total } = await this.authRepository.findAllUsers({ page, limit, search: options?.search });
        return {
            users: users.map((u) => ({
                id: u.id,
                email: u.email,
                role: u.role,
                isActive: u.isActive,
                createdAt: u.createdAt,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async updateUserRole(userId, role) {
        const user = await this.executeUserUpdate(() => this.authRepository.updateUserRole(userId, role));
        return this.toAdminResponse(user);
    }
    async deactivateUser(userId) {
        const user = await this.executeUserUpdate(() => this.authRepository.deactivateUser(userId));
        return this.toAdminResponse(user);
    }
    async logoutAll(userId) {
        await this.executeUserUpdate(() => this.authRepository.logoutAll(userId));
    }
    async issueTokens(user, refreshToken) {
        const accessToken = this.authRepository.createAccessToken(user);
        const nextRefreshToken = refreshToken ?? (await this.authRepository.createRefreshToken(user.id));
        return {
            accessToken,
            refreshToken: nextRefreshToken,
            tokenType: 'Bearer',
            expiresIn: this.authRepository.getAccessTokenTtlSeconds(),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }
    async executeUserUpdate(action) {
        try {
            return await action();
        }
        catch (error) {
            if (isNotFoundError(error)) {
                throw new common_1.NotFoundException('User not found');
            }
            throw error;
        }
    }
    toAdminResponse(user) {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_repository_1.AuthRepository !== "undefined" && auth_repository_1.AuthRepository) === "function" ? _a : Object])
], AuthService);
const isUniqueConstraintError = (error) => {
    if (!error || typeof error !== 'object') {
        return false;
    }
    return 'code' in error && error.code === 'P2002';
};
const isNotFoundError = (error) => {
    if (!error || typeof error !== 'object') {
        return false;
    }
    return 'code' in error && error.code === 'P2025';
};


/***/ }),
/* 25 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthRepository = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const node_crypto_1 = __webpack_require__(16);
const prisma_service_1 = __webpack_require__(21);
const role_enum_1 = __webpack_require__(26);
const ACCESS_TOKEN_DEFAULT_TTL = 3600;
const REFRESH_TOKEN_DEFAULT_TTL = 60 * 60 * 24 * 30;
let AuthRepository = class AuthRepository {
    configService;
    prisma;
    jwtSecret;
    accessTokenTtlSeconds;
    refreshTokenTtlSeconds;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.jwtSecret = this.configService.getOrThrow('JWT_SECRET');
        this.accessTokenTtlSeconds = parseExpiresIn(this.configService.get('JWT_EXPIRES_IN'), ACCESS_TOKEN_DEFAULT_TTL);
        this.refreshTokenTtlSeconds = parseExpiresIn(this.configService.get('REFRESH_TOKEN_EXPIRES_IN'), REFRESH_TOKEN_DEFAULT_TTL);
    }
    getAccessTokenTtlSeconds() {
        return this.accessTokenTtlSeconds;
    }
    async createUser(email, password, role) {
        const normalizedEmail = normalizeEmail(email);
        return this.prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash: this.hashPassword(password),
                role: role,
            },
        });
    }
    async findUserByEmail(email) {
        return this.prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
    }
    async findUserById(userId) {
        return this.prisma.user.findUnique({ where: { id: userId } });
    }
    async findAllUsers(options) {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = options?.search
            ? { email: { contains: options.search, mode: 'insensitive' } }
            : {};
        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return { users, total };
    }
    verifyPassword(password, storedHash) {
        return this.verifyPasswordHash(password, storedHash);
    }
    createAccessToken(user) {
        return this.signJwt({
            sub: user.id,
            role: user.role,
            email: user.email,
            ver: user.tokenVersion,
        }, this.accessTokenTtlSeconds);
    }
    async createRefreshToken(userId) {
        const token = (0, node_crypto_1.randomBytes)(48).toString('base64url');
        const tokenHash = this.hashToken(token);
        const expiresAt = new Date(Date.now() + this.refreshTokenTtlSeconds * 1000);
        await this.prisma.refreshToken.create({
            data: {
                tokenHash,
                userId,
                expiresAt,
            },
        });
        return token;
    }
    async rotateRefreshToken(refreshToken) {
        if (!refreshToken || refreshToken.trim().length === 0) {
            return null;
        }
        const tokenHash = this.hashToken(refreshToken);
        return this.prisma.$transaction(async (tx) => {
            const record = await tx.refreshToken.findUnique({
                where: { tokenHash },
                include: { user: true },
            });
            if (!record || record.revokedAt || record.expiresAt.getTime() <= Date.now()) {
                return null;
            }
            if (!record.user.isActive) {
                return null;
            }
            const revoked = await tx.refreshToken.updateMany({
                where: { id: record.id, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            if (revoked.count === 0) {
                return null;
            }
            const nextToken = (0, node_crypto_1.randomBytes)(48).toString('base64url');
            const nextHash = this.hashToken(nextToken);
            const expiresAt = new Date(Date.now() + this.refreshTokenTtlSeconds * 1000);
            await tx.refreshToken.create({
                data: {
                    tokenHash: nextHash,
                    userId: record.userId,
                    expiresAt,
                },
            });
            return { user: record.user, refreshToken: nextToken };
        });
    }
    async revokeRefreshToken(refreshToken) {
        if (!refreshToken || refreshToken.trim().length === 0) {
            return false;
        }
        const tokenHash = this.hashToken(refreshToken);
        const result = await this.prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return result.count > 0;
    }
    async updateUserRole(userId, role) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    role: role,
                    tokenVersion: { increment: 1 },
                },
            });
            await tx.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            return user;
        });
    }
    async deactivateUser(userId) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    isActive: false,
                    tokenVersion: { increment: 1 },
                },
            });
            await tx.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            return user;
        });
    }
    async logoutAll(userId) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    tokenVersion: { increment: 1 },
                },
            });
            await tx.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            return user;
        });
    }
    async validateToken(token) {
        if (!token || token.trim().length === 0) {
            return null;
        }
        const payload = this.verifyJwt(token);
        if (!payload || !payload.sub || !payload.role) {
            return null;
        }
        if (!Object.values(role_enum_1.Role).includes(payload.role)) {
            return null;
        }
        const user = await this.findUserById(payload.sub);
        if (!user || !user.isActive) {
            return null;
        }
        if (user.role !== payload.role) {
            return null;
        }
        if (user.tokenVersion !== payload.ver) {
            return null;
        }
        return {
            userId: user.id,
            role: user.role,
        };
    }
    hashPassword(password) {
        const salt = (0, node_crypto_1.randomBytes)(16).toString('base64url');
        const hash = (0, node_crypto_1.scryptSync)(password, salt, 64).toString('base64url');
        return `${salt}:${hash}`;
    }
    verifyPasswordHash(password, storedHash) {
        const [salt, hash] = storedHash.split(':');
        if (!salt || !hash) {
            return false;
        }
        const derived = (0, node_crypto_1.scryptSync)(password, salt, 64).toString('base64url');
        return safeEqual(hash, derived);
    }
    hashToken(token) {
        return (0, node_crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    signJwt(payload, expiresInSeconds) {
        const header = {
            alg: 'HS256',
            typ: 'JWT',
        };
        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + expiresInSeconds;
        const fullPayload = { ...payload, iat, exp };
        const encodedHeader = base64UrlEncode(JSON.stringify(header));
        const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
        const signingInput = `${encodedHeader}.${encodedPayload}`;
        const signature = (0, node_crypto_1.createHmac)('sha256', this.jwtSecret)
            .update(signingInput)
            .digest('base64url');
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }
    verifyJwt(token) {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const [encodedHeader, encodedPayload, signature] = parts;
        const signingInput = `${encodedHeader}.${encodedPayload}`;
        const expectedSignature = (0, node_crypto_1.createHmac)('sha256', this.jwtSecret)
            .update(signingInput)
            .digest('base64url');
        if (!safeEqual(signature, expectedSignature)) {
            return null;
        }
        try {
            const header = JSON.parse(base64UrlDecode(encodedHeader));
            if (header.alg !== 'HS256') {
                return null;
            }
            const payload = JSON.parse(base64UrlDecode(encodedPayload));
            if (!payload?.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
                return null;
            }
            return payload;
        }
        catch {
            return null;
        }
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _b : Object])
], AuthRepository);
const normalizeEmail = (email) => email.trim().toLowerCase();
const base64UrlEncode = (input) => Buffer.from(input).toString('base64url');
const base64UrlDecode = (input) => Buffer.from(input, 'base64url').toString('utf8');
const safeEqual = (value, expected) => {
    const valueBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);
    if (valueBuffer.length !== expectedBuffer.length) {
        return false;
    }
    return (0, node_crypto_1.timingSafeEqual)(valueBuffer, expectedBuffer);
};
const parseExpiresIn = (value, fallbackSeconds) => {
    if (!value) {
        return fallbackSeconds;
    }
    const trimmed = value.trim();
    const match = /^(\d+)([smhd])?$/.exec(trimmed);
    if (!match) {
        return fallbackSeconds;
    }
    const amount = Number(match[1]);
    if (!Number.isFinite(amount) || amount <= 0) {
        return fallbackSeconds;
    }
    const unit = match[2] ?? 's';
    const multipliers = {
        s: 1,
        m: 60,
        h: 60 * 60,
        d: 60 * 60 * 24,
    };
    return amount * (multipliers[unit] ?? 1);
};


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Role = void 0;
var Role;
(function (Role) {
    Role["SuperAdmin"] = "SUPER_ADMIN";
    Role["Admin"] = "ADMIN";
    Role["Manager"] = "MANAGER";
    Role["Customer"] = "CUSTOMER";
})(Role || (exports.Role = Role = {}));


/***/ }),
/* 27 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshTokenDto = exports.LoginDto = exports.RegisterDto = void 0;
const class_validator_1 = __webpack_require__(28);
class RegisterDto {
    email;
    password;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);


/***/ }),
/* 28 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 29 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ValidateTokenDto = void 0;
const class_validator_1 = __webpack_require__(28);
class ValidateTokenDto {
    accessToken;
}
exports.ValidateTokenDto = ValidateTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateTokenDto.prototype, "accessToken", void 0);


/***/ }),
/* 30 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(24);
let JwtAuthGuard = class JwtAuthGuard {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing access token');
        }
        const token = authHeader.slice('Bearer '.length).trim();
        const user = await this.authService.validateToken(token);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid access token');
        }
        request.user = user;
        return true;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], JwtAuthGuard);


/***/ }),
/* 31 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthAdminController = void 0;
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(24);
const admin_dto_1 = __webpack_require__(32);
const jwt_auth_guard_1 = __webpack_require__(30);
const roles_decorator_1 = __webpack_require__(34);
const roles_guard_1 = __webpack_require__(35);
const role_enum_1 = __webpack_require__(26);
let AuthAdminController = class AuthAdminController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async getUsers(query) {
        return this.authService.getAllUsers({
            page: query.page,
            limit: query.limit,
            search: query.search,
        });
    }
    async updateRole(userId, dto) {
        return this.authService.updateUserRole(userId, dto.role);
    }
    async deactivate(userId) {
        return this.authService.deactivateUser(userId);
    }
    async logoutAll(userId) {
        await this.authService.logoutAll(userId);
        return { success: true };
    }
};
exports.AuthAdminController = AuthAdminController;
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof admin_dto_1.GetUsersQueryDto !== "undefined" && admin_dto_1.GetUsersQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AuthAdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof admin_dto_1.UpdateUserRoleDto !== "undefined" && admin_dto_1.UpdateUserRoleDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AuthAdminController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Post)('users/:id/deactivate'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AuthAdminController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)('users/:id/logout-all'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AuthAdminController.prototype, "logoutAll", null);
exports.AuthAdminController = AuthAdminController = __decorate([
    (0, common_1.Controller)('auth/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthAdminController);


/***/ }),
/* 32 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetUsersQueryDto = exports.UpdateUserRoleDto = void 0;
const class_validator_1 = __webpack_require__(28);
const class_transformer_1 = __webpack_require__(33);
const role_enum_1 = __webpack_require__(26);
class UpdateUserRoleDto {
    role;
}
exports.UpdateUserRoleDto = UpdateUserRoleDto;
__decorate([
    (0, class_validator_1.IsEnum)(role_enum_1.Role),
    __metadata("design:type", typeof (_a = typeof role_enum_1.Role !== "undefined" && role_enum_1.Role) === "function" ? _a : Object)
], UpdateUserRoleDto.prototype, "role", void 0);
class GetUsersQueryDto {
    page;
    limit;
    search;
}
exports.GetUsersQueryDto = GetUsersQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetUsersQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetUsersQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetUsersQueryDto.prototype, "search", void 0);


/***/ }),
/* 33 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(1);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


/***/ }),
/* 35 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const roles_decorator_1 = __webpack_require__(34);
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User role not found');
        }
        if (!requiredRoles.includes(user.role)) {
            throw new common_1.ForbiddenException('Forbidden');
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);


/***/ }),
/* 36 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RateLimitGuard_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RateLimitGuard = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
let RateLimitGuard = class RateLimitGuard {
    static { RateLimitGuard_1 = this; }
    configService;
    static hits = new Map();
    static reset() {
        RateLimitGuard_1.hits.clear();
    }
    static getSize() {
        return RateLimitGuard_1.hits.size;
    }
    constructor(configService) {
        this.configService = configService;
    }
    canActivate(context) {
        if (context.getType() !== 'http') {
            return true;
        }
        const max = this.parseNumber(process.env.RATE_LIMIT_MAX ?? this.configService.get('RATE_LIMIT_MAX'), 100);
        const windowMs = this.parseNumber(process.env.RATE_LIMIT_WINDOW_MS ?? this.configService.get('RATE_LIMIT_WINDOW_MS'), 60000);
        if (max <= 0 || windowMs <= 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const key = buildRateLimitKey(request);
        const now = Date.now();
        const entry = RateLimitGuard_1.hits.get(key);
        if (!entry || entry.resetAt <= now) {
            RateLimitGuard_1.hits.set(key, { count: 1, resetAt: now + windowMs });
            return true;
        }
        entry.count += 1;
        if (entry.count > max) {
            throw new common_1.HttpException('Too many requests', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
    parseNumber(value, fallback) {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
            return fallback;
        }
        return parsed;
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = RateLimitGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], RateLimitGuard);
const buildRateLimitKey = (request) => {
    const forwarded = request.headers['x-forwarded-for'];
    const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const rawIp = forwardedIp?.split(',')[0]?.trim() || request.ip || request.socket?.remoteAddress || 'unknown';
    const normalized = rawIp.replace('::ffff:', '');
    return normalized === '::1' ? '127.0.0.1' : normalized;
};


/***/ }),
/* 37 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.authValidationSchema = void 0;
const Joi = __importStar(__webpack_require__(38));
exports.authValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    DATABASE_URL: Joi.string().required(),
    AUTH_GRPC_PORT: Joi.number().port().required(),
    AUTH_HTTP_PORT: Joi.number().port().required(),
    JWT_SECRET: Joi.string().min(16).required(),
    JWT_EXPIRES_IN: Joi.string().default('3600s'),
    REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('30d'),
    CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
    RATE_LIMIT_MAX: Joi.number().integer().min(0).default(100),
    RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(0).default(60000),
    REDIS_URL: Joi.string().uri().optional(),
});


/***/ }),
/* 38 */
/***/ ((module) => {

module.exports = require("joi");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(4);
const node_path_1 = __webpack_require__(5);
const common_2 = __webpack_require__(6);
const auth_grpc_1 = __webpack_require__(17);
const app_module_1 = __webpack_require__(18);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    const configService = app.get(config_1.ConfigService);
    const logger = app.get(common_2.AppLogger);
    const corsOrigins = parseCorsOrigins(configService.get('CORS_ORIGINS'));
    app.useLogger(logger);
    app.enableCors({ origin: corsOrigins, credentials: true });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new common_2.AllExceptionsFilter(logger));
    app.useGlobalInterceptors(new common_2.RequestContextInterceptor(), new common_2.LoggingInterceptor(logger));
    app.enableShutdownHooks();
    const grpcPort = configService.getOrThrow('AUTH_GRPC_PORT');
    const httpPort = configService.getOrThrow('AUTH_HTTP_PORT');
    app.connectMicroservice({
        transport: microservices_1.Transport.GRPC,
        options: {
            url: `0.0.0.0:${grpcPort}`,
            package: auth_grpc_1.AUTH_PROTO_PACKAGE,
            protoPath: (0, node_path_1.join)(process.cwd(), 'proto', 'auth.proto'),
            loader: {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
            },
        },
    });
    await app.startAllMicroservices();
    await app.listen(httpPort);
    logger.log('Auth service started', { httpPort, grpcPort });
}
void bootstrap();
const parseCorsOrigins = (value) => {
    if (!value) {
        return [];
    }
    return value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
};

})();

/******/ })()
;