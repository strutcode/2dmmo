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
      `${' DBUG '.inverse}${` ${category.padStart(10, ' ')} `.bgBlue}`,
      message,
      ...params,
    )
  }

  public info(category: string, message: any, ...params: any[]) {
    this.log(
      `${' INFO '.bgCyan}${` ${category.padStart(10, ' ')} `.bgBlue}`,
      message,
      ...params,
    )
  }

  public warn(category: string, message: any, ...params: any[]) {
    this.log(
      `${' WARN '.bgYellow.black}${` ${category.padStart(10, ' ')} `.bgBlue}`,
      message,
      ...params,
    )
  }

  public error(category: string, message: any, ...params: any[]) {
    this.log(
      `${' FAIL '.bgRed}${` ${category.padStart(10, ' ')} `.bgBlue}`,
      message,
      ...params,
    )
  }
}
