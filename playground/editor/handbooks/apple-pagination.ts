import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "ApplePagination",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "modelValue",
      "type": "number",
      "default": "1",
      "description": "从 1 开始的页码，显示时约束在有效页数内。"
    },
    {
      "name": "total",
      "type": "number",
      "default": "0",
      "description": "总条目数量，不是总页数；0 或负数时禁用翻页。"
    },
    {
      "name": "pageSize",
      "type": "number",
      "default": "10",
      "description": "每页条目数量；页数使用 ceil(total / max(1, pageSize))。"
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
      "default": "\"分页\"",
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
      "description": "用户提交选择或调整时发出当前值；直接从父组件赋值不会主动发出此事件。"
    }
  ],
  "slots": [],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
