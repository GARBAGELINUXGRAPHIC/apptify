/** Public API descriptions are required; component-specific runnable examples are optional. */
export interface VueExample { title: string; description: string; code: string }
export interface ApiDefinition { name: string; type: string; default?: string; description: string }
export interface ApiEntry extends ApiDefinition { id: string; example?: VueExample }
export interface ComponentDocument {
  name: string
  source: string
  props: ApiEntry[]
  events: ApiEntry[]
  slots: ApiEntry[]
  methods: ApiEntry[]
  notes: string[]
  implementation?: { files: Record<string, string>; activeFile: string; description: string }
}
