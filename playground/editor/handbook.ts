import type { ApiDefinition, ComponentDocument } from './contract'

type Definition = Omit<ComponentDocument, 'props' | 'events' | 'slots' | 'methods'> & {
  props: (ApiDefinition & { required?: boolean })[]
  events: ApiDefinition[]
  slots: ApiDefinition[]
  methods: ApiDefinition[]
}

export function defineHandbook(definition: Definition): ComponentDocument {
  const entries = (group: string, list: ApiDefinition[]) => list.map(entry => ({
    ...entry,
    id: `${group}-${entry.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[^\w-]+/g, '-').replace(/-+$/, '').toLowerCase()}`,
  }))
  return {
    ...definition,
    props: entries('prop', definition.props),
    events: entries('event', definition.events),
    slots: entries('slot', definition.slots),
    methods: entries('method', definition.methods),
  }
}
