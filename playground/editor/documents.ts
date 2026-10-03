import { defineAsyncComponent, type Component } from 'vue'
import type { ComponentDocument } from './contract'
/** Lightweight route directory. Each document is downloaded only on its own page. */
export interface DocumentRegistration {
  name: string
  label: string
  description: string
  group: string
  preview?: Component
  load: () => Promise<{ default: ComponentDocument }>
}
export const componentDocuments: Record<string, DocumentRegistration> = {
  'apple-input': {
    name: 'AppleInput', label: '输入框', group: '表单',
    description: '从输入、反馈到辅助操作，逐条了解输入框的行为与接口。',
    preview: defineAsyncComponent(() => import('./AppleInputPreview.vue')),
    load: () => import('./apple-input'),
  },
}
export const componentDocumentPath = (slug: string) => `/component-docs/${slug}`
