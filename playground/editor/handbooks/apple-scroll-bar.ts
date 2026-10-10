import { defineHandbook } from '../handbook'

export default defineHandbook({
  name: 'AppleScrollBar', source: 'src/components/scrollbar.ts',
  props: [
    { name: 'target', type: 'string | HTMLElement | (() => HTMLElement | undefined)', default: '""', description: 'CSS 选择器、元素或返回元素的函数；空值自动接管当前文档的滚动容器。' },
    { name: 'axis', type: "'both' | 'horizontal' | 'vertical'", default: '"both"', description: '指定目标时显示的滚动方向。' },
    { name: 'label', type: 'string', default: '""', description: '滚动条的可访问名称，默认从目标名称生成。' },
    { name: 'controls', type: 'string', default: '""', description: '目标元素 ID；未提供时使用或生成目标 ID。' },
  ],
  events: [{ name: 'interaction', type: '() => void', description: '拖动、点击轨道、键盘或滚轮操作时触发。' }],
  slots: [],
  methods: [{ name: 'refresh()', type: '() => void', description: '重新测量目标及滚动位置。尺寸、内容和滚动变化默认自动同步。' }],
  notes: ['AppleProvider 默认启用全局接管，无需逐个包裹内容。滚动条使用 fixed，不占布局空间；z-index 取 max(80, 目标及祖先层级)，弹窗内留在所属弹层上下文。', '原本主动隐藏滚动条的轮播、标签栏与日期滚轮保持原有交互；data-apple-scrollbar-ignore 可排除指定容器。'],
})
