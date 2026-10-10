import { defineComponent, h, inject, markRaw, provide, Teleport, Transition, useId, withDirectives, type PropType, type VNodeChild } from 'vue'
import { AlertCircle, ArrowUp, Check, ChevronDown, ChevronLeft, ChevronRight, Inbox, Info, LoaderCircle, X } from 'lucide-vue-next'
import { Virtualizer, elementScroll, observeElementOffset, observeElementRect, type VirtualizerOptions } from '@tanstack/virtual-core'
import { ripple, scrollToWithMotion, type MotionScroll } from '../core/motion'
import { AppleTabs, AppleTabBar } from './tabs'
export { AppleTabs, AppleTabBar } from './tabs'
import { AppleAutoSize } from './motion'
import { appleKey, resolveMotion, type AppleContext } from '../core/context'
import { usePreviewNavigation } from '../core/preview-navigation'
import { useSpeedDialEntry } from '../core/speed-dial'
import { AppleSearch } from './foundation'

export type AppleValue = string | number
export interface AppleItem { label: string; value: AppleValue; disabled?: boolean; description?: string; href?: string; content?: string }
export interface AppleColumn { key: string; label: string; sortable?: boolean; align?: 'left' | 'center' | 'right'; width?: string | number; minWidth?: number; maxWidth?: number; resizable?: boolean }
export interface AppleTreeItem extends AppleItem { children?: AppleTreeItem[] }
export interface AppleAvatarItem { name: string; src?: string; value?: AppleValue }
export interface AppleTimelineItem extends AppleItem { time?: string; tone?: 'default' | 'success' | 'danger' }
type Motion = 'inherit' | 'auto' | 'full' | 'reduced' | 'none'
type Row = Record<string, unknown>
const motionProps = { motion: { type: String as PropType<Motion>, default: 'inherit' } }
const itemProps = { items: { type: Array as PropType<AppleItem[]>, default: () => [] } }
const valueProp = { type: [String, Number] as PropType<AppleValue>, default: undefined }
const icon = (component: typeof Check, size = 18) => h(component, { size, 'aria-hidden': 'true', focusable: 'false' })
const percent = (value: number, max: number) => Math.max(0, Math.min(100, max > 0 ? value / max * 100 : 0))
const uidSetup = () => ({ uid: useId() })
export const AppleBreadcrumbs = defineComponent({
  name: 'AppleBreadcrumbs', props: { ...motionProps, ...itemProps, label: { type: String, default: '当前位置' } },
  emits: ['click'],
  render() {
    return h('nav', { class: 'apple-breadcrumbs', 'aria-label': this.label, 'data-motion': this.motion }, h('ol', this.items.map((item, index) => h('li', { key: item.value }, [
      index > 0 ? icon(ChevronRight, 14) : null,
      index < this.items.length - 1 && !item.disabled
        ? h(item.href ? 'a' : 'button', { type: item.href ? undefined : 'button', href: item.href, onClick: (event: MouseEvent) => this.$emit('click', item, event) }, item.label)
        : h('span', { 'aria-current': index === this.items.length - 1 ? 'page' : undefined, 'aria-disabled': item.disabled || undefined }, item.label),
    ]))))
  },
})

import { AppleInput } from './forms'
import { motionDuration } from '../core/motion'
import type { ObjectDirective } from 'vue'

const paginationIndicators = new WeakMap<HTMLElement, { update: (page: number, animate?: boolean) => void; destroy: () => void }>()
const PaginationSelection: ObjectDirective<HTMLElement, number> = {
  mounted(element, binding) {
    const indicator = document.createElement('span')
    indicator.className = 'apple-pagination__indicator'
    indicator.setAttribute('aria-hidden', 'true')
    element.appendChild(indicator)
    let page = binding.value
    let previousPage = page
    let initialized = false
    let frame = 0
    let animation: Animation | undefined
    let targetPose = ''
    let targetWidth = 0
    let targetHeight = 0
    const update = (nextPage: number, animate = true) => {
      page = nextPage
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const selected = element.querySelector<HTMLElement>('[aria-current="page"]')
        if (!selected) { animation?.cancel(); indicator.hidden = true; initialized = false; return }
        indicator.hidden = false
        const rect = selected.getBoundingClientRect(), bounds = element.getBoundingClientRect()
        const x = rect.left - bounds.left + element.scrollLeft - element.clientLeft
        const y = rect.top - bounds.top + element.scrollTop - element.clientTop
        const pose = `translate(${x}px, ${y}px)`
        if (initialized && previousPage === page && targetPose === pose && targetWidth === rect.width && targetHeight === rect.height) return
        const duration = animate && initialized ? motionDuration(element) : 0
        let from = getComputedStyle(indicator).transform
        animation?.cancel()
        indicator.style.width = `${rect.width}px`
        indicator.style.height = `${rect.height}px`
        indicator.style.transform = pose
        // A sliding page window can leave the selected slot in the same place.
        // Give that change a short directional arrival instead of a static swap.
        if (initialized && previousPage !== page && targetPose === pose) from = `translate(${x - Math.sign(page - previousPage) * (rect.width + 4)}px, ${y}px)`
        if (duration > 0 && indicator.animate && from !== 'none') {
          const running = indicator.animate([{ transform: from }, { transform: pose }], { duration, easing: 'cubic-bezier(.25,.1,.25,1)' })
          animation = running
          running.onfinish = () => { if (animation === running) { running.cancel(); animation = undefined } }
        }
        targetPose = pose
        targetWidth = rect.width
        targetHeight = rect.height
        previousPage = page
        initialized = true
      })
    }
    const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => update(page, false))
    resize?.observe(element)
    const onResize = () => update(page, false)
    window.addEventListener('resize', onResize)
    const syncMotion = () => {
      const duration = motionDuration(element)
      if (!duration) { animation?.cancel(); animation = undefined }
      else if (animation && duration <= 80) animation.updatePlaybackRate(Math.max(1, Number(animation.effect?.getTiming().duration ?? duration) / duration))
    }
    const policy = new MutationObserver(syncMotion)
    for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) policy.observe(ancestor, { attributes: true, attributeFilter: ['data-apple-motion', 'data-motion'] })
    const reduced = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : undefined
    reduced?.addEventListener('change', syncMotion)
    paginationIndicators.set(element, { update, destroy() { cancelAnimationFrame(frame); animation?.cancel(); resize?.disconnect(); policy.disconnect(); reduced?.removeEventListener('change', syncMotion); window.removeEventListener('resize', onResize); indicator.remove() } })
    update(page, false)
  },
  updated(element, binding) { paginationIndicators.get(element)?.update(binding.value) },
  unmounted(element) { paginationIndicators.get(element)?.destroy(); paginationIndicators.delete(element) },
}

export const ApplePagination = defineComponent({
  name: 'ApplePagination',
  props: { ...motionProps, modelValue: { type: Number, default: 1 }, total: { type: Number, default: 0 }, pageSize: { type: Number, default: 10 }, disabled: Boolean, label: { type: String, default: '分页' } },
  emits: ['update:modelValue', 'change'],
  data() { return { draft: String(Math.min(Math.max(1, Math.ceil(this.total / Math.max(1, this.pageSize))), Math.max(1, this.modelValue))), draftError: '', availableWidth: Infinity, widthObserver: undefined as ResizeObserver | undefined } },
  computed: {
    pageCount(): number { return Math.max(1, Math.ceil(this.total / Math.max(1, this.pageSize))) },
    currentPage(): number { return Math.min(this.pageCount, Math.max(1, this.modelValue)) },
    empty(): boolean { return this.total <= 0 },
    pages(): (number | string)[] {
      const pages = [...new Set([1, this.currentPage - 1, this.currentPage, this.currentPage + 1, this.pageCount].filter(page => page > 0 && page <= this.pageCount))].sort((a, b) => a - b)
      const full = pages.flatMap((page, index) => index && page - pages[index - 1]! > 1 ? [`gap-${page}`, page] : [page])
      const fits = (entries: (number | string)[]) => {
        const numbers = entries.filter(page => typeof page === 'number').length
        return (numbers + 2) * 44 + (entries.length - numbers) * 12 + (entries.length + 1) * 4 + 6 <= this.availableWidth
      }
      if (fits(full)) return full
      const nearby = [this.currentPage - 1, this.currentPage, this.currentPage + 1].filter(page => page > 0 && page <= this.pageCount)
      const withGaps: (number | string)[] = [...(nearby[0]! > 1 ? ['gap-start'] : []), ...nearby, ...(nearby.at(-1)! < this.pageCount ? ['gap-end'] : [])]
      if (fits(withGaps)) return withGaps
      if (fits(nearby)) return nearby
      const pair = nearby.filter(page => page === this.currentPage || page === (this.currentPage === 1 ? 2 : this.currentPage - 1))
      return fits(pair) ? pair : [this.currentPage]
    },
  },
  mounted() {
    const measure = () => { const width = (this.$el as HTMLElement).clientWidth; if (width > 0) this.availableWidth = width }
    measure()
    if (typeof ResizeObserver !== 'undefined') { this.widthObserver = new ResizeObserver(measure); this.widthObserver.observe(this.$el as HTMLElement) }
  },
  beforeUnmount() { this.widthObserver?.disconnect() },
  watch: {
    currentPage() { this.resetDraft() },
    pageCount() { this.resetDraft() },
    empty() { this.resetDraft() },
  },
  methods: {
    resetDraft() { this.draft = String(this.currentPage); this.draftError = '' },
    go(page: number) { if (!this.disabled && !this.empty && Number.isInteger(page) && page !== this.currentPage && page >= 1 && page <= this.pageCount) { this.$emit('update:modelValue', page); this.$emit('change', page) } },
    apply() {
      if (this.disabled || this.empty) return
      const value = this.draft.trim()
      const page = Number(value)
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(page) || page < 1 || page > this.pageCount) {
        this.draftError = `请输入 1–${this.pageCount} 的整数页码`
        return
      }
      this.draftError = ''
      this.draft = String(page)
      this.go(page)
    },
  },
  render() {
    const blocked = this.disabled || this.empty
    return h('nav', { class: 'apple-pagination', 'aria-label': this.label, 'data-motion': this.motion }, [
      withDirectives(h('div', { class: 'apple-pagination__pages' }, [
      ripple(h('button', { type: 'button', disabled: blocked || this.currentPage === 1, 'aria-label': '上一页', onClick: () => this.go(this.currentPage - 1) }, icon(ChevronLeft)), !blocked && this.currentPage !== 1),
      ...this.pages.map(page => typeof page === 'number' ? ripple(h('button', { type: 'button', key: page, class: { 'is-active': page === this.currentPage }, disabled: blocked, 'aria-label': `第 ${page} 页`, 'aria-current': page === this.currentPage ? 'page' : undefined, onClick: () => this.go(page) }, page), !blocked) : h('span', { class: 'apple-pagination__gap', key: page, 'aria-hidden': 'true' }, '…')),
      ripple(h('button', { type: 'button', disabled: blocked || this.currentPage === this.pageCount, 'aria-label': '下一页', onClick: () => this.go(this.currentPage + 1) }, icon(ChevronRight)), !blocked && this.currentPage !== this.pageCount),
      ]), [[PaginationSelection, this.currentPage]]),
      h('div', { class: 'apple-pagination__jump' }, h(AppleInput, {
        modelValue: this.draft, 'aria-label': '跳转页码', inputmode: 'numeric', autocomplete: 'off', disabled: blocked, error: this.draftError, motion: this.motion,
        'onUpdate:modelValue': (value: string | number) => { this.draft = String(value); this.draftError = '' },
        onKeydown: (event: KeyboardEvent) => { if (event.key === 'Enter') { event.preventDefault(); this.apply() } },
      }, { suffix: () => h(AppleButton, { variant: 'primary', disabled: blocked, motion: this.motion, onClick: this.apply }, { default: () => 'Apply' }) })),
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
        h('h3', ripple(h('button', { type: 'button', id: `${this.uid}-trigger-${index}`, 'aria-expanded': open, 'aria-controls': `${this.uid}-content-${index}`, disabled: this.disabled || item.disabled, onClick: () => this.toggle(item) }, [h('span', item.label), icon(ChevronDown, 22)]))),
        h('div', { id: `${this.uid}-content-${index}`, role: 'region', 'aria-labelledby': `${this.uid}-trigger-${index}`, class: 'apple-accordion__region', 'aria-hidden': !open, inert: !open || undefined }, h('div', { class: 'apple-accordion__clip' }, h('div', { class: 'apple-accordion__content' }, this.$slots[`item-${item.value}`]?.({ item, open }) ?? this.$slots.item?.({ item, open }) ?? item.content))),
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
    virtual: Boolean, height: { type: Number, default: 360 }, rowHeight: { type: Number, default: 48 }, overscan: { type: Number, default: 5 }, resizable: { type: Boolean, default: true },
  },
  emits: ['update:selected', 'update:sortBy', 'update:sortDirection', 'sort', 'update:page', 'row-click', 'column-resize'],
  data: () => ({ internalSelected: [] as AppleValue[], internalSort: '', internalDirection: 'asc' as 'asc' | 'desc', internalPage: 1, columnWidths: {} as Record<string, number>, virtualizer: undefined as Virtualizer<HTMLElement, Element> | undefined, virtualVersion: 0, cleanupVirtual: undefined as (() => void) | undefined, cleanupResize: undefined as (() => void) | undefined }),
  mounted() { this.virtualizer = markRaw(new Virtualizer(this.virtualOptions())); this.cleanupVirtual = this.virtualizer._didMount(); this.virtualizer._willUpdate(); this.virtualVersion++ },
  updated() { this.virtualizer?._willUpdate() },
  beforeUnmount() { this.cleanupVirtual?.(); this.cleanupResize?.() },
  watch: {
    visibleRows() { this.updateVirtual() }, 'visibleRows.length'() { this.updateVirtual() }, virtual() { this.updateVirtual() }, height() { this.updateVirtual() }, rowHeight() { this.updateVirtual(); this.virtualizer?.measure() }, overscan() { this.updateVirtual() },
    currentPage() { this.resetScroll() }, activeSort() { this.resetScroll() }, direction() { this.resetScroll() },
  },
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
    tableWidth(): number { return this.columns.reduce((width, column) => width + this.columnWidth(column), this.selectable ? 44 : 0) },
  },
  methods: {
    virtualOptions(): VirtualizerOptions<HTMLElement, Element> {
      return { count: this.visibleRows.length, getScrollElement: () => this.$refs.scroll as HTMLElement | null, estimateSize: () => Math.max(28, this.rowHeight), getItemKey: index => this.keyOf(this.visibleRows[index]!), overscan: Math.max(0, this.overscan), paddingStart: 48, initialRect: { width: 0, height: Math.max(96, this.height) }, enabled: this.virtual, observeElementRect, observeElementOffset, scrollToFn: elementScroll, onChange: () => { this.virtualVersion++ } }
    },
    updateVirtual() { this.virtualizer?.setOptions(this.virtualOptions()); this.virtualVersion++ },
    resetScroll() { if (this.virtual) this.$nextTick(() => this.virtualizer?.scrollToOffset(0)) },
    columnWidth(column: AppleColumn): number { return this.columnWidths[column.key] ?? Math.max(column.minWidth ?? 96, Number.parseFloat(String(column.width ?? 160)) || 160) },
    setColumnWidth(column: AppleColumn, width: number) { const min = Math.max(44, column.minWidth ?? 96); const next = Math.round(Math.min(Math.max(min, column.maxWidth ?? 1600), Math.max(min, width))); this.columnWidths = { ...this.columnWidths, [column.key]: next }; this.$emit('column-resize', { key: column.key, width: next }) },
    startResize(event: PointerEvent, column: AppleColumn) {
      if (this.disabled || !this.resizable || column.resizable === false || event.button !== 0) return
      event.preventDefault(); event.stopPropagation(); this.cleanupResize?.()
      const header = (event.currentTarget as HTMLElement).parentElement!
      const widths = { ...this.columnWidths }
      ;(this.$el as HTMLElement).querySelectorAll<HTMLElement>('th[data-column-key]').forEach(cell => { const width = cell.getBoundingClientRect().width; if (width > 0) widths[cell.dataset.columnKey!] = width })
      this.columnWidths = widths
      const initial = header.getBoundingClientRect().width || this.columnWidth(column); const start = event.clientX
      const move = (next: PointerEvent) => this.setColumnWidth(column, initial + next.clientX - start)
      const end = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); this.cleanupResize = undefined }
      this.cleanupResize = end; window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end)
    },
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
    void this.virtualVersion
    const virtualItems = this.virtual && this.virtualizer ? this.virtualizer.getVirtualItems() : []
    const entries = this.virtual ? virtualItems.map(item => ({ row: this.visibleRows[item.index]!, index: item.index })) : this.visibleRows.map((row, index) => ({ row, index }))
    const spacer = (height: number, key: string) => height > 0 ? h('tr', { key, class: 'apple-table__spacer', 'aria-hidden': 'true' }, h('td', { colspan: this.columns.length + (this.selectable ? 1 : 0), style: { height: `${height}px` } })) : null
    const top = Math.max(0, (virtualItems[0]?.start ?? 48) - 48)
    const bottom = Math.max(0, (this.virtualizer?.getTotalSize() ?? 48) - (virtualItems.at(-1)?.end ?? 48))
    return h('div', { class: ['apple-table', { 'apple-table--virtual': this.virtual }], 'data-motion': this.motion, 'aria-busy': this.loading }, [
      h(AppleAutoSize, { class: 'apple-table-size', motion: this.motion }, { default: () => h('div', { ref: 'scroll', class: 'apple-table__scroll', style: this.virtual ? { height: `${Math.max(96, this.height)}px` } : undefined, tabindex: 0, role: 'region', 'aria-label': this.label }, h('table', { style: this.resizable ? { width: `${this.tableWidth}px` } : undefined, 'aria-rowcount': this.visibleRows.length + 1 }, [
        h('caption', { class: 'apple-content-sr' }, this.label),
        h('colgroup', [this.selectable ? h('col', { style: { width: '44px' } }) : null, ...this.columns.map(column => h('col', { key: column.key, style: { width: this.columnWidths[column.key] !== undefined ? `${this.columnWidths[column.key]}px` : typeof column.width === 'number' ? `${column.width}px` : column.width ?? (this.resizable ? `${this.columnWidth(column)}px` : undefined) } }))]),
        h('thead', h('tr', [
          this.selectable ? h('th', { class: 'apple-table__select', scope: 'col' }, h('input', { type: 'checkbox', checked: this.allSelected, indeterminate: this.someSelected, 'aria-label': '选择当前页全部行', disabled: this.disabled || this.visibleRows.length === 0, onChange: this.toggleAll })) : null,
          ...this.columns.map(column => h('th', { key: column.key, 'data-column-key': column.key, scope: 'col', style: { textAlign: column.align ?? 'left' }, 'aria-sort': column.sortable ? this.activeSort === column.key ? this.direction === 'asc' ? 'ascending' : 'descending' : 'none' : undefined }, [column.sortable ? ripple(h('button', { type: 'button', disabled: this.disabled, onClick: () => this.sort(column), class: 'apple-table__sort' }, [column.label, h(ChevronDown, { size: 14, 'aria-hidden': 'true', class: { 'is-ascending': this.activeSort === column.key && this.direction === 'asc', 'is-unsorted': this.activeSort !== column.key } })])) : column.label, this.resizable && column.resizable !== false ? h('span', { role: 'separator', tabindex: this.disabled ? -1 : 0, class: 'apple-table__resize', 'aria-label': `调整${column.label}列宽`, 'aria-orientation': 'vertical', 'aria-valuenow': this.columnWidth(column), 'aria-valuemin': Math.max(44, column.minWidth ?? 96), 'aria-valuemax': Math.max(column.minWidth ?? 96, column.maxWidth ?? 1600), 'aria-disabled': this.disabled || undefined, onPointerdown: (event: PointerEvent) => this.startResize(event, column), onKeydown: (event: KeyboardEvent) => { if (!this.disabled && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); this.setColumnWidth(column, this.columnWidth(column) + (event.key === 'ArrowRight' ? 10 : -10)) } } }) : null])),
        ])),
        h('tbody', this.visibleRows.length ? [this.virtual ? spacer(top, 'top') : null, ...entries.map(({ row, index }) => h('tr', { key: this.keyOf(row), 'aria-rowindex': index + 2, class: { 'is-selected': this.selectedKeys.includes(this.keyOf(row)) }, style: this.virtual ? { height: `${Math.max(28, this.rowHeight)}px`, '--apple-row-height': `${Math.max(28, this.rowHeight)}px` } : undefined, onClick: () => { if (!this.disabled) this.$emit('row-click', row) } }, [
          this.selectable ? h('td', { class: 'apple-table__select' }, h('input', { type: 'checkbox', checked: this.selectedKeys.includes(this.keyOf(row)), disabled: this.disabled, 'aria-label': `选择第 ${(this.currentPage - 1) * this.pageSize + index + 1} 行`, onClick: (event: Event) => event.stopPropagation(), onChange: () => this.toggleRow(row) })) : null,
          ...this.columns.map(column => h('td', { key: column.key, style: { textAlign: column.align ?? 'left' } }, h('div', { class: 'apple-table__cell' }, this.$slots[`cell-${column.key}`]?.({ row, value: row[column.key], index }) ?? String(row[column.key] ?? '')))),
        ])), this.virtual ? spacer(bottom, 'bottom') : null] : h('tr', h('td', { colspan: this.columns.length + (this.selectable ? 1 : 0), class: 'apple-table__empty' }, this.$slots.empty?.() ?? (this.loading ? '正在加载…' : this.emptyText)))),
      ])) }),
      this.pageSize > 0 ? h('footer', { class: 'apple-table__footer' }, [h('span', `共 ${this.rows.length} 项`), h(ApplePagination, { modelValue: this.currentPage, total: this.rows.length, pageSize: this.pageSize, disabled: this.disabled, 'onUpdate:modelValue': this.setPage })]) : null,
    ])
  },
})

export const AppleTree = defineComponent({
  name: 'AppleTree',
  setup(props) { const directory = useSpeedDialEntry('directory', () => props.label, () => props.mobileDirectory); return { directoryTarget: directory.target, inMobileDirectory: directory.hosted, closeDirectory: directory.close } },
  props: { ...motionProps, items: { type: Array as PropType<AppleTreeItem[]>, default: () => [] }, modelValue: valueProp, expanded: { type: Array as PropType<AppleValue[]>, default: undefined }, disabled: Boolean, label: { type: String, default: '树形列表' }, searchable: { type: Boolean, default: true }, mobileDirectory: { type: Boolean, default: true } },
  emits: ['update:modelValue', 'update:expanded', 'select'],
  data: () => ({ search: '', searchCollapsed: [] as AppleValue[], internalExpanded: [] as AppleValue[], internalValue: undefined as AppleValue | undefined, focusValue: undefined as AppleValue | undefined }),
  computed: {
    query(): string { return this.searchable ? this.search.trim().toLocaleLowerCase() : '' },
    filteredItems(): AppleTreeItem[] {
      if (!this.query) return this.items
      const filter = (items: AppleTreeItem[]): AppleTreeItem[] => items.flatMap(item => {
        if (`${item.label} ${item.value} ${item.description ?? ''}`.toLocaleLowerCase().includes(this.query)) return [item]
        const children = item.children && filter(item.children)
        return children?.length ? [{ ...item, children }] : []
      })
      return filter(this.items)
    },
    expandedValues(): AppleValue[] {
      if (!this.query) return this.expanded ?? this.internalExpanded
      const values: AppleValue[] = []
      const visit = (items: AppleTreeItem[]) => { for (const item of items) if (item.children?.length) { values.push(item.value); visit(item.children) } }
      visit(this.filteredItems)
      return values.filter(value => !this.searchCollapsed.includes(value))
    },
    selectedValue(): AppleValue | undefined {
      const value = this.modelValue ?? this.internalValue
      const pathTo = (items: AppleTreeItem[]): AppleTreeItem[] | undefined => {
        for (const item of items) {
          if (item.value === value) return [item]
          const children = item.children && pathTo(item.children)
          if (children) return [item, ...children]
        }
      }
      const path = pathTo(this.items)
      if (!path) return value
      // Preserve the actual selection while highlighting its nearest visible ancestor.
      return (path.find(item => item.children?.length && !this.expandedValues.includes(item.value)) ?? path[path.length - 1]).value
    },
    visibleItems(): { item: AppleTreeItem; parent?: AppleValue }[] {
      const result: { item: AppleTreeItem; parent?: AppleValue }[] = []
      const visit = (items: AppleTreeItem[], parent?: AppleValue) => { for (const item of items) { result.push({ item, parent }); if (this.expandedValues.includes(item.value) && item.children) visit(item.children, item.value) } }
      visit(this.filteredItems)
      return result
    },
    tabValue(): AppleValue | undefined { return this.visibleItems.find(entry => entry.item.value === this.focusValue && !entry.item.disabled)?.item.value ?? this.visibleItems.find(entry => entry.item.value === this.selectedValue && !entry.item.disabled)?.item.value ?? this.visibleItems.find(entry => !entry.item.disabled)?.item.value },
  },
  watch: { query() { this.searchCollapsed = []; this.focusValue = undefined } },
  methods: {
    toggle(item: AppleTreeItem) { if (this.disabled || item.disabled || !item.children?.length) return; if (this.query) { this.searchCollapsed = this.searchCollapsed.includes(item.value) ? this.searchCollapsed.filter(value => value !== item.value) : [...this.searchCollapsed, item.value]; return }; const next = this.expandedValues.includes(item.value) ? this.expandedValues.filter(value => value !== item.value) : [...this.expandedValues, item.value]; this.internalExpanded = next; this.$emit('update:expanded', next) },
    select(item: AppleTreeItem) { if (this.disabled || item.disabled) return; this.focus(item.value); if (item.children?.length) { this.toggle(item); return }; this.internalValue = item.value; this.$emit('update:modelValue', item.value); this.$emit('select', item); this.closeDirectory() },
    focus(value: AppleValue | undefined) { if (value === undefined) return; this.focusValue = value; this.$nextTick(() => { const index = this.visibleItems.findIndex(entry => entry.item.value === value); (this.$refs.treeContent as HTMLElement | undefined)?.querySelectorAll<HTMLElement>('[role="treeitem"]')[index]?.focus() }) },
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
          ripple(h('div', { 'data-apple-selected': this.selectedValue === item.value, class: ['apple-tree__row', { 'is-selected': this.selectedValue === item.value, 'is-disabled': this.disabled || item.disabled }], style: { paddingInlineStart: `${Math.min(level - 1, 6) * 16 + 4}px` }, onClick: (event: Event) => { event.stopPropagation(); this.select(item) } }, [
            hasChildren ? h('span', { class: ['apple-tree__toggle', { 'is-open': open }], 'aria-hidden': 'true' }, icon(ChevronRight, 16)) : h('span', { class: 'apple-tree__spacer' }),
            this.$slots.item?.({ item, expanded: open, selected: this.selectedValue === item.value }) ?? h('span', item.label),
          ]), !this.disabled && !item.disabled),
          hasChildren && open ? h('ul', { role: 'group' }, this.renderItems(item.children!, level + 1)) : null,
        ])
      })
    },
  },
  render() {
    const content = h('div', { ref: 'treeContent', class: 'apple-tree-content' }, [
      this.searchable ? h(AppleSearch, { modelValue: this.search, 'onUpdate:modelValue': (value: string) => { this.search = value }, label: `搜索${this.label}`, disabled: this.disabled }) : null,
      h('div', { class: 'apple-tree-scroll' }, [h(AppleAutoSize, { motion: this.motion, class: 'apple-tree-size' }, { default: () => h('ul', { class: 'apple-tree', role: 'tree', 'aria-label': this.label, 'data-motion': this.motion }, this.renderItems(this.filteredItems)) }), this.query && !this.filteredItems.length ? h('p', { class: 'apple-tree-empty', role: 'status' }, '无匹配结果') : null]),
    ])
    return h('div', { class: ['apple-tree-host', { 'is-mobile-directory': this.inMobileDirectory }] }, h(Teleport, { to: this.directoryTarget ?? 'body', disabled: !this.inMobileDirectory }, content))
  },
})

export const AppleList = defineComponent({
  name: 'AppleList', props: { ...motionProps, ...itemProps, modelValue: valueProp, selectable: Boolean, disabled: Boolean, label: { type: String, default: '列表' } },
  emits: ['update:modelValue', 'select'],
  render() { return h(AppleAutoSize, { class: 'apple-list-size', motion: this.motion }, { default: () => h('ul', { class: 'apple-list', 'aria-label': this.label, 'data-motion': this.motion }, this.items.map(item => {
    const disabled = this.disabled || item.disabled
    const content = this.$slots.item?.({ item, selected: this.modelValue === item.value }) ?? [h('span', { class: 'apple-list__copy' }, [h('span', { class: 'apple-list__label' }, item.label), item.description ? h('span', { class: 'apple-list__description' }, item.description) : null]), this.selectable ? this.modelValue === item.value ? icon(Check) : null : item.href ? icon(ChevronRight) : null]
    return h('li', { key: item.value }, ripple(h(this.selectable ? 'button' : item.href && !disabled ? 'a' : 'div', { type: this.selectable ? 'button' : undefined, href: !this.selectable && !disabled ? item.href : undefined, disabled: this.selectable ? disabled : undefined, 'aria-disabled': disabled || undefined, 'aria-pressed': this.selectable ? this.modelValue === item.value : undefined, class: ['apple-list__item', { 'is-selected': this.modelValue === item.value }], onClick: () => { if (!disabled) { this.$emit('select', item); if (this.selectable) this.$emit('update:modelValue', item.value) } } }, content), !disabled && (this.selectable || Boolean(item.href))))
  })) }) },
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
  render() { return h('span', { class: ['apple-tag', `apple-tone-${this.tone}`], 'aria-disabled': this.disabled || undefined, 'data-motion': this.motion }, [this.$slots.default?.() ?? this.label, this.closable ? ripple(h('button', { type: 'button', disabled: this.disabled, 'aria-label': `移除${this.label ?? '标签'}`, onClick: (event: Event) => this.$emit('close', event) }, icon(X, 13)), !this.disabled) : null]) },
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
  name: 'AppleSkeleton', props: { ...motionProps, variant: { type: String as PropType<'text' | 'avatar' | 'card' | 'list' | 'table' | 'image'>, default: 'text' }, lines: { type: Number, default: 3 }, rows: { type: Number, default: 3 }, columns: { type: Number, default: 4 }, avatar: Boolean, width: [String, Number], height: [String, Number], animated: { type: Boolean, default: true }, label: { type: String, default: '正在加载内容' } },
  render() {
    const limit = (count: number) => Math.max(1, Math.min(20, count))
    const portrait = () => h('span', { class: 'apple-skeleton__avatar apple-skeleton__block' })
    const defaultLines = this.lines
    const lines = (count = defaultLines) => h('div', { class: 'apple-skeleton__lines' }, Array.from({ length: limit(count) }, (_, index) => h('span', { key: index, class: 'apple-skeleton__block', style: { width: index === limit(count) - 1 ? '65%' : '100%' } })))
    const content = this.variant === 'avatar' ? portrait() : this.variant === 'image' ? h('span', { class: 'apple-skeleton__image apple-skeleton__block' }) : this.variant === 'card' ? [h('span', { class: 'apple-skeleton__image apple-skeleton__block' }), lines()] : this.variant === 'list' ? Array.from({ length: limit(this.rows) }, (_, index) => h('div', { key: index, class: 'apple-skeleton__row' }, [portrait(), lines(this.lines)])) : this.variant === 'table' ? Array.from({ length: limit(this.rows) + 1 }, (_, index) => h('div', { key: index, class: 'apple-skeleton__table-row', style: { gridTemplateColumns: `repeat(${limit(this.columns)}, minmax(0, 1fr))` } }, Array.from({ length: limit(this.columns) }, (_, column) => h('span', { key: column, class: 'apple-skeleton__block' })))) : [this.avatar ? portrait() : null, lines()]
    const size = (value: string | number | undefined) => typeof value === 'number' ? `${value}px` : value
    return h('div', { class: ['apple-skeleton', `apple-skeleton--${this.variant}`, { 'is-animated': this.animated }], style: { width: size(this.width), height: size(this.height) }, role: 'status', 'aria-label': this.label, 'data-motion': this.motion }, h('div', { class: 'apple-skeleton__layout', 'aria-hidden': 'true' }, content))
  },
})

export const AppleEmpty = defineComponent({
  name: 'AppleEmpty', props: { ...motionProps, title: { type: String, default: '这里还没有内容' }, description: { type: String, default: '' } },
  render() { return h('div', { class: 'apple-empty', 'data-motion': this.motion }, [this.$slots.icon?.() ?? icon(Inbox, 36), h('h3', this.title), this.description ? h('p', this.description) : null, this.$slots.default?.()]) },
})

export const AppleDivider = defineComponent({
  name: 'AppleDivider', props: { ...motionProps, label: String, vertical: Boolean },
  render() { return h('div', { class: ['apple-divider', { 'apple-divider--vertical': this.vertical }], role: 'separator', 'aria-orientation': this.vertical ? 'vertical' : 'horizontal', 'aria-label': this.label, 'data-motion': this.motion }, this.$slots.default?.() ?? (this.label ? h('span', this.label) : undefined)) },
})

import { AppleButton } from './button'

export const AppleSteps = defineComponent({
  name: 'AppleSteps', props: { ...motionProps, ...itemProps, modelValue: { type: Number, default: 0 }, clickable: Boolean, disabled: Boolean, label: { type: String, default: '步骤' } }, emits: ['update:modelValue', 'change'],
  methods: {
    select(index: number) {
      if (!this.clickable || this.disabled || this.items[index]?.disabled) return
      this.$emit('update:modelValue', index)
      this.$emit('change', index)
    },
  },
  render() {
    return h('ol', { class: 'apple-steps', 'aria-label': this.label, 'data-motion': this.motion }, this.items.map((item, index) => {
      const complete = index < this.modelValue
      const current = index === this.modelValue
      const blocked = this.disabled || item.disabled
      const symbol = () => h(Transition, { name: 'apple-step-symbol', mode: 'out-in' }, { default: () => h('span', { key: complete ? 'complete' : 'number', class: 'apple-steps__symbol', 'aria-hidden': 'true' }, complete ? icon(Check, 16) : index + 1) })
      return h('li', { key: item.value, class: { 'is-complete': complete, 'is-current': current, 'is-disabled': blocked }, 'aria-current': current ? 'step' : undefined, 'aria-disabled': blocked || undefined }, [
        this.clickable
          ? h(AppleButton, { class: 'apple-steps__number', variant: current ? 'primary' : 'outline', iconOnly: true, label: item.label, disabled: blocked, motion: this.motion, onClick: () => this.select(index) }, { default: symbol })
          : h('span', { class: 'apple-steps__number', 'aria-hidden': 'true' }, symbol()),
        h('div', { class: 'apple-steps__copy' }, [
          h(this.clickable ? 'button' : 'strong', { class: 'apple-steps__label', type: this.clickable ? 'button' : undefined, disabled: this.clickable ? blocked : undefined, 'aria-current': current ? 'step' : undefined, onClick: this.clickable ? () => this.select(index) : undefined }, item.label),
          item.description ? h('span', item.description) : null,
        ]),
      ])
    }))
  },
})

export const AppleTimeline = defineComponent({
  name: 'AppleTimeline', props: { ...motionProps, items: { type: Array as PropType<AppleTimelineItem[]>, default: () => [] }, orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'vertical' }, label: { type: String, default: '时间线' } },
  render() { return h('ol', { class: ['apple-timeline', `apple-timeline--${this.orientation}`], 'aria-label': this.label, 'data-motion': this.motion }, this.items.map(item => h('li', { key: item.value, class: `apple-tone-${item.tone ?? 'neutral'}` }, [h('span', { class: 'apple-timeline__point', 'aria-hidden': 'true' }), h('div', { class: 'apple-timeline__copy' }, [item.time ? h('time', item.time) : null, h('strong', item.label), this.$slots.item?.({ item }) ?? (item.description ? h('p', item.description) : null)])]))) },
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

const floatingGroupKey = Symbol('apple-floating-group')

export const AppleBackTop = defineComponent({
  name: 'AppleBackTop', setup: () => ({ grouped: inject(floatingGroupKey, false) }), props: { ...motionProps, target: { type: String, default: '' }, threshold: { type: Number, default: 300 }, label: { type: String, default: '回到顶部' }, disabled: Boolean, fixed: { type: Boolean, default: true } },
  inject: { apple: { from: appleKey, default: null } },
  emits: ['click'], data: () => ({ visible: false, scrollTarget: undefined as HTMLElement | Window | undefined, scrollRun: undefined as MotionScroll | undefined }),
  computed: {
    motionMode() { const context = this.apple as AppleContext | null; return resolveMotion(this.motion, context?.motion.value.mode, context?.motion.value.reduced ?? (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)) },
  },
  mounted() { this.bindTarget() },
  watch: { target() { this.bindTarget() }, threshold() { this.onScroll() }, disabled(value) { if (value) this.cancelScroll() }, motionMode(mode) { if (mode !== 'full') this.cancelScroll() } },
  beforeUnmount() { this.cancelScroll(); this.scrollTarget?.removeEventListener('scroll', this.onScroll) },
  methods: {
    bindTarget() { this.cancelScroll(); this.scrollTarget?.removeEventListener('scroll', this.onScroll); this.scrollTarget = this.target ? document.querySelector<HTMLElement>(this.target) ?? window : window; this.scrollTarget.addEventListener('scroll', this.onScroll, { passive: true }); this.onScroll() },
    scrollPosition(): number { return this.scrollTarget === window ? window.scrollY : (this.scrollTarget as HTMLElement)?.scrollTop ?? 0 },
    onScroll() { this.visible = this.scrollPosition() >= this.threshold },
    cancelScroll() { this.scrollRun?.cancel(); this.scrollRun = undefined },
    go(event: Event) {
      if (this.disabled || !this.scrollTarget) return
      this.$emit('click', event)
      this.scrollRun = scrollToWithMotion(this.scrollTarget, 0, this.motionMode === 'full')
    },
  },
  render() {
    const node = h(Transition, { name: 'apple-floating-action' }, { default: () => this.visible ? ripple(h('button', { type: 'button', class: ['apple-back-top', { 'apple-back-top--fixed': this.fixed && !this.grouped }], disabled: this.disabled, 'aria-label': this.label, title: this.label, 'data-motion': this.motion, onClick: this.go }, this.$slots.default?.() ?? icon(ArrowUp, 20)), !this.disabled) : null })
    const target = (this.apple as AppleContext | null)?.portalTarget.value
    return target && this.fixed && !this.grouped ? h(Teleport, { to: target }, node) : node
  },
})

export const AppleFloatingGroup = defineComponent({
  name: 'AppleFloatingGroup', setup() { provide(floatingGroupKey, true); return usePreviewNavigation() },
  inheritAttrs: false,
  inject: { apple: { from: appleKey, default: null } },
  props: { ...motionProps, backTop: { type: Boolean, default: true }, target: { type: String, default: '' }, threshold: { type: Number, default: 300 }, label: { type: String, default: '快捷操作' } },
  computed: {
    motionMode() { const context = this.apple as AppleContext | null; return resolveMotion(this.motion, context?.motion.value.mode, context?.motion.value.reduced ?? (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)) },
  },
  render() {
    const node = h('div', { ...this.$attrs, ref: 'previewRoot', class: ['apple-floating-group', this.$attrs.class], role: 'group', 'aria-label': this.label, 'data-motion': this.motionMode, 'data-preview-hidden': this.previewActive || undefined, inert: this.previewActive || undefined, 'aria-hidden': this.previewActive || undefined }, [this.$slots.default?.(), this.backTop ? h(AppleBackTop, { target: this.target, threshold: this.threshold, motion: this.motion }) : null])
    const target = (this.apple as AppleContext | null)?.portalTarget.value
    return target ? h(Teleport, { to: target }, node) : node
  },
})

export const AppleStatistic = defineComponent({
  name: 'AppleStatistic', props: { ...motionProps, value: { type: [String, Number], default: 0 }, label: { type: String, required: true }, prefix: String, suffix: String, precision: { type: Number, default: 0 }, locale: { type: String, default: 'zh-CN' }, description: String },
  render() { const value = typeof this.value === 'number' ? this.value.toLocaleString(this.locale, { minimumFractionDigits: Math.max(0, Math.min(20, this.precision)), maximumFractionDigits: Math.max(0, Math.min(20, this.precision)) }) : this.value; return h('div', { class: 'apple-statistic', 'data-motion': this.motion }, [h('div', { class: 'apple-statistic__label' }, this.label), h('div', { class: 'apple-statistic__value' }, [this.prefix ? h('span', this.prefix) : null, h('strong', value), this.suffix ? h('span', this.suffix) : null]), this.description ? h('p', this.description) : null, this.$slots.default?.()]) },
})

export const contentComponents = { AppleTabs, AppleTabBar, AppleBreadcrumbs, ApplePagination, AppleAccordion, AppleTable, AppleTree, AppleList, AppleAvatar, AppleAvatarGroup, AppleBadge, AppleTag, AppleAlert, AppleProgress, AppleSpinner, AppleSkeleton, AppleEmpty, AppleDivider, AppleSteps, AppleTimeline, ApplePullRefresh, AppleInfiniteScroll, AppleBackTop, AppleFloatingGroup, AppleStatistic }
