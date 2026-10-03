import type { ComponentDocument } from './contract'
/** One section map drives both document content and its API navigation tree. */
export function documentSections(doc: ComponentDocument) {
  return [
    { id: 'props', kicker: 'PROPS', title: '属性', entries: doc.props },
    { id: 'events', kicker: 'EVENTS', title: '事件', entries: doc.events },
    { id: 'slots', kicker: 'SLOTS', title: '插槽', entries: doc.slots },
    { id: 'methods', kicker: 'METHODS', title: '公开方法', entries: doc.methods },
  ].filter(section => section.entries.length)
}
