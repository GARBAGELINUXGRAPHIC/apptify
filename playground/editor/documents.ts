import { defineAsyncComponent, type Component } from 'vue'
import type { ComponentDocument } from './contract'
import { componentMetadata } from './component-metadata'
/** Lightweight route directory. Each document is downloaded only on its own page. */
export interface DocumentRegistration {
  name: string
  label: string
  description: string
  group: string
  preview?: Component
  load: () => Promise<{ default: ComponentDocument }>
}
const handbooks = import.meta.glob<{ default: ComponentDocument }>('./handbooks/apple-*.ts')
export const componentDocuments: Record<string, DocumentRegistration> = Object.fromEntries(Object.entries(componentMetadata).map(([name, item]) => {
  const slug = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  return [slug, {
    name, ...item,
    load: handbooks[`./handbooks/${slug}.ts`],
  }]
}))
Object.assign(componentDocuments, {
  'apple-input': {
    name: 'AppleInput', label: '输入框', group: '表单',
    description: '从输入、反馈到辅助操作，逐条了解输入框的行为与接口。',
    preview: defineAsyncComponent(() => import('./AppleInputPreview.vue')),
    load: () => import('./apple-input'),
  },
} satisfies Record<string, DocumentRegistration>)
export const componentDocumentPath = (slug: string) => `/component-docs/${slug}`
