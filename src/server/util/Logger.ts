import 'colors'

export default class Logger {
  private log: typeof global.console.log

  constructor() {
    this.log = global.console.log
    global.console.log = (message: any, ...args: any[]) => {
      this.info('External', message, ...args)
    }
  }
  public out(category: string, message: any, ...params: any[]) {
    this.log(
      `${'DBUG'.black.bgWhite} [${category.padStart(10, ' ')}]`,
      message,
      ...params,
    )
  }

  public info(category: string, message: any, ...params: any[]) {
    this.log(
      `${'INFO'.bgBlue} [${category.padStart(10, ' ')}]`,
      message,
      ...params,
    )
  }

  public warn(category: string, message: any, ...params: any[]) {
    this.log(
      `${'WARN'.bgYellow} [${category.padStart(10, ' ')}]`,
      message,
      ...params,
    )
  }

  public error(category: string, message: any, ...params: any[]) {
    this.log(
      `${'FAIL'.bgRed} [${category.padStart(10, ' ')}]`,
      message,
      ...params,
    )
  }
}
