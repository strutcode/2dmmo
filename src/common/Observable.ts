type Callback<T extends (...args: any[]) => void> = (
  ...args: Parameters<T>
) => void

export default class Observable<T extends (...args: any[]) => void> {
  private listeners: Array<Callback<T>> = []

  public observe(callback: Callback<T>): void {
    this.listeners.push(callback)
  }

  public notify(...args: Parameters<T>): void {
    this.listeners.forEach((callback) => callback(...args))
  }
}
