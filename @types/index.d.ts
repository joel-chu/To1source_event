declare module "@to1source/event" {
  export class BaseClass {
    constructor(config?: { logger: (...args: string | number) => void })
    logger(): void
    get $name(): string
  }

  export class StoreService extends BaseClass {
    constructor(config?: { logger: (...args: string | number) => void })
  }

  export class SuspendClass extends StoreService {
    constructor(config?: { logger: (...args: string | number) => void })
    // SuspendClass
    $suspend(): void
    $release(): void
    $suspendEvent(...patterns: Array<string | RegExp>): boolean | number
    $releaseEvent(...patterns: Array<string | RegExp>): number
    $queue(evt: string, ...args: Array<any>): boolean | number
    get $queues(): Array<any>
  }

  export class EventService extends SuspendClass {
    constructor(config?: { logger: (...args: string | number) => void })
    

  }

}
