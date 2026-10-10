export interface SlotExample { scope?: string; code: string; enabled?: boolean }
export interface PlaygroundExample {
  props?: Record<string, string>
  slots?: Record<string, SlotExample>
  before?: string
  actions?: { label: string; expression: string }[]
}

const options = JSON.stringify([{ label: '第一项', value: 'first' }, { label: '第二项', value: 'second' }, { label: '不可用', value: 'disabled', disabled: true }])
const content = '<p>这里是组件内容。</p>'
const blocks = '<div v-for="n in 3" :key="n" class="tile">{{ n }}</div>'
const actions = JSON.stringify([{ label: '收藏', value: 'favorite' }, { label: '分享', value: 'share' }, { label: '删除', value: 'delete', danger: true }, { label: '不可用', value: 'disabled', disabled: true }])
const image = (color: string, text: string) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="${color}"/><text x="320" y="260" fill="white" text-anchor="middle" font-size="64" font-family="sans-serif">${text}</text></svg>`)
const gallery = JSON.stringify([{ src: image('#0071e3', 'Apptify'), alt: '蓝色示例图片', label: '蓝色' }, { src: image('#bf5af2', 'Vue'), alt: '紫色示例图片', label: '紫色' }, { src: image('#34c759', 'Hello'), alt: '绿色示例图片', label: '绿色' }])
const scroll = '<div id="demo-scroll" class="scroll-demo" tabindex="0" aria-label="滚动示例"><div style="height: 900px">向下滚动，体验回到顶部。</div></div>'

const examples: Record<string, PlaygroundExample> = {
  AppleScrollBar: { props: { target: '"#demo-scroll"' }, before: '<div id="demo-scroll" class="scroll-demo" tabindex="0" aria-label="滚动示例"><div style="width: 760px; height: 900px; display: grid; gap: 16px"><div v-for="n in 12" :key="n" class="tile">{{ n }}</div></div></div>' },
  AppleButton: { slots: { default: { code: '继续', enabled: true } } },
  AppleLink: { props: { as: '"button"' }, slots: { default: { code: '了解更多', enabled: true } } },
  AppleProvider: { props: { theme: '"dark"' }, slots: { default: { code: '<AppleInput v-model="fieldValue" label="局部主题" /><AppleButton @click="record(\'click\')">继续</AppleButton>', enabled: true } } },
  AppleContainer: { props: { width: '360' }, slots: { default: { code: blocks, enabled: true } } },
  AppleStack: { props: { direction: '"row"' }, slots: { default: { code: blocks, enabled: true } } },
  AppleGrid: { props: { min: '120' }, slots: { default: { code: blocks, enabled: true } } },
  AppleCard: { props: { title: '"Apptify"', subtitle: '"组件文档"', text: '"修改配置，体验卡片。"', image: JSON.stringify(image('#0071e3', 'Apptify')), imageAlt: '"蓝色示例图片"' } },
  AppleImage: { props: { gallery, index: '0' }, slots: { item: { scope: '{ item, index, active }', code: '<div class="tile">{{ index + 1 }} · {{ item.label }} · {{ active }}</div>' } } },
  AppleSearch: { props: { modelValue: '"Apptify"' } },
  AppleTextarea: { props: { label: '"个人简介"', modelValue: '"写下你的想法。"', maxlength: '160', counter: 'true' } },
  AppleSelect: { props: { label: '"选择项目"', items: options, modelValue: '"first"' } },
  AppleAutocomplete: { props: { label: '"搜索项目"', items: options, modelValue: 'null' } },
  AppleCheckbox: { props: { label: '"同意接收更新"' } },
  AppleSwitch: { props: { label: '"接收通知"' } },
  AppleRadioGroup: { props: { label: '"配送方式"', items: options, modelValue: '"first"' } },
  AppleSegmentedControl: { props: { label: '"统计周期"', items: options, modelValue: '"first"' } },
  AppleSlider: { props: { label: '"音量"', modelValue: '40' } },
  AppleStepper: { props: { label: '"数量"', modelValue: '2', min: '0', max: '10' } },
  AppleDatePicker: { props: { label: '"到店日期"', modelValue: '"2026-10-09"' } },
  AppleColorPicker: { props: { label: '"强调色"' } },
  AppleUpload: { props: { label: '"选择文件"', multiple: 'true', maxFiles: '3', maxSize: '5242880' } },
  AppleOtpInput: { props: { modelValue: '""' } },
  AppleCascader: { props: { label: '"所在地区"', items: JSON.stringify([{ label: '华东', value: 'east', children: [{ label: '上海', value: 'shanghai' }, { label: '杭州', value: 'hangzhou' }] }, { label: '华南', value: 'south', children: [{ label: '深圳', value: 'shenzhen' }] }]), levelLabels: '["地区", "城市"]' } },
  AppleRate: { props: { modelValue: '3' } },
  AppleForm: { props: { validator: '(data) => data.get("name") ? true : "请输入姓名"' }, slots: { default: { scope: '{ loading }', code: '<AppleInput v-model="fieldValue" name="name" label="姓名" required @keydown.enter.prevent="$refs.demo.submit()" /><AppleButton :loading="loading" @click="$refs.demo.submit()">提交</AppleButton><AppleLink as="button" @click="$refs.demo.reset()">重置</AppleLink>', enabled: true } } },
  AppleFormField: { props: { label: '"个人网站"', hint: '"输入你的主页地址"' }, slots: { default: { scope: 'field', code: '<input v-bind="field" v-model="fieldValue" class="apple-control" type="url" placeholder="https://example.com" />', enabled: true } } },
  AppleNavibar: { props: { brand: '"Apptify"', brandHref: '"#"', fixed: 'false', items: options, modelValue: '"first"' } },
  AppleAside: { slots: { default: { code: '<p>侧栏导航</p>' + blocks, enabled: true } } },
  AppleTabs: { props: { items: options, modelValue: '"first"' }, slots: { default: { scope: '{ item, value }', code: '<p>{{ item?.label }} · {{ value }}</p>', enabled: true } } },
  AppleTabBar: { props: { items: options, modelValue: '"first"' }, slots: { default: { scope: '{ item, value }', code: '<p>{{ item?.label }} · {{ value }}</p>', enabled: true } } },
  AppleBreadcrumbs: { props: { items: '[{"label":"首页","value":"home"},{"label":"组件","value":"components"},{"label":"当前页","value":"current"}]' } },
  ApplePagination: { props: { total: '120' } },
  AppleSteps: { props: { items: options, clickable: 'true' } },
  AppleAccordion: { props: { items: '[{"label":"如何使用？","value":"first","content":"从 apptify 导入组件。"},{"label":"支持键盘吗？","value":"second","content":"按钮可以用 Enter 或空格操作。"}]' } },
  AppleTable: { props: { columns: '[{"key":"name","label":"姓名","sortable":true},{"key":"score","label":"评分","sortable":true,"align":"right"}]', rows: '[{"id":1,"name":"林初","score":92},{"id":2,"name":"Alex","score":85},{"id":3,"name":"Taylor","score":97},{"id":4,"name":"Sam","score":88}]', selectable: 'true', pageSize: '3' } },
  AppleTree: { props: { items: '[{"label":"文档","value":"docs","children":[{"label":"指南","value":"guide"},{"label":"API","value":"api"}]},{"label":"设置","value":"settings"}]', expanded: '["docs"]', mobileDirectory: 'false' } },
  AppleList: { props: { items: options, selectable: 'true', modelValue: '"first"' } },
  AppleAvatar: { props: { name: '"林初"', size: '48' } },
  AppleAvatarGroup: { props: { items: '[{"name":"林初"},{"name":"Alex"},{"name":"Taylor"},{"name":"Sam"},{"name":"陈安"}]' } },
  AppleBadge: { props: { value: '8' }, slots: { default: { code: '<AppleButton @click="props.value = Number(props.value || 0) + 1">消息</AppleButton>', enabled: true } } },
  AppleTag: { props: { label: '"设计系统"', closable: 'true' } },
  AppleAlert: { props: { title: '"保存成功"', message: '"内容已同步。"', closable: 'true' } },
  AppleProgress: { props: { modelValue: '68', showValue: 'true' } },
  AppleSpinner: {}, AppleSkeleton: {},
  AppleEmpty: { props: { title: '"还没有收藏"', description: '"收藏的内容会出现在这里。"' } },
  AppleDivider: { props: { label: '"更多选择"' } },
  AppleTimeline: { props: { items: '[{"label":"已创建","value":"created","time":"09:00","description":"订单已创建。"},{"label":"已完成","value":"done","time":"10:00","tone":"success","description":"订单已完成。"}]' } },
  AppleStatistic: { props: { label: '"本月访问"', value: '12840', suffix: '"次"' } },
  AppleDialog: { props: { title: '"保存更改？"', message: '"你的更改会同步到所有设备。"' } },
  AppleDrawer: { props: { title: '"偏好设置"', message: '"修改配置后再次打开体验。"' } },
  AppleSheet: { props: { title: '"分享"', message: '"选择分享方式。"' } },
  AppleSnackbar: { props: { message: '"内容已保存。"', duration: '0', action: '"撤销"' } },
  ApplePopover: { slots: { default: { scope: '{ close }', code: '<p>面板内容</p><AppleButton @click="close()">完成</AppleButton>', enabled: true } } },
  AppleTooltip: { props: { text: '"添加到收藏"' }, slots: { default: { scope: '{ props: triggerProps }', code: '<AppleButton v-bind="triggerProps">收藏</AppleButton>', enabled: true } } },
  AppleMenu: { props: { items: actions } },
  AppleActionSheet: { props: { title: '"选择操作"', items: actions } },
  ApplePullRefresh: { slots: { default: { scope: '{ refreshing }', code: '<p>{{ refreshing ? \'正在刷新…\' : \'内容已就绪\' }} · {{ batches }} 次刷新</p>', enabled: true } } },
  AppleInfiniteScroll: { slots: { default: { code: '<p v-for="n in batches" :key="n" class="tile">已加载第 {{ n }} 批</p>', enabled: true } } },
  AppleBackTop: { props: { target: '"#demo-scroll"', threshold: '120', fixed: 'false' }, before: scroll },
  AppleFloatingGroup: { props: { target: '"#demo-scroll"', threshold: '120' }, before: scroll, slots: { default: { code: '<AppleButton @click="record(\'action\')">帮助</AppleButton>', enabled: true } } },
  AppleSpeedDial: { props: { target: '"#demo-scroll"', threshold: '120' }, before: scroll + '<AppleTree label="示例目录" :items="[{ label: \'概览\', value: \'overview\' }]" /><AppleSpeedDialItem label="新增" @click="record(\'create\')" />' },
  AppleSpeedDialItem: { props: { label: '"新增"' }, before: '<AppleSpeedDial :threshold="0" />' },
  AppleAutoSize: { before: '<AppleLink as="button" @click="expanded = !expanded">切换内容</AppleLink>', slots: { default: { code: '<div class="tile"><p>内容</p><p v-if="expanded">更多内容<br />更多内容<br />更多内容</p></div>', enabled: true } } },
  AppleTransition: { before: '<AppleLink as="button" @click="expanded = !expanded">切换内容</AppleLink>', slots: { default: { code: '<div :key="String(expanded)" class="tile">{{ expanded ? \'第二页\' : \'第一页\' }}</div>', enabled: true } } },
  AppleOverlayHost: { before: '<AppleButton @click="$apple.notify(\'内容已保存\', { tone: \'success\' })">显示通知</AppleButton><AppleButton variant="secondary" @click="$apple.dialog({ title: \'宿主对话框\', message: \'由 OverlayHost 渲染\' })">打开对话框</AppleButton>' },
}

export function playgroundExample(name: string): PlaygroundExample { return examples[name] || {} }

export function slotExample(component: string, name: string): SlotExample {
  const explicit = examples[component]?.slots?.[name]
  if (explicit) return explicit
  if (name === 'activator') return { scope: '{ props: triggerProps }', code: '<AppleButton v-bind="triggerProps">打开面板</AppleButton>' }
  if (name === 'footer') return { scope: '{ close, confirm, cancel }', code: '<AppleButton @click="confirm()">确定</AppleButton><AppleLink as="button" @click="cancel()">取消</AppleLink>' }
  if (name.startsWith('cell-')) return { scope: '{ row, value, index }', code: '<strong>{{ value }}</strong>' }
  if (name.startsWith('panel-')) return { scope: '{ item }', code: '<p>{{ item?.label }}</p>' }
  if (name.startsWith('item')) {
    const scope = component === 'AppleTree' ? '{ item, expanded, selected }' : component === 'AppleList' ? '{ item, selected }' : component === 'AppleAccordion' ? '{ item, open }' : '{ item }'
    return { scope, code: '<strong>{{ item.label }}</strong>' }
  }
  if (name === 'icon') return { code: '<Star :size="32" />' }
  if (name === 'media') return { code: '<div class="tile">自定义媒体</div>' }
  if (name === 'actions') return { scope: component === 'AppleNavibar' ? '{ close }' : undefined, code: '<AppleButton @click="record(\'action\')">操作</AppleButton>' }
  if (name === 'default' && ['AppleDialog', 'AppleDrawer', 'AppleSheet'].includes(component)) return { scope: '{ close }', code: '<p>自定义正文</p><AppleButton @click="close(\'done\')">完成</AppleButton>' }
  if (name === 'default' && component === 'AppleActionSheet') return { scope: '{ select, close }', code: '<AppleButton @click="select({ label: \'收藏\', value: \'favorite\' })">收藏</AppleButton>' }
  return { code: content }
}
