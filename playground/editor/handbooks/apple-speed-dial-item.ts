import { defineHandbook } from '../handbook'

export default defineHandbook({
  name: 'AppleSpeedDialItem', source: 'src/components/speed-dial.ts',
  props: [
    { name: 'label', type: 'string', default: 'undefined', required: true, description: '操作名称，图标按钮的可访问名称。' },
    { name: 'icon', type: 'Component', default: 'undefined', description: '图标组件；有图标且未提供默认插槽时显示圆形图标按钮。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用此操作，保留按钮位置。' },
    { name: 'visible', type: 'boolean', default: 'true', description: '控制操作的显示和注册；隐藏时不占位置。' },
    { name: 'variant', type: "'primary' | 'secondary' | 'outline' | 'danger'", default: '"primary"', description: '操作按钮的外观类型。' },
  ],
  events: [{ name: 'click', type: '(event: MouseEvent) => void', description: '在全局宿主点击按钮时触发，处理函数仍由声明它的页面持有。' }],
  slots: [{ name: 'default', type: '() => VNode[]', description: '按钮内容；省略时使用图标或 label。' }],
  methods: [],
  notes: ['按注册顺序插入 BackTop 与目录按钮之间，卸载和 KeepAlive 停用时自动注销。无需手动注册或父子通信。'],
})
