export default class Logger {
  public out(msg: any, ...params: any[]) {
    console.log(`[DBUG] ${msg}`, ...params)
  }

  public info(msg: any, ...params: any[]) {
    console.log(`[INFO] ${msg}`, ...params)
  }

  public warn(msg: any, ...params: any[]) {
    console.log(`[WARN] ${msg}`, ...params)
  }

  public error(msg: any, ...params: any[]) {
    console.log(`[FAIL] ${msg}`, ...params)
  }
}
