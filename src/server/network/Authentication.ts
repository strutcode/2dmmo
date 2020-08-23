import { existsSync, readFileSync, writeFileSync } from 'fs'
import { JWK, JWT } from 'jose'

export interface AuthToken {
  sub: string
}

export default class Authentication {
  private static key: JWK.Key

  public static init() {
    log.info('Security', 'Loading authentication keys...')
    if (existsSync('keys/jwt')) {
      this.key = JWK.asKey(readFileSync('keys/jwt'))
    } else {
      log.warn('Security', 'No authentication key found, generating one...')
      this.key = JWK.generateSync('EC', 'P-521')

      const prvKey = this.key.toPEM(true)
      const pubKey = this.key.toPEM(false)

      writeFileSync('keys/jwt', prvKey)
      writeFileSync('keys/jwt.pub', pubKey)
    }
  }

  public static createToken(id: string) {
    return JWT.sign({ sub: id }, this.key)
  }

  public static verifyToken(token: string): AuthToken {
    return JWT.verify(token, this.key) as AuthToken
  }
}
