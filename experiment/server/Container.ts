import Item from './Item'
import NetworkSync from '../common/NetworkSync'

@NetworkSync('contents')
export default class Container {
  public contents: Item[] = []
}
