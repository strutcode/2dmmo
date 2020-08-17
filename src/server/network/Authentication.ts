import { readFileSync } from 'fs'
import { JWK, JWT } from 'jose'

export interface AuthToken {
  sub: string
}

export default class Authentication {
  private static key: JWK.Key

  public static init() {
    log.info('Security', 'Loading authentication keys...')
    this.key = JWK.asKey(readFileSync('keys/jwt'))
  }

  public static createToken(id: string) {
    return JWT.sign({ sub: id }, this.key)
  }

  public static verifyToken(token: string): AuthToken {
    return JWT.verify(token, this.key) as AuthToken
  }
}
