import NetworkSync from "../common/NetworkSync";

@NetworkSync('name')
export default class Item {
  constructor(public name: string) {}
}
