import { defineHandbook } from '../handbook'

export default defineHandbook({
  name: 'AppleSpeedDial', source: 'src/components/speed-dial.ts',
  props: [
    { name: 'backTop', type: 'boolean', default: 'true', description: '内置回到顶部按钮，始终排在操作项上方。' },
    { name: 'target', type: 'string', default: '""', description: 'BackTop 监听的滚动容器 CSS 选择器，空字符串使用 window。' },
    { name: 'threshold', type: 'number', default: '300', description: '滚动达到此距离后显示 BackTop，单位 px。' },
    { name: 'label', type: 'string', default: '"快捷操作"', description: '浮动操作组的可访问名称。' },
  ],
  events: [], slots: [], methods: [],
  notes: ['在 App.vue 的 AppleProvider 内放置一次；子页面使用 AppleSpeedDialItem 注册操作，不重复创建宿主。', '宽度不超过 900px 时自动收集 AppleTree 移动目录，目录按钮排最后。多个目录使用 AppleTabBar，弹窗保持稳定的高高度。'],
})
