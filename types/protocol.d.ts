declare type NetworkId = string

declare interface NetworkMobile {
  id: NetworkId
  name: string
  sprite: string
  x: number
  y: number
  hp: number
}

declare interface NetworkProtocol {
  Client: {
    player: {
      login: {
        username: string
        password: string
      }
      input: {
        name: string
      }
    }
  }
  Server: {
    player: {
      login: NetworkMobile
    }
    mobile: {
      add: NetworkMobile
      update: Partial<NetworkMobile>
      remove: NetworkId
    }
  }
}
