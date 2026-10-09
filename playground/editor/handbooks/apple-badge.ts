import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleBadge",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "value",
      "type": "string | number",
      "default": "undefined",
      "description": "徽标内容；数值 0 默认隐藏，字符串 \"0\" 仍显示。数字超过 max 时显示 max+。"
    },
    {
      "name": "max",
      "type": "number",
      "default": "99",
      "description": "数字显示上限，仅对 number 类型 value 生效。"
    },
    {
      "name": "dot",
      "type": "boolean",
      "default": "false",
      "description": "显示圆点并忽略 value 文字。"
    },
    {
      "name": "showZero",
      "type": "boolean",
      "default": "false",
      "description": "value 为数字 0 时仍显示。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "undefined",
      "description": "徽标的可访问名称，省略时自动使用消息数量或“有新消息”。"
    },
    {
      "name": "tone",
      "type": "string",
      "default": "\"danger\"",
      "description": "视觉语义颜色，不会自行触发业务操作。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "被标记的内容；无插槽时徽标独立显示。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
