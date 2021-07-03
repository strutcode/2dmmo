import Component from '../../../common/engine/Component'

type Quest = {
  name: string
  variables: Record<string, number>
}

export default class Player extends Component {
  public mainQuest?: Quest
  public sideQuests: Quest[] = []
}
