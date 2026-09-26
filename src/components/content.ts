import { defineComponent, h, useId, type PropType, type VNodeChild } from 'vue'
import { AlertCircle, ArrowUp, Check, ChevronDown, ChevronLeft, ChevronRight, Inbox, Info, LoaderCircle, MoreHorizontal, Pause, Play, X } from 'lucide-vue-next'

export type AppleValue = string | number
export interface AppleItem { label: string; value: AppleValue; disabled?: boolean; description?: string; href?: string; content?: string }
export interface AppleColumn { key: string; label: string; sortable?: boolean; align?: 'left' | 'center' | 'right'; width?: string }
export interface AppleTreeItem extends AppleItem { children?: AppleTreeItem[] }
export interface AppleAvatarItem { name: string; src?: string; value?: AppleValue }
export interface AppleSlide extends AppleItem { src?: string; alt?: string }
export interface AppleTimelineItem extends AppleItem { time?: string; tone?: 'default' | 'success' | 'danger' }
type Motion = 'inherit' | 'auto' | 'full' | 'reduced' | 'none'
type Row = Record<string, unknown>
const motionProps = { motion: { type: String as PropType<Motion>, default: 'inherit' } }
const itemProps = { items: { type: Array as PropType<AppleItem[]>, default: () => [] } }
const valueProp = { type: [String, Number] as PropType<AppleValue>, default: undefined }
const icon = (component: typeof Check, size = 18) => h(component, { size, 'aria-hidden': 'true', focusable: 'false' })
const percent = (value: number, max: number) => Math.max(0, Math.min(100, max > 0 ? value / max * 100 : 0))
const uidSetup = () => ({ uid: useId() })

export const AppleTabs = defineComponent({
  name: 'AppleTabs', setup: uidSetup,
  props: { ...motionProps, ...itemProps, modelValue: valueProp, label: { type: String, default: '内容分类' }, disabled: Boolean },
  emits: ['update:modelValue', 'change'],
  data: () => ({ localValue: undefined as AppleValue | undefined }),
  computed: {
    activeValue(): AppleValue | undefined { const value = this.modelValue ?? this.localValue; return this.items.find(item => item.value === value && !item.disabled)?.value ?? this.items.find(item => !item.disabled)?.value },
    activeItem(): AppleItem | undefined { return this.items.find(item => item.value === this.activeValue) },
  },
  methods: {
    select(item: AppleItem) {
      if (this.disabled || item.disabled) return
      this.localValue = item.value
      this.$emit('update:modelValue', item.value)
      this.$emit('change', item.value)
    },
    keydown(event: KeyboardEvent, index: number) {
      const enabled = this.items.map((item, i) => !item.disabled ? i : -1).filter(i => i >= 0)
      if (!enabled.length || this.disabled) return
      const current = enabled.indexOf(index)
      let next: number | undefined
      if (event.key === 'ArrowRight') next = enabled[(current + 1) % enabled.length]
      if (event.key === 'ArrowLeft') next = enabled[(current - 1 + enabled.length) % enabled.length]
      if (event.key === 'Home') next = enabled[0]
      if (event.key === 'End') next = enabled[enabled.length - 1]
      if (next === undefined) return
      event.preventDefault()
      this.select(this.items[next]!)
      const buttons = (this.$refs.tablist as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]')
      buttons[next]?.focus()
    },
  },
  render() {
    return h('div', { class: 'apple-tabs', 'data-motion': this.motion }, [
      h('div', { class: 'apple-tabs__list', role: 'tablist', 'aria-label': this.label, ref: 'tablist' }, this.items.map((item, index) => h('button', {
        type: 'button', id: `${this.uid}-tab-${index}`, role: 'tab', class: ['apple-tabs__tab', { 'is-active': item.value === this.activeValue }],
        'aria-selected': item.value === this.activeValue, 'aria-controls': `${this.uid}-panel`, disabled: this.disabled || item.disabled,
        tabindex: item.value === this.activeValue ? 0 : -1, onClick: () => this.select(item), onKeydown: (event: KeyboardEvent) => this.keydown(event, index),
      }, item.label))),
      h('div', { id: `${this.uid}-panel`, class: 'apple-tabs__panel', role: 'tabpanel', tabindex: 0, 'aria-labelledby': this.activeItem ? `${this.uid}-tab-${this.items.findIndex(item => item.value === this.activeValue)}` : undefined, 'aria-label': !this.activeItem ? this.label : undefined },
        this.$slots[`panel-${this.activeValue}`]?.({ item: this.activeItem }) ?? this.$slots.default?.({ item: this.activeItem, value: this.activeValue })),
    ])
  },
})

export const AppleBreadcrumbs = defineComponent({
  name: 'AppleBreadcrumbs', props: { ...motionProps, ...itemProps, label: { type: String, default: '当前位置' } },
  render() {
    return h('nav', { class: 'apple-breadcrumbs', 'aria-label': this.label, 'data-motion': this.motion }, h('ol', this.items.map((item, index) => h('li', { key: item.value }, [
      index > 0 ? icon(ChevronRight, 14) : null,
      item.href && index < this.items.length - 1 && !item.disabled
        ? h('a', { href: item.href }, item.label)
        : h('span', { 'aria-current': index === this.items.length - 1 ? 'page' : undefined, 'aria-disabled': item.disabled || undefined }, item.label),
    ]))))
  },
})

export const ApplePagination = defineComponent({
  name: 'ApplePagination',
  props: { ...motionProps, modelValue: { type: Number, default: 1 }, total: { type: Number, default: 0 }, pageSize: { type: Number, default: 10 }, disabled: Boolean, label: { type: String, default: '分页' } },
  emits: ['update:modelValue', 'change'],
  computed: {
    pageCount(): number { return Math.max(1, Math.ceil(this.total / Math.max(1, this.pageSize))) },
    currentPage(): number { return Math.min(this.pageCount, Math.max(1, this.modelValue)) },
    pages(): (number | string)[] {
      const pages = [...new Set([1, this.currentPage - 1, this.currentPage, this.currentPage + 1, this.pageCount].filter(page => page > 0 && page <= this.pageCount))].sort((a, b) => a - b)
      return pages.flatMap((page, index) => index && page - pages[index - 1]! > 1 ? [`gap-${page}`, page] : [page])
    },
  },
  methods: { go(page: number) { if (!this.disabled && page !== this.currentPage && page >= 1 && page <= this.pageCount) { this.$emit('update:modelValue', page); this.$emit('change', page) } } },
  render() {
    return h('nav', { class: 'apple-pagination', 'aria-label': this.label, 'data-motion': this.motion }, [
      h('button', { type: 'button', disabled: this.disabled || this.currentPage === 1, 'aria-label': '上一页', onClick: () => this.go(this.currentPage - 1) }, icon(ChevronLeft)),
      ...this.pages.map(page => typeof page === 'number' ? h('button', { type: 'button', class: { 'is-active': page === this.currentPage }, disabled: this.disabled, 'aria-label': `第 ${page} 页`, 'aria-current': page === this.currentPage ? 'page' : undefined, onClick: () => this.go(page) }, page) : h('span', { class: 'apple-pagination__gap', key: page, 'aria-hidden': 'true' }, '…')),
      h('button', { type: 'button', disabled: this.disabled || this.currentPage === this.pageCount, 'aria-label': '下一页', onClick: () => this.go(this.currentPage + 1) }, icon(ChevronRight)),
    ])
  },
})

export const AppleAccordion = defineComponent({
  name: 'AppleAccordion', setup: uidSetup,
  props: { ...motionProps, ...itemProps, modelValue: { type: [Array, String, Number] as PropType<AppleValue[] | AppleValue>, default: undefined }, multiple: Boolean, disabled: Boolean },
  emits: ['update:modelValue', 'change'],
  data: () => ({ opened: [] as AppleValue[] }),
  computed: { values(): AppleValue[] { const value = this.modelValue ?? this.opened; return Array.isArray(value) ? value : [value] } },
  methods: {
    toggle(item: AppleItem) {
      if (this.disabled || item.disabled) return
      const next = this.values.includes(item.value) ? this.values.filter(value => value !== item.value) : this.multiple ? [...this.values, item.value] : [item.value]
      this.opened = next
      const value = this.multiple ? next : next[0]
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },
  },
  render() {
    return h('div', { class: 'apple-accordion', 'data-motion': this.motion }, this.items.map((item, index) => {
      const open = this.values.includes(item.value)
      return h('section', { key: item.value, class: ['apple-accordion__item', { 'is-open': open }] }, [
        h('h3', h('button', { type: 'button', id: `${this.uid}-trigger-${index}`, 'aria-expanded': open, 'aria-controls': `${this.uid}-content-${index}`, disabled: this.disabled || item.disabled, onClick: () => this.toggle(item) }, [h('span', item.label), icon(ChevronDown, 22)])),
        h('div', { id: `${this.uid}-content-${index}`, role: 'region', 'aria-labelledby': `${this.uid}-trigger-${index}`, class: 'apple-accordion__content', hidden: !open }, this.$slots[`item-${item.value}`]?.({ item, open }) ?? this.$slots.item?.({ item, open }) ?? item.content),
      ])
    }))
  },
})

export const AppleTable = defineComponent({
  name: 'AppleTable',
  props: {
    ...motionProps, columns: { type: Array as PropType<AppleColumn[]>, default: () => [] }, rows: { type: Array as PropType<Row[]>, default: () => [] },
    rowKey: { type: String, default: 'id' }, label: { type: String, default: '数据表格' }, selectable: Boolean, selected: { type: Array as PropType<AppleValue[]>, default: undefined }, disabled: Boolean,
    sortBy: { type: String, default: undefined }, sortDirection: { type: String as PropType<'asc' | 'desc'>, default: undefined },
    page: { type: Number, default: undefined }, pageSize: { type: Number, default: 0 }, loading: Boolean, emptyText: { type: String, default: '暂无数据' },
  },
  emits: ['update:selected', 'update:sortBy', 'update:sortDirection', 'sort', 'update:page', 'row-click'],
  data: () => ({ internalSelected: [] as AppleValue[], internalSort: '', internalDirection: 'asc' as 'asc' | 'desc', internalPage: 1 }),
  computed: {
    selectedKeys(): AppleValue[] { return this.selected ?? this.internalSelected },
    activeSort(): string { return this.sortBy ?? this.internalSort },
    direction(): 'asc' | 'desc' { return this.sortDirection ?? this.internalDirection },
    orderedRows(): Row[] {
      if (!this.activeSort) return this.rows
      const key = this.activeSort
      return this.rows.map((row, index) => ({ row, index })).sort((a, b) => {
        const left = a.row[key]; const right = b.row[key]
        const comparison = typeof left === 'number' && typeof right === 'number' ? left - right : String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true })
        return comparison === 0 ? a.index - b.index : comparison * (this.direction === 'asc' ? 1 : -1)
      }).map(entry => entry.row)
    },
    currentPage(): number { return Math.min(Math.max(1, this.page ?? this.internalPage), this.pageSize > 0 ? Math.max(1, Math.ceil(this.rows.length / this.pageSize)) : 1) },
    visibleRows(): Row[] { return this.pageSize > 0 ? this.orderedRows.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize) : this.orderedRows },
    allSelected(): boolean { return this.visibleRows.length > 0 && this.visibleRows.every(row => this.selectedKeys.includes(this.keyOf(row))) },
    someSelected(): boolean { return !this.allSelected && this.visibleRows.some(row => this.selectedKeys.includes(this.keyOf(row))) },
  },
  methods: {
    keyOf(row: Row): AppleValue { return row[this.rowKey] as AppleValue },
    select(keys: AppleValue[]) { this.internalSelected = keys; this.$emit('update:selected', keys) },
    toggleRow(row: Row) { if (!this.disabled) { const key = this.keyOf(row); this.select(this.selectedKeys.includes(key) ? this.selectedKeys.filter(value => value !== key) : [...this.selectedKeys, key]) } },
    toggleAll() { if (!this.disabled) { const visible = this.visibleRows.map(this.keyOf); this.select(this.allSelected ? this.selectedKeys.filter(key => !visible.includes(key)) : [...new Set([...this.selectedKeys, ...visible])]) } },
    sort(column: AppleColumn) {
      if (this.disabled || !column.sortable) return
      const direction = this.activeSort === column.key && this.direction === 'asc' ? 'desc' : 'asc'
      this.internalSort = column.key; this.internalDirection = direction
      this.$emit('update:sortBy', column.key); this.$emit('update:sortDirection', direction); this.$emit('sort', { key: column.key, direction })
    },
    setPage(value: number) { this.internalPage = value; this.$emit('update:page', value) },
  },
  render() {
    return h('div', { class: 'apple-table', 'data-motion': this.motion, 'aria-busy': this.loading }, [
      h('div', { class: 'apple-table__scroll', tabindex: 0, role: 'region', 'aria-label': this.label }, h('table', [
        h('caption', { class: 'apple-content-sr' }, this.label),
        h('thead', h('tr', [
          this.selectable ? h('th', { class: 'apple-table__select', scope: 'col' }, h('input', { type: 'checkbox', checked: this.allSelected, indeterminate: this.someSelected, 'aria-label': '选择当前页全部行', disabled: this.disabled || this.visibleRows.length === 0, onChange: this.toggleAll })) : null,
          ...this.columns.map(column => h('th', { key: column.key, scope: 'col', style: { textAlign: column.align ?? 'left', width: column.width }, 'aria-sort': column.sortable ? this.activeSort === column.key ? this.direction === 'asc' ? 'ascending' : 'descending' : 'none' : undefined }, column.sortable ? h('button', { type: 'button', disabled: this.disabled, onClick: () => this.sort(column), class: 'apple-table__sort' }, [column.label, h(ChevronDown, { size: 14, 'aria-hidden': 'true', class: { 'is-ascending': this.activeSort === column.key && this.direction === 'asc', 'is-unsorted': this.activeSort !== column.key } })]) : column.label)),
        ])),
        h('tbody', this.visibleRows.length ? this.visibleRows.map((row, index) => h('tr', { key: this.keyOf(row), class: { 'is-selected': this.selectedKeys.includes(this.keyOf(row)) }, onClick: () => { if (!this.disabled) this.$emit('row-click', row) } }, [
          this.selectable ? h('td', { class: 'apple-table__select' }, h('input', { type: 'checkbox', checked: this.selectedKeys.includes(this.keyOf(row)), disabled: this.disabled, 'aria-label': `选择第 ${(this.currentPage - 1) * this.pageSize + index + 1} 行`, onClick: (event: Event) => event.stopPropagation(), onChange: () => this.toggleRow(row) })) : null,
          ...this.columns.map(column => h('td', { key: column.key, style: { textAlign: column.align ?? 'left' } }, this.$slots[`cell-${column.key}`]?.({ row, value: row[column.key], index }) ?? String(row[column.key] ?? ''))),
        ])) : h('tr', h('td', { colspan: this.columns.length + (this.selectable ? 1 : 0), class: 'apple-table__empty' }, this.$slots.empty?.() ?? (this.loading ? '正在加载…' : this.emptyText)))),
      ])),
      this.pageSize > 0 ? h('footer', { class: 'apple-table__footer' }, [h('span', `共 ${this.rows.length} 项`), h(ApplePagination, { modelValue: this.currentPage, total: this.rows.length, pageSize: this.pageSize, disabled: this.disabled, 'onUpdate:modelValue': this.setPage })]) : null,
    ])
  },
})

export const AppleTree = defineComponent({
  name: 'AppleTree',
  props: { ...motionProps, items: { type: Array as PropType<AppleTreeItem[]>, default: () => [] }, modelValue: valueProp, expanded: { type: Array as PropType<AppleValue[]>, default: undefined }, disabled: Boolean, label: { type: String, default: '树形列表' } },
  emits: ['update:modelValue', 'update:expanded', 'select'],
  data: () => ({ internalExpanded: [] as AppleValue[], internalValue: undefined as AppleValue | undefined, focusValue: undefined as AppleValue | undefined }),
  computed: {
    expandedValues(): AppleValue[] { return this.expanded ?? this.internalExpanded },
    selectedValue(): AppleValue | undefined { return this.modelValue ?? this.internalValue },
    visibleItems(): { item: AppleTreeItem; parent?: AppleValue }[] {
      const result: { item: AppleTreeItem; parent?: AppleValue }[] = []
      const visit = (items: AppleTreeItem[], parent?: AppleValue) => { for (const item of items) { result.push({ item, parent }); if (this.expandedValues.includes(item.value) && item.children) visit(item.children, item.value) } }
      visit(this.items)
      return result
    },
    tabValue(): AppleValue | undefined { return this.visibleItems.find(entry => entry.item.value === this.focusValue && !entry.item.disabled)?.item.value ?? this.visibleItems.find(entry => entry.item.value === this.selectedValue && !entry.item.disabled)?.item.value ?? this.visibleItems.find(entry => !entry.item.disabled)?.item.value },
  },
  methods: {
    toggle(item: AppleTreeItem) { if (this.disabled || item.disabled || !item.children?.length) return; const next = this.expandedValues.includes(item.value) ? this.expandedValues.filter(value => value !== item.value) : [...this.expandedValues, item.value]; this.internalExpanded = next; this.$emit('update:expanded', next) },
    select(item: AppleTreeItem) { if (this.disabled || item.disabled) return; this.internalValue = item.value; this.focus(item.value); this.$emit('update:modelValue', item.value); this.$emit('select', item) },
    focus(value: AppleValue | undefined) { if (value === undefined) return; this.focusValue = value; this.$nextTick(() => { const index = this.visibleItems.findIndex(entry => entry.item.value === value); (this.$el as HTMLElement).querySelectorAll<HTMLElement>('[role="treeitem"]')[index]?.focus() }) },
    keydown(event: KeyboardEvent, item: AppleTreeItem) {
      if (this.disabled || item.disabled) return
      const enabled = this.visibleItems.filter(entry => !entry.item.disabled)
      const index = enabled.findIndex(entry => entry.item.value === item.value)
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', ' '].includes(event.key)) return
      event.preventDefault(); event.stopPropagation()
      if (event.key === 'ArrowDown') this.focus(enabled[Math.min(index + 1, enabled.length - 1)]?.item.value)
      if (event.key === 'ArrowUp') this.focus(enabled[Math.max(0, index - 1)]?.item.value)
      if (event.key === 'Home') this.focus(enabled[0]?.item.value)
      if (event.key === 'End') this.focus(enabled[enabled.length - 1]?.item.value)
      if (event.key === 'ArrowRight') { if (!this.expandedValues.includes(item.value)) this.toggle(item); else this.focus(item.children?.find(child => !child.disabled)?.value) }
      if (event.key === 'ArrowLeft') { if (this.expandedValues.includes(item.value)) this.toggle(item); else this.focus(this.visibleItems.find(entry => entry.item.value === item.value)?.parent) }
      if (event.key === 'Enter' || event.key === ' ') this.select(item)
    },
    renderItems(items: AppleTreeItem[], level = 1): VNodeChild[] {
      return items.map(item => {
        const hasChildren = Boolean(item.children?.length); const open = this.expandedValues.includes(item.value)
        return h('li', { key: item.value, role: 'treeitem', 'aria-label': item.label, 'aria-level': level, 'aria-expanded': hasChildren ? open : undefined, 'aria-selected': this.selectedValue === item.value, 'aria-disabled': this.disabled || item.disabled || undefined, tabindex: !this.disabled && !item.disabled && this.tabValue === item.value ? 0 : -1, onFocus: (event: FocusEvent) => { if (event.target === event.currentTarget) this.focusValue = item.value }, onKeydown: (event: KeyboardEvent) => this.keydown(event, item) }, [
          h('div', { class: ['apple-tree__row', { 'is-selected': this.selectedValue === item.value, 'is-disabled': this.disabled || item.disabled }], style: { paddingInlineStart: `${Math.min(level - 1, 6) * 16 + 4}px` }, onClick: () => this.select(item) }, [
            hasChildren ? h('button', { type: 'button', class: ['apple-tree__toggle', { 'is-open': open }], tabindex: -1, 'aria-label': `${open ? '收起' : '展开'}${item.label}`, disabled: this.disabled || item.disabled, onClick: (event: Event) => { event.stopPropagation(); this.toggle(item) } }, icon(ChevronRight, 16)) : h('span', { class: 'apple-tree__spacer' }),
            this.$slots.item?.({ item, expanded: open, selected: this.selectedValue === item.value }) ?? h('span', item.label),
          ]),
          hasChildren && open ? h('ul', { role: 'group' }, this.renderItems(item.children!, level + 1)) : null,
        ])
      })
    },
  },
  render() { return h('ul', { class: 'apple-tree', role: 'tree', 'aria-label': this.label, 'data-motion': this.motion }, this.renderItems(this.items)) },
})

export const AppleList = defineComponent({
  name: 'AppleList', props: { ...motionProps, ...itemProps, modelValue: valueProp, selectable: Boolean, disabled: Boolean, label: { type: String, default: '列表' } },
  emits: ['update:modelValue', 'select'],
  render() { return h('ul', { class: 'apple-list', 'aria-label': this.label, 'data-motion': this.motion }, this.items.map(item => {
    const disabled = this.disabled || item.disabled
    const content = this.$slots.item?.({ item, selected: this.modelValue === item.value }) ?? [h('span', { class: 'apple-list__copy' }, [h('span', { class: 'apple-list__label' }, item.label), item.description ? h('span', { class: 'apple-list__description' }, item.description) : null]), this.selectable ? this.modelValue === item.value ? icon(Check) : null : item.href ? icon(ChevronRight) : null]
    return h('li', { key: item.value }, h(this.selectable ? 'button' : item.href && !disabled ? 'a' : 'div', { type: this.selectable ? 'button' : undefined, href: !this.selectable && !disabled ? item.href : undefined, disabled: this.selectable ? disabled : undefined, 'aria-disabled': disabled || undefined, 'aria-pressed': this.selectable ? this.modelValue === item.value : undefined, class: ['apple-list__item', { 'is-selected': this.modelValue === item.value }], onClick: () => { if (!disabled) { this.$emit('select', item); if (this.selectable) this.$emit('update:modelValue', item.value) } } }, content))
  })) },
})

export const AppleAvatar = defineComponent({
  name: 'AppleAvatar', props: { ...motionProps, src: String, name: { type: String, default: '用户' }, size: { type: Number, default: 40 }, square: Boolean },
  emits: ['error'], data: () => ({ failed: false }), watch: { src() { this.failed = false } },
  render() { return h('span', { class: ['apple-avatar', { 'apple-avatar--square': this.square }], style: { width: `${Math.max(16, this.size)}px`, height: `${Math.max(16, this.size)}px`, fontSize: `${Math.max(10, this.size * 0.34)}px` }, 'data-motion': this.motion }, this.src && !this.failed ? h('img', { src: this.src, alt: this.name, loading: 'lazy', onError: (event: Event) => { this.failed = true; this.$emit('error', event) } }) : h('span', { role: 'img', 'aria-label': this.name }, this.$slots.default?.() ?? Array.from(this.name.trim()).slice(0, 2).join(''))) },
})

export const AppleAvatarGroup = defineComponent({
  name: 'AppleAvatarGroup', props: { ...motionProps, items: { type: Array as PropType<AppleAvatarItem[]>, default: () => [] }, max: { type: Number, default: 4 }, size: { type: Number, default: 36 }, label: { type: String, default: '成员' } },
  render() { const count = Math.max(0, this.max); return h('div', { class: 'apple-avatar-group', role: 'group', 'aria-label': this.label, 'data-motion': this.motion }, this.$slots.default?.() ?? [...this.items.slice(0, count).map((item, index) => h(AppleAvatar, { key: item.value ?? index, name: item.name, src: item.src, size: this.size })), this.items.length > count ? h('span', { class: 'apple-avatar apple-avatar-group__more', style: { width: `${this.size}px`, height: `${this.size}px` }, 'aria-label': `还有 ${this.items.length - count} 位成员`, title: this.items.slice(count).map(item => item.name).join('、') }, `+${this.items.length - count}`) : null]) },
})

export const AppleBadge = defineComponent({
  name: 'AppleBadge', props: { ...motionProps, value: [String, Number], max: { type: Number, default: 99 }, dot: Boolean, showZero: Boolean, label: String, tone: { type: String, default: 'danger' } },
  render() { const visible = this.dot || (this.value !== undefined && (this.value !== 0 || this.showZero)); const value = typeof this.value === 'number' && this.value > this.max ? `${this.max}+` : this.value; return h('span', { class: ['apple-badge', { 'apple-badge--standalone': !this.$slots.default }], 'data-motion': this.motion }, [this.$slots.default?.(), visible ? h('span', { class: ['apple-badge__value', `apple-tone-${this.tone}`, { 'apple-badge__value--dot': this.dot }], role: 'status', 'aria-label': this.label ?? (this.dot ? '有新消息' : `${this.value} 条消息`) }, this.dot ? undefined : value) : null]) },
})

export const AppleTag = defineComponent({
  name: 'AppleTag', props: { ...motionProps, tone: { type: String, default: 'neutral' }, closable: Boolean, disabled: Boolean, label: String }, emits: ['close'],
  render() { return h('span', { class: ['apple-tag', `apple-tone-${this.tone}`], 'aria-disabled': this.disabled || undefined, 'data-motion': this.motion }, [this.$slots.default?.() ?? this.label, this.closable ? h('button', { type: 'button', disabled: this.disabled, 'aria-label': `移除${this.label ?? '标签'}`, onClick: (event: Event) => this.$emit('close', event) }, icon(X, 13)) : null]) },
})

export const AppleAlert = defineComponent({
  name: 'AppleAlert', props: { ...motionProps, title: String, message: String, tone: { type: String as PropType<'info' | 'success' | 'warning' | 'danger'>, default: 'info' }, closable: Boolean, modelValue: { type: Boolean, default: true } }, emits: ['update:modelValue', 'close'],
  render() { if (!this.modelValue) return null; return h('div', { class: ['apple-alert', `apple-tone-${this.tone}`], role: this.tone === 'danger' ? 'alert' : 'status', 'data-motion': this.motion }, [icon(this.tone === 'success' ? Check : this.tone === 'info' ? Info : AlertCircle, 20), h('div', { class: 'apple-alert__copy' }, [this.title ? h('strong', this.title) : null, this.$slots.default?.() ?? (this.message ? h('p', this.message) : null)]), this.closable ? h('button', { type: 'button', class: 'apple-content-icon-button', 'aria-label': '关闭提示', onClick: () => { this.$emit('update:modelValue', false); this.$emit('close') } }, icon(X, 18)) : null]) },
})

export const AppleProgress = defineComponent({
  name: 'AppleProgress', props: { ...motionProps, modelValue: { type: Number, default: 0 }, max: { type: Number, default: 100 }, label: { type: String, default: '进度' }, indeterminate: Boolean, showValue: Boolean, tone: { type: String, default: 'accent' } },
  render() { const value = percent(this.modelValue, this.max); return h('div', { class: ['apple-progress', `apple-tone-${this.tone}`, { 'is-indeterminate': this.indeterminate }], 'data-motion': this.motion }, [h('div', { class: 'apple-progress__track', role: 'progressbar', 'aria-label': this.label, 'aria-valuemin': 0, 'aria-valuemax': Math.max(0, this.max), 'aria-valuenow': this.indeterminate ? undefined : Math.min(Math.max(0, this.modelValue), Math.max(0, this.max)) }, h('span', { class: 'apple-progress__fill', style: this.indeterminate ? undefined : { width: `${value}%` } })), this.showValue ? h('span', { class: 'apple-progress__value' }, this.indeterminate ? '进行中' : `${Math.round(value)}%`) : null]) },
})

export const AppleSpinner = defineComponent({
  name: 'AppleSpinner', props: { ...motionProps, size: { type: Number, default: 22 }, label: { type: String, default: '正在加载' } },
  render() { return h('span', { class: 'apple-spinner', role: 'status', 'aria-label': this.label, 'data-motion': this.motion }, [h(LoaderCircle, { size: this.size, 'aria-hidden': 'true' }), this.$slots.default?.()]) },
})

export const AppleSkeleton = defineComponent({
  name: 'AppleSkeleton', props: { ...motionProps, lines: { type: Number, default: 3 }, avatar: Boolean, animated: { type: Boolean, default: true }, label: { type: String, default: '正在加载内容' } },
  render() { return h('div', { class: ['apple-skeleton', { 'is-animated': this.animated }], role: 'status', 'aria-label': this.label, 'data-motion': this.motion }, [this.avatar ? h('span', { class: 'apple-skeleton__avatar', 'aria-hidden': 'true' }) : null, h('div', { class: 'apple-skeleton__lines', 'aria-hidden': 'true' }, Array.from({ length: Math.max(1, Math.min(20, this.lines)) }, (_, index) => h('span', { key: index, style: { width: index === this.lines - 1 ? '65%' : '100%' } })))]) },
})

export const AppleEmpty = defineComponent({
  name: 'AppleEmpty', props: { ...motionProps, title: { type: String, default: '这里还没有内容' }, description: { type: String, default: '' } },
  render() { return h('div', { class: 'apple-empty', 'data-motion': this.motion }, [this.$slots.icon?.() ?? icon(Inbox, 36), h('h3', this.title), this.description ? h('p', this.description) : null, this.$slots.default?.()]) },
})

export const AppleDivider = defineComponent({
  name: 'AppleDivider', props: { ...motionProps, label: String, vertical: Boolean },
  render() { return h('div', { class: ['apple-divider', { 'apple-divider--vertical': this.vertical }], role: 'separator', 'aria-orientation': this.vertical ? 'vertical' : 'horizontal', 'aria-label': this.label, 'data-motion': this.motion }, this.$slots.default?.() ?? (this.label ? h('span', this.label) : undefined)) },
})

export const AppleSteps = defineComponent({
  name: 'AppleSteps', props: { ...motionProps, ...itemProps, modelValue: { type: Number, default: 0 }, clickable: Boolean, disabled: Boolean, label: { type: String, default: '步骤' } }, emits: ['update:modelValue', 'change'],
  render() { return h('ol', { class: 'apple-steps', 'aria-label': this.label, 'data-motion': this.motion }, this.items.map((item, index) => h('li', { key: item.value, class: { 'is-complete': index < this.modelValue, 'is-current': index === this.modelValue }, 'aria-current': index === this.modelValue ? 'step' : undefined }, h(this.clickable ? 'button' : 'div', { type: this.clickable ? 'button' : undefined, disabled: this.clickable ? this.disabled || item.disabled : undefined, onClick: () => { if (this.clickable && !this.disabled && !item.disabled) { this.$emit('update:modelValue', index); this.$emit('change', index) } } }, [h('span', { class: 'apple-steps__number', 'aria-hidden': 'true' }, index < this.modelValue ? icon(Check, 16) : index + 1), h('span', { class: 'apple-steps__copy' }, [h('strong', item.label), item.description ? h('span', item.description) : null])])))) },
})

export const AppleTimeline = defineComponent({
  name: 'AppleTimeline', props: { ...motionProps, items: { type: Array as PropType<AppleTimelineItem[]>, default: () => [] }, label: { type: String, default: '时间线' } },
  render() { return h('ol', { class: 'apple-timeline', 'aria-label': this.label, 'data-motion': this.motion }, this.items.map(item => h('li', { key: item.value, class: `apple-tone-${item.tone ?? 'neutral'}` }, [h('span', { class: 'apple-timeline__point', 'aria-hidden': 'true' }), h('div', { class: 'apple-timeline__copy' }, [item.time ? h('time', item.time) : null, h('strong', item.label), this.$slots.item?.({ item }) ?? (item.description ? h('p', item.description) : null)])]))) },
})

export const AppleCarousel = defineComponent({
  name: 'AppleCarousel', setup: uidSetup,
  props: { ...motionProps, items: { type: Array as PropType<AppleSlide[]>, default: () => [] }, modelValue: { type: Number, default: undefined }, label: { type: String, default: '精选内容' }, disabled: Boolean },
  emits: ['update:modelValue', 'change'], data: () => ({ internalIndex: 0, scrollTimer: undefined as ReturnType<typeof setTimeout> | undefined }),
  computed: { currentIndex(): number { return Math.min(Math.max(0, this.modelValue ?? this.internalIndex), Math.max(0, this.items.length - 1)) } },
  watch: { modelValue() { this.scrollToCurrent() }, 'items.length'() { this.$nextTick(this.scrollToCurrent) } },
  mounted() { this.scrollToCurrent() }, beforeUnmount() { clearTimeout(this.scrollTimer) },
  methods: {
    scrollToCurrent() { const track = this.$refs.track as HTMLElement | undefined; const slide = track?.children[this.currentIndex] as HTMLElement | undefined; if (track && slide) track.scrollTo({ left: slide.offsetLeft, behavior: 'auto' }) },
    go(index: number) { if (this.disabled || !this.items.length) return; const next = Math.min(this.items.length - 1, Math.max(0, index)); this.internalIndex = next; this.$emit('update:modelValue', next); this.$emit('change', next); this.$nextTick(this.scrollToCurrent) },
    onScroll() {
      clearTimeout(this.scrollTimer)
      this.scrollTimer = setTimeout(() => {
        const track = this.$refs.track as HTMLElement | undefined
        if (!track) return
        const slides = Array.from(track.children) as HTMLElement[]
        const closest = slides.reduce((best, slide, index) => Math.abs(slide.offsetLeft - track.scrollLeft) < Math.abs((slides[best]?.offsetLeft ?? 0) - track.scrollLeft) ? index : best, 0)
        if (closest !== this.currentIndex) { this.internalIndex = closest; this.$emit('update:modelValue', closest); this.$emit('change', closest) }
      }, 120)
    },
  },
  render() { return h('section', { class: 'apple-carousel', role: 'region', 'aria-roledescription': '轮播图', 'aria-label': this.label, 'data-motion': this.motion }, [
    h('div', { id: `${this.uid}-track`, ref: 'track', class: 'apple-carousel__track', tabindex: this.disabled ? -1 : 0, style: this.disabled ? { overflowX: 'hidden' } : undefined, onScroll: this.onScroll, onKeydown: (event: KeyboardEvent) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); this.go(this.currentIndex + (event.key === 'ArrowRight' ? 1 : -1)) } } }, this.items.map((item, index) => h('div', { key: item.value, class: 'apple-carousel__slide', role: 'group', 'aria-roledescription': '幻灯片', 'aria-label': `${index + 1} / ${this.items.length}：${item.label}`, inert: index !== this.currentIndex || undefined }, this.$slots.item?.({ item, index, active: index === this.currentIndex }) ?? [item.src ? h('img', { src: item.src, alt: item.alt ?? item.label, loading: index === 0 ? 'eager' : 'lazy', draggable: false }) : null, h('div', { class: 'apple-carousel__caption' }, [h('h3', item.label), item.description ? h('p', item.description) : null])]))),
    h('div', { class: 'apple-carousel__controls' }, [h('span', { class: 'apple-content-sr', 'aria-live': 'polite', 'aria-atomic': 'true' }, `${this.currentIndex + 1} / ${this.items.length}`), h('div', { class: 'apple-carousel__dots', role: 'group', 'aria-label': '选择幻灯片' }, this.items.map((item, index) => h('button', { key: item.value, type: 'button', disabled: this.disabled, 'aria-label': `查看${item.label}`, 'aria-current': index === this.currentIndex ? 'true' : undefined, 'aria-controls': `${this.uid}-track`, class: { 'is-active': index === this.currentIndex }, onClick: () => this.go(index) }, h('span')))), h('div', { class: 'apple-carousel__arrows' }, [h('button', { type: 'button', disabled: this.disabled || this.currentIndex === 0, 'aria-label': '上一张', onClick: () => this.go(this.currentIndex - 1) }, icon(ChevronLeft)), h('button', { type: 'button', disabled: this.disabled || this.currentIndex >= this.items.length - 1, 'aria-label': '下一张', onClick: () => this.go(this.currentIndex + 1) }, icon(ChevronRight))])]),
  ]) },
})

export const ApplePullRefresh = defineComponent({
  name: 'ApplePullRefresh', props: { ...motionProps, modelValue: Boolean, disabled: Boolean, threshold: { type: Number, default: 72 }, label: { type: String, default: '刷新内容' } },
  emits: ['update:modelValue', 'refresh'], data: () => ({ pulling: false, startY: 0, startX: 0, distance: 0, refreshing: false }),
  watch: { modelValue(value: boolean) { if (!value) { this.refreshing = false; this.distance = 0 } }, disabled(value: boolean) { if (value) { this.pulling = false; this.distance = 0 } } },
  methods: {
    atTop(): boolean { let node = this.$el as HTMLElement | null; while (node && node !== document.documentElement) { if (node.scrollHeight > node.clientHeight && /(auto|scroll)/.test(getComputedStyle(node).overflowY)) return node.scrollTop <= 0; node = node.parentElement }; return (document.scrollingElement?.scrollTop ?? 0) <= 0 },
    start(event: TouchEvent) { if (!this.disabled && !this.refreshing && !this.modelValue && this.atTop() && event.touches.length === 1) { this.pulling = true; this.startY = event.touches[0]!.clientY; this.startX = event.touches[0]!.clientX } },
    move(event: TouchEvent) { if (!this.pulling) return; if (event.touches.length !== 1) { this.pulling = false; this.distance = 0; return }; const distance = event.touches[0]!.clientY - this.startY; if (Math.abs(event.touches[0]!.clientX - this.startX) > Math.max(12, Math.abs(distance))) { this.pulling = false; this.distance = 0; return }; if (distance > 0) { this.distance = Math.min(distance * 0.5, Math.max(1, this.threshold) + 28); if (event.cancelable) event.preventDefault() } else this.distance = 0 },
    end() { if (!this.pulling) return; this.pulling = false; if (this.distance >= Math.max(1, this.threshold)) this.refresh(); else this.distance = 0 },
    finish() { this.refreshing = false; this.distance = 0; this.$emit('update:modelValue', false) },
    refresh() { if (this.disabled || this.refreshing || this.modelValue) return; this.refreshing = true; this.distance = 48; this.$emit('update:modelValue', true); this.$emit('refresh', this.finish) },
  },
  render() { const busy = this.refreshing || this.modelValue; return h('div', { class: 'apple-pull-refresh', 'data-motion': this.motion, 'aria-busy': busy, onTouchstartPassive: this.start, onTouchmove: this.move, onTouchend: this.end, onTouchcancel: () => { this.pulling = false; this.distance = 0 } }, [
    h('div', { class: 'apple-pull-refresh__indicator', style: { height: `${busy ? 48 : this.distance}px` }, role: 'status' }, busy ? [icon(LoaderCircle), '正在刷新'] : this.distance > 0 ? [icon(ChevronDown), this.distance >= Math.max(1, this.threshold) ? '松开刷新' : '下拉刷新'] : undefined),
    this.$slots.default?.({ refresh: this.refresh, refreshing: busy }),
    h('button', { type: 'button', class: 'apple-pull-refresh__button', disabled: this.disabled || busy, onClick: this.refresh }, [icon(LoaderCircle, 14), this.label]),
  ]) },
})

export const AppleInfiniteScroll = defineComponent({
  name: 'AppleInfiniteScroll', props: { ...motionProps, loading: Boolean, error: { type: [Boolean, String], default: false }, finished: Boolean, disabled: Boolean, distance: { type: Number, default: 120 }, finishedText: { type: String, default: '已经到底了' } },
  emits: ['load', 'retry'], data: () => ({ observer: undefined as IntersectionObserver | undefined, pending: false, visible: false }),
  watch: {
    loading(value: boolean, previous: boolean) { if (!value && previous) { this.pending = false; this.reobserve() } },
    error(value: boolean | string) { if (value) this.pending = false; else this.reobserve() },
    finished(value: boolean) { if (value) this.pending = false; else this.reobserve() },
    disabled(value: boolean) { if (!value) this.reobserve() },
  },
  mounted() { if (typeof IntersectionObserver !== 'undefined') { this.observer = new IntersectionObserver(entries => { this.visible = Boolean(entries[0]?.isIntersecting); if (this.visible) this.load() }, { rootMargin: `${Math.max(0, this.distance)}px` }); this.observer.observe(this.$refs.sentinel as HTMLElement) } },
  beforeUnmount() { this.observer?.disconnect(); this.observer = undefined },
  methods: {
    reobserve() { this.$nextTick(() => { const sentinel = this.$refs.sentinel as HTMLElement | undefined; if (this.observer && sentinel) { this.observer.unobserve(sentinel); this.observer.observe(sentinel) } }) },
    finish() { this.pending = false; this.reobserve() },
    load() { if (this.loading || this.pending || this.finished || this.disabled || this.error) return; this.pending = true; this.$emit('load', this.finish) },
    retry() { if (this.disabled || this.loading) return; this.pending = true; this.$emit('retry', this.finish) },
  },
  render() { return h('div', { class: 'apple-infinite-scroll', 'data-motion': this.motion, 'aria-busy': this.loading || this.pending }, [this.$slots.default?.(), h('div', { ref: 'sentinel', class: 'apple-infinite-scroll__status', role: 'status' }, this.finished ? this.finishedText : this.loading || this.pending ? [h(AppleSpinner, { size: 16 }), '正在加载'] : this.error ? [h('span', typeof this.error === 'string' ? this.error : '加载失败'), h('button', { type: 'button', disabled: this.disabled, onClick: this.retry }, '重试')] : h('button', { type: 'button', disabled: this.disabled, onClick: this.load }, '加载更多'))]) },
})

export const AppleSwipeCell = defineComponent({
  name: 'AppleSwipeCell', setup: uidSetup,
  props: { ...motionProps, modelValue: { type: Boolean, default: undefined }, disabled: Boolean, label: { type: String, default: '更多操作' } }, emits: ['update:modelValue'],
  data: () => ({ internalOpen: false, startX: 0, startY: 0 }), computed: { opened(): boolean { return this.modelValue ?? this.internalOpen } },
  methods: { setOpen(open: boolean) { if (this.disabled) return; const restoreFocus = !open && (this.$refs.actions as HTMLElement | undefined)?.contains(document.activeElement); this.internalOpen = open; this.$emit('update:modelValue', open); if (restoreFocus) this.$nextTick(() => (this.$refs.trigger as HTMLButtonElement | undefined)?.focus()) } },
  render() { return h('div', { class: ['apple-swipe-cell', { 'is-open': this.opened }], 'data-motion': this.motion, onTouchstartPassive: (event: TouchEvent) => { if (event.touches.length === 1) { this.startX = event.touches[0]!.clientX; this.startY = event.touches[0]!.clientY } }, onTouchendPassive: (event: TouchEvent) => { const touch = event.changedTouches[0]; if (touch && Math.abs(touch.clientX - this.startX) > 40 && Math.abs(touch.clientY - this.startY) < 35) this.setOpen(touch.clientX < this.startX) }, onKeydown: (event: KeyboardEvent) => { if (event.key === 'Escape' && this.opened) { event.stopPropagation(); this.setOpen(false) } } }, [
    h('div', { class: 'apple-swipe-cell__content' }, [this.$slots.default?.(), h('button', { ref: 'trigger', type: 'button', class: 'apple-content-icon-button', disabled: this.disabled, 'aria-label': this.label, 'aria-expanded': this.opened, 'aria-controls': `${this.uid}-actions`, onClick: () => this.setOpen(!this.opened) }, icon(MoreHorizontal))]),
    h('div', { ref: 'actions', id: `${this.uid}-actions`, class: 'apple-swipe-cell__actions', hidden: !this.opened, inert: this.disabled || undefined }, this.$slots.actions?.({ close: () => this.setOpen(false) })),
  ]) },
})

export const AppleBackTop = defineComponent({
  name: 'AppleBackTop', props: { ...motionProps, target: { type: String, default: '' }, threshold: { type: Number, default: 300 }, label: { type: String, default: '回到顶部' }, disabled: Boolean },
  emits: ['click'], data: () => ({ visible: false, scrollTarget: undefined as HTMLElement | Window | undefined }),
  mounted() { this.bindTarget() },
  watch: { target() { this.bindTarget() }, threshold() { this.onScroll() } },
  beforeUnmount() { this.scrollTarget?.removeEventListener('scroll', this.onScroll) },
  methods: { bindTarget() { this.scrollTarget?.removeEventListener('scroll', this.onScroll); this.scrollTarget = this.target ? document.querySelector<HTMLElement>(this.target) ?? window : window; this.scrollTarget.addEventListener('scroll', this.onScroll, { passive: true }); this.onScroll() }, onScroll() { this.visible = (this.scrollTarget === window ? window.scrollY : (this.scrollTarget as HTMLElement)?.scrollTop ?? 0) >= this.threshold }, go(event: Event) { if (this.disabled) return; this.scrollTarget?.scrollTo({ top: 0, behavior: 'auto' }); this.$emit('click', event) } },
  render() { return this.visible ? h('button', { type: 'button', class: 'apple-back-top', disabled: this.disabled, 'aria-label': this.label, title: this.label, 'data-motion': this.motion, onClick: this.go }, this.$slots.default?.() ?? icon(ArrowUp, 20)) : null },
})

export const AppleMarquee = defineComponent({
  name: 'AppleMarquee', props: { ...motionProps, text: { type: String, default: '' }, duration: { type: Number, default: 24 }, paused: Boolean, label: { type: String, default: '公告' } },
  data: () => ({ userPaused: false }),
  render() { const paused = this.paused || this.userPaused; return h('div', { class: ['apple-marquee', { 'is-paused': paused }], style: { '--apple-marquee-duration': `${Math.max(1, this.duration)}s` }, 'data-motion': this.motion }, [h('div', { class: 'apple-marquee__viewport', 'aria-label': this.label }, h('div', { class: 'apple-marquee__track' }, [h('span', this.$slots.default?.() ?? this.text), h('span', { 'aria-hidden': 'true', inert: true }, this.$slots.default?.() ?? this.text)])), h('button', { type: 'button', class: 'apple-content-icon-button', 'aria-label': paused ? '开始滚动' : '暂停滚动', 'aria-pressed': !paused, disabled: this.paused, onClick: () => { this.userPaused = !this.userPaused } }, icon(paused ? Play : Pause, 16))]) },
})

export const AppleStatistic = defineComponent({
  name: 'AppleStatistic', props: { ...motionProps, value: { type: [String, Number], default: 0 }, label: { type: String, required: true }, prefix: String, suffix: String, precision: { type: Number, default: 0 }, locale: { type: String, default: 'zh-CN' }, description: String },
  render() { const value = typeof this.value === 'number' ? this.value.toLocaleString(this.locale, { minimumFractionDigits: Math.max(0, Math.min(20, this.precision)), maximumFractionDigits: Math.max(0, Math.min(20, this.precision)) }) : this.value; return h('div', { class: 'apple-statistic', 'data-motion': this.motion }, [h('div', { class: 'apple-statistic__label' }, this.label), h('div', { class: 'apple-statistic__value' }, [this.prefix ? h('span', this.prefix) : null, h('strong', value), this.suffix ? h('span', this.suffix) : null]), this.description ? h('p', this.description) : null, this.$slots.default?.()]) },
})

export const contentComponents = { AppleTabs, AppleBreadcrumbs, ApplePagination, AppleAccordion, AppleTable, AppleTree, AppleList, AppleAvatar, AppleAvatarGroup, AppleBadge, AppleTag, AppleAlert, AppleProgress, AppleSpinner, AppleSkeleton, AppleEmpty, AppleDivider, AppleSteps, AppleTimeline, AppleCarousel, ApplePullRefresh, AppleInfiniteScroll, AppleSwipeCell, AppleBackTop, AppleMarquee, AppleStatistic }
