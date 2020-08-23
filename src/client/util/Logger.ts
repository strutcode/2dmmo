enum LogLevel {
  DEBUG,
  INFO,
  WARNING,
  ERROR,
  SILENT,
}

export default class Logger {
  private level = LogLevel.DEBUG

  public out(category: string, message: any, ...params: any[]) {
    if (this.level > LogLevel.DEBUG) return

    console.log(
      `%c DEBUG %c ${category.padStart(10, ' ')} %c`,
      'background: #778899; color: #ddd',
      'background: #2F4F4F; color: #ddd',
      'color: initial',
      message,
      ...params,
    )
  }

  public info(category: string, message: any, ...params: any[]) {
    if (this.level > LogLevel.INFO) return

    console.log(
      `%c  INFO %c ${category.padStart(10, ' ')} %c`,
      'background: #1E90FF; color: #ddd',
      'background: #2F4F4F; color: #ddd',
      'color: initial',
      message,
      ...params,
    )
  }

  public warn(category: string, message: any, ...params: any[]) {
    if (this.level > LogLevel.WARNING) return

    console.log(
      `%c  WARN %c ${category.padStart(10, ' ')} %c`,
      'color: #DAA520; color: #ddd',
      'background: #2F4F4F; color: #ddd',
      'color: initial',
      message,
      ...params,
    )
  }

  public error(category: string, message: any, ...params: any[]) {
    if (this.level > LogLevel.ERROR) return

    console.log(
      `%c  FAIL %c ${category.padStart(10, ' ')} %c`,
      'color: #B22222; color: #ddd',
      'background: #2F4F4F; color: #ddd',
      'color: initial',
      message,
      ...params,
    )
  }
}
