import { readFileSync } from 'fs'
import { JWK, JWT } from 'jose'

export default class Authentication {
  private static key: JWK.Key

  public static init() {
    log.info('Security', 'Loading authentication keys...')
    this.key = JWK.asKey(readFileSync('keys/jwt'))
  }

  public static createToken(id: string) {
    return JWT.sign({ sub: id }, this.key)
  }

  public static verifyToken(token: string) {
    return JWT.verify(token, this.key)
  }
}
