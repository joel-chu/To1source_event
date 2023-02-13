// re-usable types
export type GenericFn = (...args: Array<unknown>) => void

export type ClassConfig = {
  keep?: boolean
  logger?: GenericFn
}

export type EvtName = string | symbol

export type StoreContent = any // @TODO
export type StoreType = Map<EvtName, StoreContent>

export type CallbackType<T, S> = (...args: T) => S 
