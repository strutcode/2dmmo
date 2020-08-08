export default class Logger {
  public out(category: string, message: any, ...params: any[]) {
    console.log(`[DBUG] <${category}>`, message, ...params)
  }

  public info(category: string, message: any, ...params: any[]) {
    console.log(`[INFO] <${category}>`, message, ...params)
  }

  public warn(category: string, message: any, ...params: any[]) {
    console.log(`[WARN] <${category}>`, message, ...params)
  }

  public error(category: string, message: any, ...params: any[]) {
    console.log(`[FAIL] <${category}>`, message, ...params)
  }
}
