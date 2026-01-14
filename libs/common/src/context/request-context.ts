import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  traceId: string;
  userId?: string;
}

export class RequestContextStorage {
  private static readonly storage = new AsyncLocalStorage<RequestContext>();

  static run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  static get(): RequestContext | undefined {
    return this.storage.getStore();
  }
}
