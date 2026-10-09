import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleList",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "items",
      "type": "AppleItem[]",
      "default": "[]",
      "description": "按顺序显示的选项。每项 value 唯一，保留字符串和数字的类型区别。结构：{ label: string; value: string | number; disabled?: boolean; description?: string; href?: string; content?: string }。"
    },
    {
      "name": "modelValue",
      "type": "string | number",
      "default": "undefined",
      "description": "当前选中 value，仅 selectable 交互会发出 update:modelValue。"
    },
    {
      "name": "selectable",
      "type": "boolean",
      "default": "false",
      "description": "使用 button 单选并更新 modelValue；false 时有 href 的项渲染为链接，其余作为内容。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用控件的交互。选项自身的 disabled 仍然独立生效。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"列表\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: string | number) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "select",
      "type": "(item: AppleItem) => void",
      "description": "点击可用项时发出完整项；selectable 时随后更新模型，否则保留链接行为。"
    }
  ],
  "slots": [
    {
      "name": "item",
      "type": "({ item: AppleItem, selected: boolean }) => VNode[]",
      "description": "替代列表项的内部内容。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
