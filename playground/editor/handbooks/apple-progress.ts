import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleProgress",
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
      "default": "0",
      "description": "只读进度数值，显示百分比约束为 0–100%；不发出 update:modelValue，使用 :model-value。"
    },
    {
      "name": "max",
      "type": "number",
      "default": "100",
      "description": "进度总量，用于将 modelValue 换算为百分比；非正值按 0% 显示。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"进度\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    },
    {
      "name": "indeterminate",
      "type": "boolean",
      "default": "false",
      "description": "显示不定进度，不提供 aria-valuenow。"
    },
    {
      "name": "showValue",
      "type": "boolean",
      "default": "false",
      "description": "确定进度显示百分比，不定进度显示“进行中”。"
    },
    {
      "name": "tone",
      "type": "string",
      "default": "\"accent\"",
      "description": "视觉语义颜色，不会自行触发业务操作。"
    }
  ],
  "events": [],
  "slots": [],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
