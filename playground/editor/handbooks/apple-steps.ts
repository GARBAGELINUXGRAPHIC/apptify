import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleSteps",
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
      "type": "number",
      "default": "0",
      "description": "从 0 开始的步骤位置，不是 item.value。"
    },
    {
      "name": "clickable",
      "type": "boolean",
      "default": "false",
      "description": "允许点击步骤并发出索引；否则只展示进度。"
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
      "default": "\"步骤\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: number) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "change",
      "type": "(value: number) => void",
      "description": "点击可用步骤时发出从 0 开始的位置，不是 item.value。"
    }
  ],
  "slots": [],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
