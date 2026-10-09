import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleTag",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "tone",
      "type": "string",
      "default": "\"neutral\"",
      "description": "视觉语义颜色，不会自行触发业务操作。"
    },
    {
      "name": "closable",
      "type": "boolean",
      "default": "false",
      "description": "显示移除按钮；点击仅发出 close，不会自行移除标签。"
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
      "default": "undefined",
      "description": "默认文字及移除按钮的名称；default 插槽可替换文字。"
    }
  ],
  "events": [
    {
      "name": "close",
      "type": "(event: Event) => void",
      "description": "点击移除按钮时触发；由父组件决定删除或隐藏标签。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "标签文字，优先于 label。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
