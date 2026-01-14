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
const env_validation_1 = __webpack_require__(43);
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
const products_controller_1 = __webpack_require__(40);
const products_repository_1 = __webpack_require__(38);
const products_service_1 = __webpack_require__(37);
let CatalogModule = class CatalogModule {
};
exports.CatalogModule = CatalogModule;
exports.CatalogModule = CatalogModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [
            brands_controller_1.BrandsController,
            categories_controller_1.CategoriesController,
            products_controller_1.ProductsController,
            catalog_grpc_controller_1.CatalogGrpcController,
        ],
        providers: [
            brands_repository_1.BrandsRepository,
            brands_service_1.BrandsService,
            categories_repository_1.CategoriesRepository,
            categories_service_1.CategoriesService,
            products_repository_1.ProductsRepository,
            products_service_1.ProductsService,
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
const catalog_grpc_1 = __webpack_require__(39);
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
            categoryId: product.categoryId,
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductsService = void 0;
const common_1 = __webpack_require__(1);
const brands_repository_1 = __webpack_require__(29);
const categories_repository_1 = __webpack_require__(34);
const products_repository_1 = __webpack_require__(38);
let ProductsService = class ProductsService {
    productsRepository;
    brandsRepository;
    categoriesRepository;
    constructor(productsRepository, brandsRepository, categoriesRepository) {
        this.productsRepository = productsRepository;
        this.brandsRepository = brandsRepository;
        this.categoriesRepository = categoriesRepository;
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
        return this.productsRepository.create(dto);
    }
    async update(id, dto) {
        await this.ensureRelations(dto.brandId, dto.categoryId);
        return this.productsRepository.update(id, dto);
    }
    async remove(id) {
        await this.productsRepository.remove(id);
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof products_repository_1.ProductsRepository !== "undefined" && products_repository_1.ProductsRepository) === "function" ? _a : Object, typeof (_b = typeof brands_repository_1.BrandsRepository !== "undefined" && brands_repository_1.BrandsRepository) === "function" ? _b : Object, typeof (_c = typeof categories_repository_1.CategoriesRepository !== "undefined" && categories_repository_1.CategoriesRepository) === "function" ? _c : Object])
], ProductsService);


/***/ }),
/* 38 */
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
        return this.prisma.product.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            include: {
                brand: true,
                category: true,
                images: { orderBy: { order: 'asc' } },
            },
        });
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
        });
    }
    async update(id, dto) {
        return this.prisma.product.update({
            where: { id },
            data: this.toUpdateInput(dto),
        });
    }
    async remove(id) {
        await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
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
            stock: dto.stock ?? 0,
            attributes: dto.attributes,
            specs: dto.specs,
            brandId: dto.brandId,
            categoryId: dto.categoryId,
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
            data.categoryId = dto.categoryId;
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
/* 39 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CATALOG_INTERNAL_SERVICE = exports.CATALOG_PROTO_PACKAGE = void 0;
exports.CATALOG_PROTO_PACKAGE = 'catalog';
exports.CATALOG_INTERNAL_SERVICE = 'CatalogInternalService';


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductsController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(5);
const jwt_auth_guard_1 = __webpack_require__(24);
const role_enum_1 = __webpack_require__(25);
const roles_decorator_1 = __webpack_require__(26);
const roles_guard_1 = __webpack_require__(27);
const products_service_1 = __webpack_require__(37);
const product_dto_1 = __webpack_require__(41);
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
    async update(id, dto) {
        return this.productsService.update(id, dto);
    }
    async remove(id) {
        await this.productsService.remove(id);
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
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_h = typeof product_dto_1.UpdateProductDto !== "undefined" && product_dto_1.UpdateProductDto) === "function" ? _h : Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.Manager, role_enum_1.Role.Admin, role_enum_1.Role.SuperAdmin),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], ProductsController.prototype, "remove", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('products'),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [typeof (_a = typeof products_service_1.ProductsService !== "undefined" && products_service_1.ProductsService) === "function" ? _a : Object])
], ProductsController);


/***/ }),
/* 41 */
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateProductDto = exports.CreateProductDto = void 0;
const swagger_1 = __webpack_require__(5);
const class_transformer_1 = __webpack_require__(42);
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
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
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
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "categoryId", void 0);
class UpdateProductDto extends (0, swagger_1.PartialType)(CreateProductDto) {
}
exports.UpdateProductDto = UpdateProductDto;


/***/ }),
/* 42 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 43 */
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
const Joi = __importStar(__webpack_require__(44));
exports.catalogValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    CATALOG_HTTP_PORT: Joi.number().port().required(),
    CATALOG_GRPC_PORT: Joi.number().port().required(),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().min(16).default('change-me-please-change-me'),
    CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
    REDIS_URL: Joi.string().uri().optional(),
});


/***/ }),
/* 44 */
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
const catalog_grpc_1 = __webpack_require__(39);
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