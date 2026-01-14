// Original file: proto/catalog.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { BrandResponse as _catalog_BrandResponse, BrandResponse__Output as _catalog_BrandResponse__Output } from '../catalog/BrandResponse';
import type { GetBrandByIdRequest as _catalog_GetBrandByIdRequest, GetBrandByIdRequest__Output as _catalog_GetBrandByIdRequest__Output } from '../catalog/GetBrandByIdRequest';
import type { GetProductByIdRequest as _catalog_GetProductByIdRequest, GetProductByIdRequest__Output as _catalog_GetProductByIdRequest__Output } from '../catalog/GetProductByIdRequest';
import type { ProductResponse as _catalog_ProductResponse, ProductResponse__Output as _catalog_ProductResponse__Output } from '../catalog/ProductResponse';

export interface CatalogInternalServiceClient extends grpc.Client {
  GetBrandById(argument: _catalog_GetBrandByIdRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_catalog_BrandResponse__Output>): grpc.ClientUnaryCall;
  GetBrandById(argument: _catalog_GetBrandByIdRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_catalog_BrandResponse__Output>): grpc.ClientUnaryCall;
  GetBrandById(argument: _catalog_GetBrandByIdRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_catalog_BrandResponse__Output>): grpc.ClientUnaryCall;
  GetBrandById(argument: _catalog_GetBrandByIdRequest, callback: grpc.requestCallback<_catalog_BrandResponse__Output>): grpc.ClientUnaryCall;
  getBrandById(argument: _catalog_GetBrandByIdRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_catalog_BrandResponse__Output>): grpc.ClientUnaryCall;
  getBrandById(argument: _catalog_GetBrandByIdRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_catalog_BrandResponse__Output>): grpc.ClientUnaryCall;
  getBrandById(argument: _catalog_GetBrandByIdRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_catalog_BrandResponse__Output>): grpc.ClientUnaryCall;
  getBrandById(argument: _catalog_GetBrandByIdRequest, callback: grpc.requestCallback<_catalog_BrandResponse__Output>): grpc.ClientUnaryCall;
  
  GetProductById(argument: _catalog_GetProductByIdRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_catalog_ProductResponse__Output>): grpc.ClientUnaryCall;
  GetProductById(argument: _catalog_GetProductByIdRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_catalog_ProductResponse__Output>): grpc.ClientUnaryCall;
  GetProductById(argument: _catalog_GetProductByIdRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_catalog_ProductResponse__Output>): grpc.ClientUnaryCall;
  GetProductById(argument: _catalog_GetProductByIdRequest, callback: grpc.requestCallback<_catalog_ProductResponse__Output>): grpc.ClientUnaryCall;
  getProductById(argument: _catalog_GetProductByIdRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_catalog_ProductResponse__Output>): grpc.ClientUnaryCall;
  getProductById(argument: _catalog_GetProductByIdRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_catalog_ProductResponse__Output>): grpc.ClientUnaryCall;
  getProductById(argument: _catalog_GetProductByIdRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_catalog_ProductResponse__Output>): grpc.ClientUnaryCall;
  getProductById(argument: _catalog_GetProductByIdRequest, callback: grpc.requestCallback<_catalog_ProductResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface CatalogInternalServiceHandlers extends grpc.UntypedServiceImplementation {
  GetBrandById: grpc.handleUnaryCall<_catalog_GetBrandByIdRequest__Output, _catalog_BrandResponse>;
  
  GetProductById: grpc.handleUnaryCall<_catalog_GetProductByIdRequest__Output, _catalog_ProductResponse>;
  
}

export interface CatalogInternalServiceDefinition extends grpc.ServiceDefinition {
  GetBrandById: MethodDefinition<_catalog_GetBrandByIdRequest, _catalog_BrandResponse, _catalog_GetBrandByIdRequest__Output, _catalog_BrandResponse__Output>
  GetProductById: MethodDefinition<_catalog_GetProductByIdRequest, _catalog_ProductResponse, _catalog_GetProductByIdRequest__Output, _catalog_ProductResponse__Output>
}
