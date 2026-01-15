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

module.exports = require("@nestjs/swagger");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("node:path");

/***/ }),
/* 7 */
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
__exportStar(__webpack_require__(8), exports);
__exportStar(__webpack_require__(10), exports);
__exportStar(__webpack_require__(12), exports);
__exportStar(__webpack_require__(15), exports);
__exportStar(__webpack_require__(16), exports);
__exportStar(__webpack_require__(9), exports);


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
exports.CommonModule = void 0;
const common_1 = __webpack_require__(1);
const app_logger_service_1 = __webpack_require__(9);
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
/* 9 */
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
const request_context_1 = __webpack_require__(10);
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
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequestContextStorage = void 0;
const node_async_hooks_1 = __webpack_require__(11);
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
/* 11 */
/***/ ((module) => {

module.exports = require("node:async_hooks");

/***/ }),
/* 12 */
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
const grpc_js_1 = __webpack_require__(13);
const rxjs_1 = __webpack_require__(14);
const app_logger_service_1 = __webpack_require__(9);
const request_context_1 = __webpack_require__(10);
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
/* 13 */
/***/ ((module) => {

module.exports = require("@grpc/grpc-js");

/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),
/* 15 */
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
const rxjs_1 = __webpack_require__(14);
const app_logger_service_1 = __webpack_require__(9);
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
/* 16 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequestContextInterceptor = void 0;
const node_crypto_1 = __webpack_require__(17);
const common_1 = __webpack_require__(1);
const request_context_1 = __webpack_require__(10);
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
/* 17 */
/***/ ((module) => {

module.exports = require("node:crypto");

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
const common_2 = __webpack_require__(7);
const catalog_module_1 = __webpack_require__(19);
const env_validation_1 = __webpack_require__(60);
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
                validationSchema: env_validation_1.catalogValidationSchema,
            }),
            common_2.CommonModule,
            catalog_module_1.CatalogModule,
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
exports.CatalogModule = void 0;
const common_1 = __webpack_require__(1);
const prisma_module_1 = __webpack_require__(20);
const brands_controller_1 = __webpack_require__(23);
const brands_repository_1 = __webpack_require__(29);
const brands_service_1 = __webpack_require__(28);
const categories_controller_1 = __webpack_require__(32);
const categories_repository_1 = __webpack_require__(34);
const categories_service_1 = __webpack_require__(33);
const jwt_auth_guard_1 = __webpack_require__(24);
const roles_guard_1 = __webpack_require__(27);
const catalog_grpc_controller_1 = __webpack_require__(36);
const media_module_1 = __webpack_require__(48);
const products_controller_1 = __webpack_require__(54);
const products_repository_1 = __webpack_require__(44);
const products_service_1 = __webpack_require__(37);
const requests_controller_1 = __webpack_require__(56);
const requests_repository_1 = __webpack_require__(59);
const requests_service_1 = __webpack_require__(58);
let CatalogModule = class CatalogModule {
};
exports.CatalogModule = CatalogModule;
exports.CatalogModule = CatalogModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, media_module_1.MediaModule],
        controllers: [
            brands_controller_1.BrandsController,
            categories_controller_1.CategoriesController,
            products_controller_1.ProductsController,
            catalog_grpc_controller_1.CatalogGrpcController,
            requests_controller_1.RequestsController,
        ],
        providers: [
            brands_repository_1.BrandsRepository,
            brands_service_1.BrandsService,
            categories_repository_1.CategoriesRepository,
            categories_service_1.CategoriesService,
            products_repository_1.ProductsRepository,
            products_service_1.ProductsService,
            requests_repository_1.RequestsRepository,
            requests_service_1.RequestsService,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
        ],
    })
], CatalogModule);


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
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BrandsController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(5);
const jwt_auth_guard_1 = __webpack_require__(24);
const role_enum_1 = __webpack_require__(25);
const roles_decorator_1 = __webpack_require__(26);
const roles_guard_1 = __webpack_require__(27);
const brands_service_1 = __webpack_require__(28);
const brand_dto_1 = __webpack_require__(30);
let BrandsController = class BrandsController {
    brandsService;
    constructor(brandsService) {
        this.brandsService = brandsService;
    }
    async findAll() {
        return this.brandsService.findAll();
    }
    async findOne(id) {
        return this.brandsService.findOne(id);
    }
    async create(dto) {
        return this.brandsService.create(dto);
    }
    async update(id, dto) {
        return this.brandsService.update(id, dto);
    }
    async remove(id) {
        await this.brandsService.remove(id);
    }
};
exports.BrandsController = BrandsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], BrandsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], BrandsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof brand_dto_1.CreateBrandDto !== "undefined" && brand_dto_1.CreateBrandDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], BrandsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_f = typeof brand_dto_1.UpdateBrandDto !== "undefined" && brand_dto_1.UpdateBrandDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], BrandsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], BrandsController.prototype, "remove", null);
exports.BrandsController = BrandsController = __decorate([
    (0, swagger_1.ApiTags)('brands'),
    (0, common_1.Controller)('brands'),
    __metadata("design:paramtypes", [typeof (_a = typeof brands_service_1.BrandsService !== "undefined" && brands_service_1.BrandsService) === "function" ? _a : Object])
], BrandsController);


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
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const node_crypto_1 = __webpack_require__(17);
const role_enum_1 = __webpack_require__(25);
let JwtAuthGuard = class JwtAuthGuard {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const roleFromHeader = resolveRoleHeader(request.headers['x-role']);
        const isTestEnv = this.configService.get('NODE_ENV') === 'test';
        if (roleFromHeader) {
            request.user = {
                userId: 'header-user',
                role: roleFromHeader,
            };
            return true;
        }
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            if (isTestEnv) {
                request.user = {
                    userId: 'test-user',
                    role: role_enum_1.Role.Manager,
                };
                return true;
            }
            throw new common_1.UnauthorizedException('Missing access token');
        }
        const token = authHeader.slice('Bearer '.length).trim();
        const secret = this.configService.get('JWT_SECRET') ?? '';
        const payload = verifyJwt(token, secret);
        if (!payload || !payload.role || !Object.values(role_enum_1.Role).includes(payload.role)) {
            throw new common_1.UnauthorizedException('Invalid access token');
        }
        const userId = payload.sub ?? payload.userId;
        if (!userId) {
            throw new common_1.UnauthorizedException('Invalid access token');
        }
        request.user = {
            userId,
            role: payload.role,
        };
        return true;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], JwtAuthGuard);
const resolveRoleHeader = (value) => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw) {
        return null;
    }
    const normalized = raw.trim().toUpperCase();
    return Object.values(role_enum_1.Role).find((role) => role === normalized) ?? null;
};
const verifyJwt = (token, secret) => {
    if (!token || !secret) {
        return null;
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
        return null;
    }
    const [encodedHeader, encodedPayload, signature] = parts;
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = (0, node_crypto_1.createHmac)('sha256', secret)
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
        if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
            return null;
        }
        return payload;
    }
    catch {
        return null;
    }
};
const base64UrlDecode = (input) => Buffer.from(input, 'base64url').toString('utf8');
const safeEqual = (value, expected) => {
    const valueBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);
    if (valueBuffer.length !== expectedBuffer.length) {
        return false;
    }
    return (0, node_crypto_1.timingSafeEqual)(valueBuffer, expectedBuffer);
};


/***/ }),
/* 25 */
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
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(1);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const roles_decorator_1 = __webpack_require__(26);
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
/* 28 */
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
exports.BrandsService = void 0;
const common_1 = __webpack_require__(1);
const brands_repository_1 = __webpack_require__(29);
let BrandsService = class BrandsService {
    brandsRepository;
    constructor(brandsRepository) {
        this.brandsRepository = brandsRepository;
    }
    async findAll() {
        return this.brandsRepository.findAll();
    }
    async findOne(id) {
        const brand = await this.brandsRepository.findOne(id);
        if (!brand) {
            throw new common_1.NotFoundException('Brand not found');
        }
        return brand;
    }
    async create(dto) {
        return this.brandsRepository.create(dto);
    }
    async update(id, dto) {
        return this.brandsRepository.update(id, dto);
    }
    async remove(id) {
        await this.brandsRepository.remove(id);
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof brands_repository_1.BrandsRepository !== "undefined" && brands_repository_1.BrandsRepository) === "function" ? _a : Object])
], BrandsService);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BrandsRepository = void 0;
const common_1 = __webpack_require__(1);
const prisma_service_1 = __webpack_require__(21);
let BrandsRepository = class BrandsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.brand.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        return this.prisma.brand.findFirst({ where: { id, deletedAt: null } });
    }
    async findByName(name) {
        return this.prisma.brand.findFirst({
            where: {
                deletedAt: null,
                name: { equals: name, mode: 'insensitive' },
            },
        });
    }
    async findBySlug(slug) {
        return this.prisma.brand.findFirst({ where: { slug, deletedAt: null } });
    }
    async create(data) {
        return this.prisma.brand.create({ data });
    }
    async update(id, data) {
        return this.prisma.brand.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        await this.prisma.brand.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.BrandsRepository = BrandsRepository;
exports.BrandsRepository = BrandsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], BrandsRepository);


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateBrandDto = exports.CreateBrandDto = void 0;
const swagger_1 = __webpack_require__(5);
const class_validator_1 = __webpack_require__(31);
class CreateBrandDto {
    name;
    slug;
    description;
    logoUrl;
    country;
    isFeatured;
}
exports.CreateBrandDto = CreateBrandDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "logoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBrandDto.prototype, "isFeatured", void 0);
class UpdateBrandDto extends (0, swagger_1.PartialType)(CreateBrandDto) {
}
exports.UpdateBrandDto = UpdateBrandDto;


/***/ }),
/* 31 */
/***/ ((module) => {

module.exports = require("class-validator");

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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CategoriesController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(5);
const jwt_auth_guard_1 = __webpack_require__(24);
const role_enum_1 = __webpack_require__(25);
const roles_decorator_1 = __webpack_require__(26);
const roles_guard_1 = __webpack_require__(27);
const categories_service_1 = __webpack_require__(33);
const category_dto_1 = __webpack_require__(35);
let CategoriesController = class CategoriesController {
    categoriesService;
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    async findAll() {
        return this.categoriesService.findAll();
    }
    async findOne(id) {
        return this.categoriesService.findOne(id);
    }
    async create(dto) {
        return this.categoriesService.create(dto);
    }
    async update(id, dto) {
        return this.categoriesService.update(id, dto);
    }
    async remove(id) {
        await this.categoriesService.remove(id);
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], CategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], CategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof category_dto_1.CreateCategoryDto !== "undefined" && category_dto_1.CreateCategoryDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], CategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_f = typeof category_dto_1.UpdateCategoryDto !== "undefined" && category_dto_1.UpdateCategoryDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], CategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], CategoriesController.prototype, "remove", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, swagger_1.ApiTags)('categories'),
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [typeof (_a = typeof categories_service_1.CategoriesService !== "undefined" && categories_service_1.CategoriesService) === "function" ? _a : Object])
], CategoriesController);


/***/ }),
/* 33 */
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
exports.CategoriesService = void 0;
const common_1 = __webpack_require__(1);
const categories_repository_1 = __webpack_require__(34);
let CategoriesService = class CategoriesService {
    categoriesRepository;
    constructor(categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }
    async findAll() {
        const categories = await this.categoriesRepository.findAll();
        return buildCategoryTree(categories);
    }
    async findOne(id) {
        const category = await this.categoriesRepository.findOne(id);
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async create(dto) {
        return this.categoriesRepository.create(dto);
    }
    async update(id, dto) {
        return this.categoriesRepository.update(id, dto);
    }
    async remove(id) {
        await this.categoriesRepository.remove(id);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof categories_repository_1.CategoriesRepository !== "undefined" && categories_repository_1.CategoriesRepository) === "function" ? _a : Object])
], CategoriesService);
const buildCategoryTree = (categories) => {
    const nodes = new Map();
    const roots = [];
    for (const category of categories) {
        nodes.set(category.id, { ...category, children: [] });
    }
    for (const node of nodes.values()) {
        if (node.parentId && nodes.has(node.parentId)) {
            nodes.get(node.parentId)?.children.push(node);
        }
        else {
            roots.push(node);
        }
    }
    return roots;
};


/***/ }),
/* 34 */
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
exports.CategoriesRepository = void 0;
const common_1 = __webpack_require__(1);
const prisma_service_1 = __webpack_require__(21);
let CategoriesRepository = class CategoriesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.category.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        return this.prisma.category.findFirst({ where: { id, deletedAt: null } });
    }
    async findByName(name) {
        return this.prisma.category.findFirst({
            where: {
                deletedAt: null,
                name: { equals: name, mode: 'insensitive' },
            },
        });
    }
    async findBySlug(slug) {
        return this.prisma.category.findFirst({ where: { slug, deletedAt: null } });
    }
    async create(data) {
        return this.prisma.category.create({ data });
    }
    async update(id, data) {
        return this.prisma.category.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        await this.prisma.category.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.CategoriesRepository = CategoriesRepository;
exports.CategoriesRepository = CategoriesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], CategoriesRepository);


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateCategoryDto = exports.CreateCategoryDto = void 0;
const swagger_1 = __webpack_require__(5);
const class_validator_1 = __webpack_require__(31);
class CreateCategoryDto {
    name;
    slug;
    description;
    parentId;
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "parentId", void 0);
class UpdateCategoryDto extends (0, swagger_1.PartialType)(CreateCategoryDto) {
}
exports.UpdateCategoryDto = UpdateCategoryDto;


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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CatalogGrpcController = void 0;
const common_1 = __webpack_require__(1);
const microservices_1 = __webpack_require__(4);
const brands_service_1 = __webpack_require__(28);
const products_service_1 = __webpack_require__(37);
const catalog_grpc_1 = __webpack_require__(47);
let CatalogGrpcController = class CatalogGrpcController {
    productsService;
    brandsService;
    constructor(productsService, brandsService) {
        this.productsService = productsService;
        this.brandsService = brandsService;
    }
    async getProductById(request) {
        const product = await this.productsService.findOne(request.id);
        return {
            id: product.id,
            title: product.title,
            slug: product.slug,
            sku: product.sku,
            brandId: product.brandId,
            categoryId: product.categoryId ?? '',
            status: product.status,
        };
    }
    async getBrandById(request) {
        const brand = await this.brandsService.findOne(request.id);
        return {
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
        };
    }
};
exports.CatalogGrpcController = CatalogGrpcController;
__decorate([
    (0, microservices_1.GrpcMethod)(catalog_grpc_1.CATALOG_INTERNAL_SERVICE, 'GetProductById'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], CatalogGrpcController.prototype, "getProductById", null);
__decorate([
    (0, microservices_1.GrpcMethod)(catalog_grpc_1.CATALOG_INTERNAL_SERVICE, 'GetBrandById'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], CatalogGrpcController.prototype, "getBrandById", null);
exports.CatalogGrpcController = CatalogGrpcController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof products_service_1.ProductsService !== "undefined" && products_service_1.ProductsService) === "function" ? _a : Object, typeof (_b = typeof brands_service_1.BrandsService !== "undefined" && brands_service_1.BrandsService) === "function" ? _b : Object])
], CatalogGrpcController);


/***/ }),
/* 37 */
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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductsService = void 0;
const common_1 = __webpack_require__(1);
const client_1 = __webpack_require__(22);
const fast_csv_1 = __webpack_require__(38);
const brands_repository_1 = __webpack_require__(29);
const categories_repository_1 = __webpack_require__(34);
const media_service_1 = __webpack_require__(39);
const prisma_service_1 = __webpack_require__(21);
const products_repository_1 = __webpack_require__(44);
const products_csv_dto_1 = __webpack_require__(45);
const slugify_1 = __webpack_require__(46);
const CSV_REQUIRED_COLUMNS = ['name', 'article', 'price', 'brand'];
const DEFAULT_PRODUCT_CURRENCY = 'RUB';
const DEFAULT_PRODUCT_STATUS = client_1.ProductStatus.DRAFT;
const DEFAULT_IMPORT_STATUS = client_1.ProductStatus.PUBLISHED;
const MAX_SLUG_ATTEMPTS = 50;
const MAX_EXPORT_LIMIT = 50_000;
const PRODUCT_MAIN_IMAGE_ORDER = 0;
let ProductsService = class ProductsService {
    productsRepository;
    brandsRepository;
    categoriesRepository;
    mediaService;
    prisma;
    constructor(productsRepository, brandsRepository, categoriesRepository, mediaService, prisma) {
        this.productsRepository = productsRepository;
        this.brandsRepository = brandsRepository;
        this.categoriesRepository = categoriesRepository;
        this.mediaService = mediaService;
        this.prisma = prisma;
    }
    async findAll(filters) {
        return this.productsRepository.findAll(filters);
    }
    async findOne(id) {
        const product = await this.productsRepository.findOne(id);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async findBySlug(slug) {
        const product = await this.productsRepository.findBySlug(slug);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async create(dto) {
        await this.ensureRelations(dto.brandId, dto.categoryId);
        const created = await this.productsRepository.create(dto);
        await this.syncMainImage(created.id, dto.mainImageId, created.title);
        return this.findOne(created.id);
    }
    async update(id, dto) {
        await this.ensureRelations(dto.brandId, dto.categoryId);
        const updated = await this.productsRepository.update(id, dto);
        await this.syncMainImage(updated.id, dto.mainImageId, updated.title);
        return this.findOne(updated.id);
    }
    async remove(id) {
        await this.productsRepository.remove(id);
    }
    async removeMany(dto) {
        return this.productsRepository.removeMany(dto.ids);
    }
    async updateStatusMany(dto) {
        return this.productsRepository.updateStatusMany(dto.ids, dto.status);
    }
    async updateBrandMany(dto) {
        await this.ensureRelations(dto.brandId, undefined);
        return this.productsRepository.updateBrandMany(dto.ids, dto.brandId);
    }
    async updateCategoryMany(dto) {
        await this.ensureRelations(undefined, dto.categoryId ?? undefined);
        return this.productsRepository.updateCategoryMany(dto.ids, dto.categoryId);
    }
    async findAllDeleted(filters) {
        return this.productsRepository.findAllDeleted(filters);
    }
    async restore(id) {
        return this.productsRepository.restoreOne(id);
    }
    async restoreMany(dto) {
        return this.productsRepository.restoreMany(dto.ids);
    }
    async hardDelete(id) {
        await this.productsRepository.hardDeleteOne(id);
    }
    async hardDeleteMany(dto) {
        return this.productsRepository.hardDeleteMany(dto.ids);
    }
    async importCsv(buffer, opts) {
        const text = buffer.toString('utf8');
        const status = opts?.status ?? DEFAULT_IMPORT_STATUS;
        const updateBySku = opts?.updateBySku !== 'false';
        const result = {
            total: 0,
            created: 0,
            updated: 0,
            failed: 0,
            errors: [],
        };
        let rowIndex = 0;
        await new Promise((resolve, reject) => {
            const parser = (0, fast_csv_1.parseString)(text, { headers: true, trim: true, ignoreEmpty: true });
            parser.on('error', reject);
            parser.on('headers', (headers) => {
                const normalized = new Set(headers.map((h) => String(h).trim()));
                const missing = CSV_REQUIRED_COLUMNS.filter((col) => !normalized.has(col));
                if (missing.length > 0) {
                    reject(new common_1.BadRequestException(`Missing CSV columns: ${missing.join(', ')}`));
                    return;
                }
            });
            parser.on('data', async (row) => {
                rowIndex += 1;
                const csvRowNumber = rowIndex + 1;
                result.total += 1;
                parser.pause();
                try {
                    const outcome = await this.upsertFromCsvRow(row, { status, updateBySku });
                    if (outcome === 'created')
                        result.created += 1;
                    if (outcome === 'updated')
                        result.updated += 1;
                }
                catch (error) {
                    result.failed += 1;
                    result.errors.push({ row: csvRowNumber, message: this.toCsvErrorMessage(error) });
                }
                finally {
                    parser.resume();
                }
            });
            parser.on('end', () => resolve());
        });
        return result;
    }
    async exportCsv(dto) {
        const columns = this.normalizeExportColumns(dto.columns);
        const products = await this.prisma.product.findMany({
            where: this.buildWhereForExport(dto),
            orderBy: { createdAt: 'desc' },
            take: MAX_EXPORT_LIMIT,
            include: {
                brand: true,
                category: true,
                images: { orderBy: { order: 'asc' } },
            },
        });
        const rows = products.map((product) => {
            const mainImage = product.images.find((img) => img.isMain) ?? product.images[0];
            const values = {};
            for (const column of columns) {
                switch (column) {
                    case 'id':
                        values.id = product.id;
                        break;
                    case 'name':
                        values.name = product.title;
                        break;
                    case 'article':
                        values.article = product.sku;
                        break;
                    case 'price':
                        values.price = String(product.price);
                        break;
                    case 'img':
                        values.img = mainImage?.url ?? '';
                        break;
                    case 'description':
                        values.description = product.description ?? '';
                        break;
                    case 'brand':
                        values.brand = product.brand?.name ?? '';
                        break;
                    case 'category':
                        values.category = product.category?.name ?? '';
                        break;
                }
            }
            return values;
        });
        const buffer = await (0, fast_csv_1.writeToBuffer)(rows, { headers: columns });
        return { buffer, filename: 'products.csv' };
    }
    async ensureRelations(brandId, categoryId) {
        const [brand, category] = await Promise.all([
            brandId ? this.brandsRepository.findOne(brandId) : Promise.resolve(null),
            categoryId ? this.categoriesRepository.findOne(categoryId) : Promise.resolve(null),
        ]);
        if (brandId && !brand) {
            throw new common_1.NotFoundException('Brand not found');
        }
        if (categoryId && !category) {
            throw new common_1.NotFoundException('Category not found');
        }
    }
    async syncMainImage(productId, mainImageId, fallbackAlt) {
        if (mainImageId === undefined)
            return;
        if (mainImageId === null) {
            await this.prisma.productImage.deleteMany({ where: { productId } });
            return;
        }
        const mediaFile = await this.prisma.mediaFile.findUnique({
            where: { id: mainImageId },
            select: { id: true, url: true, alt: true },
        });
        if (!mediaFile) {
            throw new common_1.NotFoundException('Media file not found');
        }
        const alt = mediaFile.alt ?? fallbackAlt;
        await this.prisma.$transaction(async (tx) => {
            await tx.productImage.deleteMany({ where: { productId } });
            await tx.productImage.create({
                data: {
                    productId,
                    url: mediaFile.url,
                    alt,
                    order: PRODUCT_MAIN_IMAGE_ORDER,
                    isMain: true,
                    mediaFileId: mediaFile.id,
                },
            });
        });
    }
    async upsertFromCsvRow(row, opts) {
        const id = this.normalizeString(row.id);
        const name = this.requireString(row.name, 'name');
        const article = this.requireString(row.article, 'article');
        const price = this.requireNumber(row.price, 'price');
        const description = this.normalizeString(row.description);
        const brandName = this.requireString(row.brand, 'brand');
        const categoryName = this.normalizeString(row.category);
        const imgUrl = this.normalizeString(row.img);
        const brandId = await this.getOrCreateBrandId(brandName);
        const categoryId = categoryName ? await this.getOrCreateCategoryId(categoryName) : undefined;
        const mediaFile = imgUrl ? await this.uploadImageToMediaLibrary(imgUrl, name) : null;
        const existingById = id
            ? await this.prisma.product.findFirst({
                where: { id, deletedAt: null },
                select: { id: true, slug: true, categoryId: true },
            })
            : null;
        if (existingById) {
            const data = {
                title: name,
                sku: article,
                price,
                description,
                brandId,
            };
            if (categoryId) {
                data.categoryId = categoryId;
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.product.update({ where: { id: existingById.id }, data });
                if (mediaFile) {
                    await tx.productImage.deleteMany({ where: { productId: existingById.id } });
                    await tx.productImage.create({
                        data: {
                            url: mediaFile.url,
                            order: 0,
                            isMain: true,
                            productId: existingById.id,
                            alt: name,
                            mediaFileId: mediaFile.id,
                        },
                    });
                }
            });
            return 'updated';
        }
        if (opts.updateBySku) {
            const existingBySku = await this.prisma.product.findFirst({
                where: { sku: article, deletedAt: null },
                select: { id: true },
            });
            if (existingBySku) {
                const data = {
                    title: name,
                    price,
                    description,
                    brandId,
                    status: opts.status,
                };
                if (categoryId) {
                    data.categoryId = categoryId;
                }
                await this.prisma.$transaction(async (tx) => {
                    await tx.product.update({ where: { id: existingBySku.id }, data });
                    if (mediaFile) {
                        await tx.productImage.deleteMany({ where: { productId: existingBySku.id } });
                        await tx.productImage.create({
                            data: {
                                url: mediaFile.url,
                                order: 0,
                                isMain: true,
                                productId: existingBySku.id,
                                alt: name,
                                mediaFileId: mediaFile.id,
                            },
                        });
                    }
                });
                return 'updated';
            }
        }
        const slug = await this.buildUniqueProductSlug(name, article);
        const productId = id || undefined;
        await this.prisma.$transaction(async (tx) => {
            const created = await tx.product.create({
                data: {
                    ...(productId ? { id: productId } : {}),
                    title: name,
                    slug,
                    sku: article,
                    description,
                    price,
                    currency: DEFAULT_PRODUCT_CURRENCY,
                    status: opts.status ?? DEFAULT_PRODUCT_STATUS,
                    stock: null,
                    attributes: {},
                    specs: undefined,
                    brandId,
                    categoryId: categoryId ?? null,
                },
            });
            if (mediaFile) {
                await tx.productImage.create({
                    data: {
                        url: mediaFile.url,
                        order: 0,
                        isMain: true,
                        productId: created.id,
                        alt: name,
                        mediaFileId: mediaFile.id,
                    },
                });
            }
        });
        return 'created';
    }
    async uploadImageToMediaLibrary(imgUrl, alt) {
        try {
            const mediaFile = await this.mediaService.uploadFromUrl(imgUrl, alt);
            return { id: mediaFile.id, url: mediaFile.url };
        }
        catch {
            return null;
        }
    }
    async getOrCreateBrandId(name) {
        const existing = await this.brandsRepository.findByName(name);
        if (existing)
            return existing.id;
        const base = (0, slugify_1.slugify)(name) || 'brand';
        const slug = await this.buildUniqueSlug(base, (candidate) => this.brandsRepository.findBySlug(candidate));
        const created = await this.prisma.brand.create({ data: { name, slug } });
        return created.id;
    }
    async getOrCreateCategoryId(name) {
        const existing = await this.categoriesRepository.findByName(name);
        if (existing)
            return existing.id;
        const base = (0, slugify_1.slugify)(name) || 'category';
        const slug = await this.buildUniqueSlug(base, (candidate) => this.categoriesRepository.findBySlug(candidate));
        const created = await this.prisma.category.create({ data: { name, slug } });
        return created.id;
    }
    async buildUniqueProductSlug(title, sku) {
        const base = (0, slugify_1.slugify)(title) || (0, slugify_1.slugify)(sku) || 'product';
        const skuSuffix = (0, slugify_1.slugify)(sku);
        const candidates = skuSuffix && base !== skuSuffix ? [base, `${base}-${skuSuffix}`] : [base];
        for (const candidate of candidates) {
            const available = await this.prisma.product.findUnique({ where: { slug: candidate } });
            if (!available)
                return candidate;
        }
        return this.buildUniqueSlug(base, (candidate) => this.prisma.product.findUnique({ where: { slug: candidate } }));
    }
    async buildUniqueSlug(base, findExisting) {
        const normalizedBase = base || 'item';
        for (let i = 0; i < MAX_SLUG_ATTEMPTS; i += 1) {
            const candidate = i === 0 ? normalizedBase : `${normalizedBase}-${i + 1}`;
            const existing = await findExisting(candidate);
            if (!existing)
                return candidate;
        }
        throw new common_1.BadRequestException('Unable to generate unique slug');
    }
    buildWhereForExport(dto) {
        const where = { deletedAt: null };
        const brandId = dto.brandId?.trim();
        if (brandId) {
            where.brandId = brandId;
        }
        const search = dto.search?.trim();
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        return where;
    }
    normalizeExportColumns(columns) {
        if (!columns || columns.length === 0) {
            return [...products_csv_dto_1.PRODUCT_CSV_COLUMNS];
        }
        const unique = Array.from(new Set(columns));
        const filtered = unique.filter((c) => products_csv_dto_1.PRODUCT_CSV_COLUMNS.includes(c));
        return filtered.length > 0 ? filtered : [...products_csv_dto_1.PRODUCT_CSV_COLUMNS];
    }
    normalizeString(value) {
        if (value === undefined || value === null)
            return undefined;
        const text = String(value).trim();
        return text ? text : undefined;
    }
    requireString(value, field) {
        const text = this.normalizeString(value);
        if (!text) {
            throw new common_1.BadRequestException(`Invalid ${field}`);
        }
        return text;
    }
    requireNumber(value, field) {
        const text = this.normalizeString(value);
        const parsed = text ? Number(text) : NaN;
        if (!Number.isFinite(parsed)) {
            throw new common_1.BadRequestException(`Invalid ${field}`);
        }
        return parsed;
    }
    toCsvErrorMessage(error) {
        if (error instanceof common_1.BadRequestException) {
            const response = error.getResponse();
            if (typeof response === 'string')
                return response;
            if (response && typeof response === 'object' && 'message' in response) {
                const message = response.message;
                if (typeof message === 'string')
                    return message;
                if (Array.isArray(message))
                    return message.map(String).join('; ');
            }
            return 'Bad request';
        }
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error;
            const code = String(prismaError.code ?? '');
            if (code === 'P2002') {
                const target = prismaError.meta && typeof prismaError.meta === 'object' && 'target' in prismaError.meta
                    ? prismaError.meta.target
                    : undefined;
                const targetText = Array.isArray(target) ? target.join(', ') : target ? String(target) : '';
                return targetText ? `Дубликат уникального поля: ${targetText}` : 'Дубликат уникального поля (P2002)';
            }
            return `Database error: ${code}`;
        }
        return error instanceof Error ? error.message : 'Unknown error';
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof products_repository_1.ProductsRepository !== "undefined" && products_repository_1.ProductsRepository) === "function" ? _a : Object, typeof (_b = typeof brands_repository_1.BrandsRepository !== "undefined" && brands_repository_1.BrandsRepository) === "function" ? _b : Object, typeof (_c = typeof categories_repository_1.CategoriesRepository !== "undefined" && categories_repository_1.CategoriesRepository) === "function" ? _c : Object, typeof (_d = typeof media_service_1.MediaService !== "undefined" && media_service_1.MediaService) === "function" ? _d : Object, typeof (_e = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _e : Object])
], ProductsService);


/***/ }),
/* 38 */
/***/ ((module) => {

module.exports = require("fast-csv");

/***/ }),
/* 39 */
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
exports.MediaService = void 0;
const common_1 = __webpack_require__(1);
const minio_service_1 = __webpack_require__(40);
const media_repository_1 = __webpack_require__(43);
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
let MediaService = class MediaService {
    minioService;
    mediaRepository;
    constructor(minioService, mediaRepository) {
        this.minioService = minioService;
        this.mediaRepository = mediaRepository;
    }
    async findAll(query) {
        return this.mediaRepository.findAll(query);
    }
    async findOne(id) {
        const file = await this.mediaRepository.findOne(id);
        if (!file) {
            throw new common_1.NotFoundException('Media file not found');
        }
        return file;
    }
    async upload(file, alt) {
        this.validateFile(file);
        const result = await this.minioService.upload(file.buffer, file.originalname, file.mimetype);
        const dimensions = await this.getImageDimensions(file.buffer);
        return this.mediaRepository.create({
            filename: result.key,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: result.size,
            url: result.url,
            width: dimensions?.width,
            height: dimensions?.height,
            alt,
        });
    }
    async uploadFromUrl(url, alt) {
        const existingFile = await this.mediaRepository.findByUrl(url);
        if (existingFile) {
            return existingFile;
        }
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'PonatechBot/1.0' },
                signal: AbortSignal.timeout(30000),
            });
            if (!response.ok) {
                throw new common_1.BadRequestException(`Failed to fetch image: ${response.status}`);
            }
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            const mimeType = contentType.split(';')[0].trim();
            if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
                throw new common_1.BadRequestException(`Unsupported image type: ${mimeType}`);
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            if (buffer.length > MAX_FILE_SIZE) {
                throw new common_1.BadRequestException('File too large');
            }
            const filename = this.extractFilenameFromUrl(url);
            const result = await this.minioService.upload(buffer, filename, mimeType);
            const dimensions = await this.getImageDimensions(buffer);
            return this.mediaRepository.create({
                filename: result.key,
                originalName: filename,
                mimeType,
                size: result.size,
                url: result.url,
                width: dimensions?.width,
                height: dimensions?.height,
                alt,
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to download image from URL: ${url}`);
        }
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.mediaRepository.update(id, dto);
    }
    async delete(id) {
        const file = await this.findOne(id);
        await this.minioService.delete(file.filename);
        await this.mediaRepository.delete(id);
    }
    validateFile(file) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Unsupported file type: ${file.mimetype}`);
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
    }
    async getImageDimensions(buffer) {
        try {
            const signature = buffer.slice(0, 8);
            if (this.isPng(signature)) {
                return this.getPngDimensions(buffer);
            }
            if (this.isJpeg(signature)) {
                return this.getJpegDimensions(buffer);
            }
            if (this.isGif(signature)) {
                return this.getGifDimensions(buffer);
            }
            if (this.isWebp(buffer)) {
                return this.getWebpDimensions(buffer);
            }
            return null;
        }
        catch {
            return null;
        }
    }
    isPng(sig) {
        return sig[0] === 0x89 && sig[1] === 0x50 && sig[2] === 0x4e && sig[3] === 0x47;
    }
    isJpeg(sig) {
        return sig[0] === 0xff && sig[1] === 0xd8;
    }
    isGif(sig) {
        return sig[0] === 0x47 && sig[1] === 0x49 && sig[2] === 0x46;
    }
    isWebp(buffer) {
        return (buffer[0] === 0x52 &&
            buffer[1] === 0x49 &&
            buffer[2] === 0x46 &&
            buffer[3] === 0x46 &&
            buffer[8] === 0x57 &&
            buffer[9] === 0x45 &&
            buffer[10] === 0x42 &&
            buffer[11] === 0x50);
    }
    getPngDimensions(buffer) {
        return {
            width: buffer.readUInt32BE(16),
            height: buffer.readUInt32BE(20),
        };
    }
    getJpegDimensions(buffer) {
        let offset = 2;
        while (offset < buffer.length) {
            if (buffer[offset] !== 0xff)
                break;
            const marker = buffer[offset + 1];
            if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
                return {
                    height: buffer.readUInt16BE(offset + 5),
                    width: buffer.readUInt16BE(offset + 7),
                };
            }
            offset += 2 + buffer.readUInt16BE(offset + 2);
        }
        return null;
    }
    getGifDimensions(buffer) {
        return {
            width: buffer.readUInt16LE(6),
            height: buffer.readUInt16LE(8),
        };
    }
    getWebpDimensions(buffer) {
        const vp8Offset = buffer.indexOf('VP8 ');
        if (vp8Offset !== -1) {
            return {
                width: buffer.readUInt16LE(vp8Offset + 14) & 0x3fff,
                height: buffer.readUInt16LE(vp8Offset + 16) & 0x3fff,
            };
        }
        const vp8lOffset = buffer.indexOf('VP8L');
        if (vp8lOffset !== -1) {
            const bits = buffer.readUInt32LE(vp8lOffset + 9);
            return {
                width: (bits & 0x3fff) + 1,
                height: ((bits >> 14) & 0x3fff) + 1,
            };
        }
        return null;
    }
    extractFilenameFromUrl(url) {
        try {
            const pathname = new URL(url).pathname;
            const filename = pathname.split('/').pop() || 'image';
            return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        }
        catch {
            return 'image';
        }
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof minio_service_1.MinioService !== "undefined" && minio_service_1.MinioService) === "function" ? _a : Object, typeof (_b = typeof media_repository_1.MediaRepository !== "undefined" && media_repository_1.MediaRepository) === "function" ? _b : Object])
], MediaService);


/***/ }),
/* 40 */
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
exports.MinioService = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const client_s3_1 = __webpack_require__(41);
const lib_storage_1 = __webpack_require__(42);
let MinioService = class MinioService {
    config;
    client;
    bucket;
    endpoint;
    port;
    useSSL;
    constructor(config) {
        this.config = config;
        this.endpoint = this.config.get('MINIO_ENDPOINT', 'localhost');
        this.port = this.config.get('MINIO_PORT', 9000);
        this.useSSL = this.config.get('MINIO_USE_SSL', false);
        this.bucket = this.config.get('MINIO_BUCKET', 'ponatech-media');
        const protocol = this.useSSL ? 'https' : 'http';
        const endpointUrl = `${protocol}://${this.endpoint}:${this.port}`;
        this.client = new client_s3_1.S3Client({
            endpoint: endpointUrl,
            region: 'us-east-1',
            credentials: {
                accessKeyId: this.config.get('MINIO_ROOT_USER', 'minioadmin'),
                secretAccessKey: this.config.get('MINIO_ROOT_PASSWORD', 'minioadmin'),
            },
            forcePathStyle: true,
        });
    }
    async onModuleInit() {
        await this.ensureBucketExists();
    }
    async ensureBucketExists() {
        try {
            await this.client.send(new client_s3_1.HeadBucketCommand({ Bucket: this.bucket }));
        }
        catch (error) {
            const err = error;
            if (err.name === 'NotFound' || err.name === 'NoSuchBucket') {
                await this.client.send(new client_s3_1.CreateBucketCommand({ Bucket: this.bucket }));
            }
        }
    }
    async upload(buffer, filename, mimeType) {
        const key = this.generateKey(filename);
        await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
        }));
        return {
            key,
            url: this.getPublicUrl(key),
            size: buffer.length,
        };
    }
    async uploadStream(stream, filename, mimeType, size) {
        const key = this.generateKey(filename);
        const upload = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: stream,
                ContentType: mimeType,
            },
        });
        await upload.done();
        return {
            key,
            url: this.getPublicUrl(key),
            size: size ?? 0,
        };
    }
    async delete(key) {
        await this.client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        }));
    }
    async getObject(key) {
        const response = await this.client.send(new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        }));
        return response.Body;
    }
    getPublicUrl(key) {
        const protocol = this.useSSL ? 'https' : 'http';
        return `${protocol}://${this.endpoint}:${this.port}/${this.bucket}/${key}`;
    }
    generateKey(filename) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `${timestamp}-${random}-${safeFilename}`;
    }
};
exports.MinioService = MinioService;
exports.MinioService = MinioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], MinioService);


/***/ }),
/* 41 */
/***/ ((module) => {

module.exports = require("@aws-sdk/client-s3");

/***/ }),
/* 42 */
/***/ ((module) => {

module.exports = require("@aws-sdk/lib-storage");

/***/ }),
/* 43 */
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
exports.MediaRepository = void 0;
const common_1 = __webpack_require__(1);
const prisma_service_1 = __webpack_require__(21);
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;
let MediaRepository = class MediaRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;
        const skip = (page - 1) * limit;
        const where = query.search
            ? {
                OR: [
                    { originalName: { contains: query.search, mode: 'insensitive' } },
                    { filename: { contains: query.search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [data, total] = await Promise.all([
            this.prisma.mediaFile.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.mediaFile.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        return this.prisma.mediaFile.findUnique({ where: { id } });
    }
    async findByUrl(url) {
        return this.prisma.mediaFile.findFirst({ where: { url } });
    }
    async create(data) {
        return this.prisma.mediaFile.create({ data });
    }
    async update(id, data) {
        return this.prisma.mediaFile.update({ where: { id }, data });
    }
    async delete(id) {
        return this.prisma.mediaFile.delete({ where: { id } });
    }
};
exports.MediaRepository = MediaRepository;
exports.MediaRepository = MediaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], MediaRepository);


/***/ }),
/* 44 */
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
exports.ProductsRepository = void 0;
const common_1 = __webpack_require__(1);
const client_1 = __webpack_require__(22);
const prisma_service_1 = __webpack_require__(21);
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const RESERVED_FILTER_KEYS = new Set([
    'brandId',
    'brandSlug',
    'categoryId',
    'status',
    'search',
    'minPrice',
    'maxPrice',
    'page',
    'limit',
    'sort',
]);
let ProductsRepository = class ProductsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = { deletedAt: null };
        const brandId = this.normalizeFilterValue(filters?.brandId);
        const brandSlug = this.normalizeFilterValue(filters?.brandSlug);
        const categoryId = this.normalizeFilterValue(filters?.categoryId);
        const status = this.normalizeFilterValue(filters?.status);
        const search = this.normalizeFilterValue(filters?.search);
        const minPrice = this.parseNumberFilter(filters?.minPrice);
        const maxPrice = this.parseNumberFilter(filters?.maxPrice);
        const page = this.parseIntFilter(filters?.page, DEFAULT_PAGE);
        const limit = this.parseIntFilter(filters?.limit, DEFAULT_LIMIT, MAX_LIMIT);
        const sort = this.normalizeFilterValue(filters?.sort);
        const attributeFilters = this.buildAttributeFilters(filters);
        if (brandId) {
            where.brandId = brandId;
        }
        if (brandSlug) {
            where.brand = { slug: brandSlug };
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (status && Object.values(client_1.ProductStatus).includes(status)) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {
                ...(minPrice !== undefined ? { gte: minPrice } : {}),
                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            };
        }
        if (attributeFilters.length > 0) {
            where.AND = attributeFilters;
        }
        const orderBy = this.buildOrderBy(sort);
        const skip = (page - 1) * limit;
        const [total, data] = await this.prisma.$transaction([
            this.prisma.product.count({ where }),
            this.prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    brand: true,
                    category: true,
                    images: { orderBy: { order: 'asc' } },
                },
            }),
        ]);
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async findOne(id) {
        return this.prisma.product.findFirst({
            where: { id, deletedAt: null },
            include: {
                brand: true,
                category: true,
                images: { orderBy: { order: 'asc' } },
            },
        });
    }
    async findBySlug(slug) {
        return this.prisma.product.findFirst({
            where: { slug, deletedAt: null },
            include: {
                brand: true,
                category: true,
                images: { orderBy: { order: 'asc' } },
            },
        });
    }
    async create(dto) {
        return this.prisma.product.create({
            data: this.toCreateInput(dto),
            include: {
                brand: true,
                category: true,
                images: { orderBy: { order: 'asc' } },
            },
        });
    }
    async update(id, dto) {
        return this.prisma.product.update({
            where: { id },
            data: this.toUpdateInput(dto),
            include: {
                brand: true,
                category: true,
                images: { orderBy: { order: 'asc' } },
            },
        });
    }
    async remove(id) {
        await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async removeMany(ids) {
        return this.prisma.product.updateMany({
            where: { id: { in: ids }, deletedAt: null },
            data: { deletedAt: new Date() },
        });
    }
    async updateStatusMany(ids, status) {
        return this.prisma.product.updateMany({
            where: { id: { in: ids }, deletedAt: null },
            data: { status },
        });
    }
    async updateBrandMany(ids, brandId) {
        return this.prisma.product.updateMany({
            where: { id: { in: ids }, deletedAt: null },
            data: { brandId },
        });
    }
    async updateCategoryMany(ids, categoryId) {
        return this.prisma.product.updateMany({
            where: { id: { in: ids }, deletedAt: null },
            data: { categoryId },
        });
    }
    async findAllDeleted(filters) {
        const where = { deletedAt: { not: null } };
        const brandId = this.normalizeFilterValue(filters?.brandId);
        const search = this.normalizeFilterValue(filters?.search);
        const page = this.parseIntFilter(filters?.page, DEFAULT_PAGE);
        const limit = this.parseIntFilter(filters?.limit, DEFAULT_LIMIT, MAX_LIMIT);
        const sort = this.normalizeFilterValue(filters?.sort);
        if (brandId) {
            where.brandId = brandId;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        const orderBy = this.buildOrderBy(sort);
        const skip = (page - 1) * limit;
        const [total, data] = await this.prisma.$transaction([
            this.prisma.product.count({ where }),
            this.prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    brand: true,
                    category: true,
                    images: { orderBy: { order: 'asc' } },
                },
            }),
        ]);
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async restoreOne(id) {
        return this.prisma.product.update({
            where: { id },
            data: { deletedAt: null },
            include: {
                brand: true,
                category: true,
                images: { orderBy: { order: 'asc' } },
            },
        });
    }
    async restoreMany(ids) {
        return this.prisma.product.updateMany({
            where: { id: { in: ids }, deletedAt: { not: null } },
            data: { deletedAt: null },
        });
    }
    async hardDeleteOne(id) {
        await this.prisma.$transaction([
            this.prisma.productImage.deleteMany({ where: { productId: id } }),
            this.prisma.product.delete({ where: { id } }),
        ]);
    }
    async hardDeleteMany(ids) {
        const [, result] = await this.prisma.$transaction([
            this.prisma.productImage.deleteMany({ where: { productId: { in: ids } } }),
            this.prisma.product.deleteMany({ where: { id: { in: ids }, deletedAt: { not: null } } }),
        ]);
        return result;
    }
    toCreateInput(dto) {
        return {
            title: dto.title,
            slug: dto.slug,
            sku: dto.sku,
            description: dto.description,
            price: dto.price,
            currency: dto.currency ?? 'RUB',
            status: dto.status ?? client_1.ProductStatus.DRAFT,
            stock: dto.stock ?? null,
            attributes: dto.attributes,
            specs: dto.specs,
            brandId: dto.brandId,
            categoryId: dto.categoryId ?? null,
        };
    }
    toUpdateInput(dto) {
        const data = {};
        if (dto.title !== undefined)
            data.title = dto.title;
        if (dto.slug !== undefined)
            data.slug = dto.slug;
        if (dto.sku !== undefined)
            data.sku = dto.sku;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.price !== undefined)
            data.price = dto.price;
        if (dto.currency !== undefined)
            data.currency = dto.currency;
        if (dto.status !== undefined)
            data.status = dto.status;
        if (dto.stock !== undefined)
            data.stock = dto.stock;
        if (dto.attributes !== undefined)
            data.attributes = dto.attributes;
        if (dto.specs !== undefined)
            data.specs = dto.specs;
        if (dto.brandId !== undefined)
            data.brandId = dto.brandId;
        if (dto.categoryId !== undefined)
            data.categoryId = dto.categoryId || null;
        return data;
    }
    buildAttributeFilters(filters) {
        if (!filters) {
            return [];
        }
        return Object.entries(filters)
            .filter(([key, value]) => !RESERVED_FILTER_KEYS.has(key) && value !== undefined && value !== '')
            .map(([key, value]) => ({
            attributes: {
                path: [key],
                equals: Array.isArray(value) ? value[0] : value,
            },
        }));
    }
    normalizeFilterValue(value) {
        if (!value) {
            return undefined;
        }
        const raw = Array.isArray(value) ? value[0] : value;
        const trimmed = raw?.trim();
        return trimmed ? trimmed : undefined;
    }
    parseNumberFilter(value) {
        const normalized = this.normalizeFilterValue(value);
        if (!normalized) {
            return undefined;
        }
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    parseIntFilter(value, fallback, max) {
        const normalized = this.normalizeFilterValue(value);
        const parsed = normalized ? Number.parseInt(normalized, 10) : NaN;
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return fallback;
        }
        if (max !== undefined) {
            return Math.min(parsed, max);
        }
        return parsed;
    }
    buildOrderBy(sort) {
        switch (sort) {
            case 'price_asc':
                return { price: 'asc' };
            case 'price_desc':
                return { price: 'desc' };
            case 'title_asc':
                return { title: 'asc' };
            case 'title_desc':
                return { title: 'desc' };
            case 'created_asc':
                return { createdAt: 'asc' };
            case 'created_desc':
            default:
                return { createdAt: 'desc' };
        }
    }
};
exports.ProductsRepository = ProductsRepository;
exports.ProductsRepository = ProductsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ProductsRepository);


/***/ }),
/* 45 */
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
exports.ImportProductsCsvDto = exports.ExportProductsCsvDto = exports.PRODUCT_CSV_COLUMNS = void 0;
const class_validator_1 = __webpack_require__(31);
const client_1 = __webpack_require__(22);
exports.PRODUCT_CSV_COLUMNS = [
    'id',
    'name',
    'article',
    'price',
    'img',
    'description',
    'brand',
    'category',
];
class ExportProductsCsvDto {
    columns;
    brandId;
    search;
}
exports.ExportProductsCsvDto = ExportProductsCsvDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsIn)(exports.PRODUCT_CSV_COLUMNS, { each: true }),
    __metadata("design:type", Array)
], ExportProductsCsvDto.prototype, "columns", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExportProductsCsvDto.prototype, "brandId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExportProductsCsvDto.prototype, "search", void 0);
class ImportProductsCsvDto {
    status;
    updateBySku;
}
exports.ImportProductsCsvDto = ImportProductsCsvDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
    __metadata("design:type", typeof (_a = typeof client_1.ProductStatus !== "undefined" && client_1.ProductStatus) === "function" ? _a : Object)
], ImportProductsCsvDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['true', 'false']),
    __metadata("design:type", String)
], ImportProductsCsvDto.prototype, "updateBySku", void 0);


/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.slugify = slugify;
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}


/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CATALOG_INTERNAL_SERVICE = exports.CATALOG_PROTO_PACKAGE = void 0;
exports.CATALOG_PROTO_PACKAGE = 'catalog';
exports.CATALOG_INTERNAL_SERVICE = 'CatalogInternalService';


/***/ }),
/* 48 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MediaModule = void 0;
const common_1 = __webpack_require__(1);
const minio_module_1 = __webpack_require__(49);
const prisma_module_1 = __webpack_require__(20);
const media_controller_1 = __webpack_require__(50);
const media_repository_1 = __webpack_require__(43);
const media_service_1 = __webpack_require__(39);
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [minio_module_1.MinioModule, prisma_module_1.PrismaModule],
        controllers: [media_controller_1.MediaController],
        providers: [media_service_1.MediaService, media_repository_1.MediaRepository],
        exports: [media_service_1.MediaService],
    })
], MediaModule);


/***/ }),
/* 49 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MinioModule = void 0;
const common_1 = __webpack_require__(1);
const minio_service_1 = __webpack_require__(40);
let MinioModule = class MinioModule {
};
exports.MinioModule = MinioModule;
exports.MinioModule = MinioModule = __decorate([
    (0, common_1.Module)({
        providers: [minio_service_1.MinioService],
        exports: [minio_service_1.MinioService],
    })
], MinioModule);


/***/ }),
/* 50 */
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MediaController = void 0;
const common_1 = __webpack_require__(1);
const platform_express_1 = __webpack_require__(51);
const swagger_1 = __webpack_require__(5);
const jwt_auth_guard_1 = __webpack_require__(24);
const roles_guard_1 = __webpack_require__(27);
const roles_decorator_1 = __webpack_require__(26);
const role_enum_1 = __webpack_require__(25);
const media_service_1 = __webpack_require__(39);
const media_dto_1 = __webpack_require__(52);
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async findAll(query) {
        return this.mediaService.findAll(query);
    }
    async findOne(id) {
        return this.mediaService.findOne(id);
    }
    async upload(file, alt) {
        return this.mediaService.upload(file, alt);
    }
    async uploadFromUrl(dto) {
        return this.mediaService.uploadFromUrl(dto.url, dto.alt);
    }
    async update(id, dto) {
        return this.mediaService.update(id, dto);
    }
    async delete(id) {
        return this.mediaService.delete(id);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить список медиафайлов' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof media_dto_1.MediaFilesQueryDto !== "undefined" && media_dto_1.MediaFilesQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], MediaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить медиафайл по ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], MediaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SuperAdmin, role_enum_1.Role.Admin, role_enum_1.Role.Manager),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Загрузить файл' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                alt: { type: 'string' },
            },
            required: ['file'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('alt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof Express !== "undefined" && (_e = Express.Multer) !== void 0 && _e.File) === "function" ? _f : Object, String]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], MediaController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('upload-from-url'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SuperAdmin, role_enum_1.Role.Admin, role_enum_1.Role.Manager),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Загрузить файл по URL' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof media_dto_1.UploadFromUrlDto !== "undefined" && media_dto_1.UploadFromUrlDto) === "function" ? _h : Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], MediaController.prototype, "uploadFromUrl", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SuperAdmin, role_enum_1.Role.Admin, role_enum_1.Role.Manager),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить медиафайл' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_k = typeof media_dto_1.UpdateMediaFileDto !== "undefined" && media_dto_1.UpdateMediaFileDto) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], MediaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.SuperAdmin, role_enum_1.Role.Admin, role_enum_1.Role.Manager),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Удалить медиафайл' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], MediaController.prototype, "delete", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [typeof (_a = typeof media_service_1.MediaService !== "undefined" && media_service_1.MediaService) === "function" ? _a : Object])
], MediaController);


/***/ }),
/* 51 */
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),
/* 52 */
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
exports.MediaFilesQueryDto = exports.UpdateMediaFileDto = exports.UploadFromUrlDto = void 0;
const class_validator_1 = __webpack_require__(31);
const class_transformer_1 = __webpack_require__(53);
class UploadFromUrlDto {
    url;
    alt;
}
exports.UploadFromUrlDto = UploadFromUrlDto;
__decorate([
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UploadFromUrlDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadFromUrlDto.prototype, "alt", void 0);
class UpdateMediaFileDto {
    alt;
}
exports.UpdateMediaFileDto = UpdateMediaFileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMediaFileDto.prototype, "alt", void 0);
class MediaFilesQueryDto {
    search;
    page;
    limit;
}
exports.MediaFilesQueryDto = MediaFilesQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MediaFilesQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], MediaFilesQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], MediaFilesQueryDto.prototype, "limit", void 0);


/***/ }),
/* 53 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 54 */
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductsController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(5);
const platform_express_1 = __webpack_require__(51);
const jwt_auth_guard_1 = __webpack_require__(24);
const role_enum_1 = __webpack_require__(25);
const roles_decorator_1 = __webpack_require__(26);
const roles_guard_1 = __webpack_require__(27);
const products_service_1 = __webpack_require__(37);
const product_dto_1 = __webpack_require__(55);
const products_csv_dto_1 = __webpack_require__(45);
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async findAll(filters) {
        return this.productsService.findAll(filters);
    }
    async findBySlug(slug) {
        return this.productsService.findBySlug(slug);
    }
    async findOne(id) {
        return this.productsService.findOne(id);
    }
    async create(dto) {
        return this.productsService.create(dto);
    }
    async importCsv(file, dto) {
        if (!file?.buffer) {
            throw new common_1.BadRequestException('CSV file is required');
        }
        return this.productsService.importCsv(file.buffer, dto);
    }
    async exportCsv(dto, res) {
        const { buffer, filename } = await this.productsService.exportCsv(dto);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return new common_1.StreamableFile(buffer);
    }
    async update(id, dto) {
        return this.productsService.update(id, dto);
    }
    async remove(id) {
        await this.productsService.remove(id);
    }
    async removeMany(dto) {
        return this.productsService.removeMany(dto);
    }
    async updateStatusMany(dto) {
        return this.productsService.updateStatusMany(dto);
    }
    async updateBrandMany(dto) {
        return this.productsService.updateBrandMany(dto);
    }
    async updateCategoryMany(dto) {
        return this.productsService.updateCategoryMany(dto);
    }
    async findAllDeleted(filters) {
        return this.productsService.findAllDeleted(filters);
    }
    async restore(id) {
        return this.productsService.restore(id);
    }
    async restoreMany(dto) {
        return this.productsService.restoreMany(dto);
    }
    async hardDelete(id) {
        await this.productsService.hardDelete(id);
    }
    async hardDeleteMany(dto) {
        return this.productsService.hardDeleteMany(dto);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ProductsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof product_dto_1.CreateProductDto !== "undefined" && product_dto_1.CreateProductDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import-csv'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof Express !== "undefined" && (_h = Express.Multer) !== void 0 && _h.File) === "function" ? _j : Object, typeof (_k = typeof products_csv_dto_1.ImportProductsCsvDto !== "undefined" && products_csv_dto_1.ImportProductsCsvDto) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], ProductsController.prototype, "importCsv", null);
__decorate([
    (0, common_1.Post)('export-csv'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof products_csv_dto_1.ExportProductsCsvDto !== "undefined" && products_csv_dto_1.ExportProductsCsvDto) === "function" ? _m : Object, Object]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], ProductsController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_p = typeof product_dto_1.UpdateProductDto !== "undefined" && product_dto_1.UpdateProductDto) === "function" ? _p : Object]),
    __metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('batch/delete'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_s = typeof product_dto_1.ProductIdsDto !== "undefined" && product_dto_1.ProductIdsDto) === "function" ? _s : Object]),
    __metadata("design:returntype", typeof (_t = typeof Promise !== "undefined" && Promise) === "function" ? _t : Object)
], ProductsController.prototype, "removeMany", null);
__decorate([
    (0, common_1.Patch)('batch/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_u = typeof product_dto_1.BatchUpdateProductStatusDto !== "undefined" && product_dto_1.BatchUpdateProductStatusDto) === "function" ? _u : Object]),
    __metadata("design:returntype", typeof (_v = typeof Promise !== "undefined" && Promise) === "function" ? _v : Object)
], ProductsController.prototype, "updateStatusMany", null);
__decorate([
    (0, common_1.Patch)('batch/brand'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_w = typeof product_dto_1.BatchUpdateProductBrandDto !== "undefined" && product_dto_1.BatchUpdateProductBrandDto) === "function" ? _w : Object]),
    __metadata("design:returntype", typeof (_x = typeof Promise !== "undefined" && Promise) === "function" ? _x : Object)
], ProductsController.prototype, "updateBrandMany", null);
__decorate([
    (0, common_1.Patch)('batch/category'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_y = typeof product_dto_1.BatchUpdateProductCategoryDto !== "undefined" && product_dto_1.BatchUpdateProductCategoryDto) === "function" ? _y : Object]),
    __metadata("design:returntype", typeof (_z = typeof Promise !== "undefined" && Promise) === "function" ? _z : Object)
], ProductsController.prototype, "updateCategoryMany", null);
__decorate([
    (0, common_1.Get)('trash/list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_0 = typeof Record !== "undefined" && Record) === "function" ? _0 : Object]),
    __metadata("design:returntype", typeof (_1 = typeof Promise !== "undefined" && Promise) === "function" ? _1 : Object)
], ProductsController.prototype, "findAllDeleted", null);
__decorate([
    (0, common_1.Post)('trash/:id/restore'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_2 = typeof Promise !== "undefined" && Promise) === "function" ? _2 : Object)
], ProductsController.prototype, "restore", null);
__decorate([
    (0, common_1.Post)('trash/batch/restore'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_3 = typeof product_dto_1.ProductIdsDto !== "undefined" && product_dto_1.ProductIdsDto) === "function" ? _3 : Object]),
    __metadata("design:returntype", typeof (_4 = typeof Promise !== "undefined" && Promise) === "function" ? _4 : Object)
], ProductsController.prototype, "restoreMany", null);
__decorate([
    (0, common_1.Delete)('trash/:id/permanent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_5 = typeof Promise !== "undefined" && Promise) === "function" ? _5 : Object)
], ProductsController.prototype, "hardDelete", null);
__decorate([
    (0, common_1.Post)('trash/batch/permanent-delete'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_6 = typeof product_dto_1.ProductIdsDto !== "undefined" && product_dto_1.ProductIdsDto) === "function" ? _6 : Object]),
    __metadata("design:returntype", typeof (_7 = typeof Promise !== "undefined" && Promise) === "function" ? _7 : Object)
], ProductsController.prototype, "hardDeleteMany", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('products'),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [typeof (_a = typeof products_service_1.ProductsService !== "undefined" && products_service_1.ProductsService) === "function" ? _a : Object])
], ProductsController);


/***/ }),
/* 55 */
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BatchUpdateProductCategoryDto = exports.BatchUpdateProductBrandDto = exports.BatchUpdateProductStatusDto = exports.ProductIdsDto = exports.UpdateProductDto = exports.CreateProductDto = void 0;
const swagger_1 = __webpack_require__(5);
const class_transformer_1 = __webpack_require__(53);
const class_validator_1 = __webpack_require__(31);
const client_1 = __webpack_require__(22);
class CreateProductDto {
    title;
    slug;
    sku;
    description;
    price;
    currency;
    status;
    stock;
    attributes;
    specs;
    brandId;
    categoryId;
    mainImageId;
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "sku", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProductStatus),
    __metadata("design:type", typeof (_a = typeof client_1.ProductStatus !== "undefined" && client_1.ProductStatus) === "function" ? _a : Object)
], CreateProductDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((_, value) => value !== null),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "stock", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], CreateProductDto.prototype, "attributes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], CreateProductDto.prototype, "specs", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "brandId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((_, value) => value !== null),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "mainImageId", void 0);
class UpdateProductDto extends (0, swagger_1.PartialType)(CreateProductDto) {
}
exports.UpdateProductDto = UpdateProductDto;
class ProductIdsDto {
    ids;
}
exports.ProductIdsDto = ProductIdsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], ProductIdsDto.prototype, "ids", void 0);
class BatchUpdateProductStatusDto extends ProductIdsDto {
    status;
}
exports.BatchUpdateProductStatusDto = BatchUpdateProductStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ProductStatus),
    __metadata("design:type", typeof (_d = typeof client_1.ProductStatus !== "undefined" && client_1.ProductStatus) === "function" ? _d : Object)
], BatchUpdateProductStatusDto.prototype, "status", void 0);
class BatchUpdateProductBrandDto extends ProductIdsDto {
    brandId;
}
exports.BatchUpdateProductBrandDto = BatchUpdateProductBrandDto;
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], BatchUpdateProductBrandDto.prototype, "brandId", void 0);
class BatchUpdateProductCategoryDto extends ProductIdsDto {
    categoryId;
}
exports.BatchUpdateProductCategoryDto = BatchUpdateProductCategoryDto;
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateIf)((_, value) => value !== null),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", Object)
], BatchUpdateProductCategoryDto.prototype, "categoryId", void 0);


/***/ }),
/* 56 */
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequestsController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(5);
const request_dto_1 = __webpack_require__(57);
const requests_service_1 = __webpack_require__(58);
let RequestsController = class RequestsController {
    requestsService;
    constructor(requestsService) {
        this.requestsService = requestsService;
    }
    async create(dto) {
        return this.requestsService.create(dto);
    }
};
exports.RequestsController = RequestsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof request_dto_1.CreateRequestDto !== "undefined" && request_dto_1.CreateRequestDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], RequestsController.prototype, "create", null);
exports.RequestsController = RequestsController = __decorate([
    (0, swagger_1.ApiTags)('requests'),
    (0, common_1.Controller)('requests'),
    __metadata("design:paramtypes", [typeof (_a = typeof requests_service_1.RequestsService !== "undefined" && requests_service_1.RequestsService) === "function" ? _a : Object])
], RequestsController);


/***/ }),
/* 57 */
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
exports.CreateRequestDto = void 0;
const class_transformer_1 = __webpack_require__(53);
const class_validator_1 = __webpack_require__(31);
const trimValue = ({ value }) => {
    if (typeof value !== 'string')
        return value;
    return value.trim();
};
const trimOptionalValue = ({ value }) => {
    if (typeof value !== 'string')
        return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
};
class CreateRequestDto {
    name;
    email;
    phone;
    company;
    productName;
    quantity;
    description;
}
exports.CreateRequestDto = CreateRequestDto;
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "phone", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimOptionalValue),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "company", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimValue),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "productName", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateRequestDto.prototype, "quantity", void 0);
__decorate([
    (0, class_transformer_1.Transform)(trimOptionalValue),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRequestDto.prototype, "description", void 0);


/***/ }),
/* 58 */
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
exports.RequestsService = void 0;
const common_1 = __webpack_require__(1);
const requests_repository_1 = __webpack_require__(59);
let RequestsService = class RequestsService {
    requestsRepository;
    constructor(requestsRepository) {
        this.requestsRepository = requestsRepository;
    }
    async create(dto) {
        return this.requestsRepository.create(dto);
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof requests_repository_1.RequestsRepository !== "undefined" && requests_repository_1.RequestsRepository) === "function" ? _a : Object])
], RequestsService);


/***/ }),
/* 59 */
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
exports.RequestsRepository = void 0;
const common_1 = __webpack_require__(1);
const prisma_service_1 = __webpack_require__(21);
let RequestsRepository = class RequestsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.supplyRequest.create({
            data: dto,
            select: {
                id: true,
                createdAt: true,
            },
        });
    }
};
exports.RequestsRepository = RequestsRepository;
exports.RequestsRepository = RequestsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], RequestsRepository);


/***/ }),
/* 60 */
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
exports.catalogValidationSchema = void 0;
const Joi = __importStar(__webpack_require__(61));
exports.catalogValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    CATALOG_HTTP_PORT: Joi.number().port().required(),
    CATALOG_GRPC_PORT: Joi.number().port().required(),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().min(16).default('change-me-please-change-me'),
    CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
    REDIS_URL: Joi.string().uri().optional(),
    MINIO_ENDPOINT: Joi.string().default('localhost'),
    MINIO_PORT: Joi.number().port().default(9000),
    MINIO_ROOT_USER: Joi.string().default('minioadmin'),
    MINIO_ROOT_PASSWORD: Joi.string().default('minioadmin'),
    MINIO_BUCKET: Joi.string().default('ponatech-media'),
    MINIO_USE_SSL: Joi.boolean().default(false),
});


/***/ }),
/* 61 */
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
const swagger_1 = __webpack_require__(5);
const node_path_1 = __webpack_require__(6);
const common_2 = __webpack_require__(7);
const app_module_1 = __webpack_require__(18);
const catalog_grpc_1 = __webpack_require__(47);
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
    const grpcPort = configService.getOrThrow('CATALOG_GRPC_PORT');
    const httpPort = configService.getOrThrow('CATALOG_HTTP_PORT');
    app.connectMicroservice({
        transport: microservices_1.Transport.GRPC,
        options: {
            url: `0.0.0.0:${grpcPort}`,
            package: catalog_grpc_1.CATALOG_PROTO_PACKAGE,
            protoPath: (0, node_path_1.join)(process.cwd(), 'proto', 'catalog.proto'),
            loader: {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
            },
        },
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Pona Tech Catalog API')
        .setDescription('Catalog service REST API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.startAllMicroservices();
    await app.listen(httpPort);
    logger.log('Catalog service started', { httpPort, grpcPort });
}
void bootstrap();
const parseCorsOrigins = (value) => {
    if (!value || value.trim() === '' || value === '*') {
        return true;
    }
    return value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
};

})();

/******/ })()
;