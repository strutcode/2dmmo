const magic = 42

export default class Uid {
  public static from(value: number): string {
    return ((magic << 27) + value).toString(36)
  }
}
