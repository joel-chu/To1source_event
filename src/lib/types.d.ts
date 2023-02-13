// re-usable types
export type GenericFn = (...args: Array<unknown>) => void

export type ClassConfig = {
  keep?: boolean
  logger?: GenericFn
}
// when using symbol as event name it must re-use the same symbol
export type EvtName = string | symbol
export type StoreContentType<T, S> = string | symbol | CallbackType<T, S> | Set<unknown> | null
// because the content is not fixed, so we delegate the typing to the callee
export type StoreContent = Array<unknown>
export type StoreType = Map<EvtName, StoreContent>

export type CallbackType<T, S> = (...args: T) => S
