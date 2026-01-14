import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { CatalogInternalServiceClient as _catalog_CatalogInternalServiceClient, CatalogInternalServiceDefinition as _catalog_CatalogInternalServiceDefinition } from './catalog/CatalogInternalService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  catalog: {
    BrandResponse: MessageTypeDefinition
    CatalogInternalService: SubtypeConstructor<typeof grpc.Client, _catalog_CatalogInternalServiceClient> & { service: _catalog_CatalogInternalServiceDefinition }
    GetBrandByIdRequest: MessageTypeDefinition
    GetProductByIdRequest: MessageTypeDefinition
    ProductResponse: MessageTypeDefinition
  }
}

