type Logger = InstanceType<typeof import('../src/server/util/Logger').default>

declare const log: Logger

declare module NodeJS {
  interface Global {
    log: Logger
  }
}

interface Window {
  log: InstanceType<typeof import('../src/client/util/Logger').default>
}
