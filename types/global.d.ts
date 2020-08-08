type Logger = InstanceType<typeof import('../src/server/util/Logger').default>

declare const log: Logger

declare module NodeJS {
  interface Global {
    log: Logger
  }
}
