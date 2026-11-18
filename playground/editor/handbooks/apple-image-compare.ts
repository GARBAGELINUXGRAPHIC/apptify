import { defineHandbook } from '../handbook'

export default defineHandbook({
  name: 'AppleImageCompare',
  source: 'src/components/AppleImageCompare.vue',
  props: [
    { name: 'before', type: 'string', required: true, default: 'undefined', description: '必填，分隔线左侧图片的地址。' },
    { name: 'after', type: 'string', required: true, default: 'undefined', description: '必填，分隔线右侧图片的地址。' },
    { name: 'beforeAlt', type: 'string', default: '"调整前的图片"', description: '左侧图片的替代文本。' },
    { name: 'afterAlt', type: 'string', default: '"调整后的图片"', description: '右侧图片的替代文本。' },
    { name: 'beforeLabel', type: 'string', default: '"之前"', description: '左上角标签；空字符串隐藏标签。' },
    { name: 'afterLabel', type: 'string', default: '"之后"', description: '右上角标签；空字符串隐藏标签。' },
    { name: 'modelValue', type: 'number', default: '50', description: '通过 v-model 控制左侧图片显示百分比，取 0 到 100 的整数；非有限数值回退至 50。' },
    { name: 'label', type: 'string', default: '"图片对比"', description: '拖动控件的可访问名称。' },
    { name: 'aspectRatio', type: 'string | number', default: '"4/3"', description: '画布宽高比；两张图始终使用相同的画布。' },
    { name: 'fit', type: "'contain' | 'cover'", default: '"cover"', description: '图片填充方式；contain 保留完整画面。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用拖动和键盘调整。' },
  ],
  events: [
    { name: 'update:modelValue', type: '(value: number) => void', description: '拖动或键盘调整时同步百分比。' },
    { name: 'change', type: '(value: number) => void', description: '拖动结束（包括手势中断）或一次键盘调整完成且值变化时触发。' },
  ],
  slots: [], methods: [],
  notes: ['支持鼠标与触屏横向拖动，并保留页面纵向滚动；手势中断时保留最后位置；从圆形手柄开始拖动时锁定拖动手势。', '方向键每次调整 1%，Shift 加方向键及 PageUp / PageDown 调整 10%，Home / End 到达两端。'],
})
