declare module "@to1source/event" {

  export type CallbackFn = (...args: any[]) => any
  export type ContextObj = any
  export type LoggerFn = (...args: Array<string | number>) => void

  export class BaseClass {
    constructor(config?: { logger:  LoggerFn})
    logger(): void
    get $name(): string
  }

  export class StoreService extends BaseClass {
    constructor(config?: { logger: LoggerFn })
  }

  export class SuspendClass extends StoreService {
    constructor(config?: { logger: LoggerFn })
    // SuspendClass
    $suspend(): void
    $release(): void
    $suspendEvent(...patterns: Array<string | RegExp>): boolean | number
    $releaseEvent(...patterns: Array<string | RegExp>): number
    $queue(evt: string, ...args: Array<any>): boolean | number
    get $queues(): Array<any>
  }
  // instead of using the generic EventClass we use the export name 
  export class To1sourceEvent extends SuspendClass {
    constructor(config?: { logger: LoggerFn })
    $on(evt: string, callback: CallbackFn, context: ContextObj): number
    $once(evt: string, callback: CallbackFn, context: ContextObj): boolean | undefined
    $only(evt: string, callback: CallbackFn, context: ContextObj): boolean
    $onlyOnce(evt: string, callback: CallbackFn, context: ContextObj): boolean
    $max(evt: string, max: number, context: ContextObj): CallbackFn
    $replace(evt: string, callback: CallbackFn, context: ContextObj, type: string): any
    $trigger(evt: string, payload: Array<any>, context: ContextObj, type: string | boolean): number
    $call(evt: string, type: string | boolean, context: ContextObj): CallbackFn
    $off(evt: string): boolean
    $get(evt: string, full: boolean): any
    $debug(idx: number | null): void
    get $done(): any
  }

}
