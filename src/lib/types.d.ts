// re-usable types
export type GenericFn = (...args: Array<unknown>) => void

export type ClassConfig = {
  keep?: boolean
  logger?: GenericFn
}
// We can't use symbol as event name because we lost the absility to regex search in store
export type EvtName = string

// because the content is not fixed, so we delegate the typing to the callee
export type StoreContent = Array<unknown>
export type StoreType = Map<EvtName, StoreContent>

export type CallbackType<T, S> = (...args: T) => S

export type ContextType = any | null

export type StoreContentType = Set<unknown> | string | null

export declare type CallbackHandler = (this: unknown, ...args: unknown[]) => unknown

export declare type StoreNameKey = 'lazyStore' | 'normalStore'
