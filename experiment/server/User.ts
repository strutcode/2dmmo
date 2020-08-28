import Character from './Character'
import NetworkSync from '../common/NetworkSync'

@NetworkSync('name', 'activeCharacter', 'characterNames')
export default class User {
  public name = ''
  public activeCharacter?: Character = undefined
  public characters: Character[] = []

  public get characterNames(): string[] {
    return this.characters.map(char => char.name)
  }
}
