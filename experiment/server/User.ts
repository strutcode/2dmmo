import NetworkSync from '../common/NetworkSync'
import Character from './Character'

@NetworkSync('activeCharacter', 'characterNames')
export default class User {
  public activeCharacter?: Character = undefined
  public characters: Character[] = []

  public get characterNames(): string[] {
    return this.characters.map(char => char.name)
  }
}
