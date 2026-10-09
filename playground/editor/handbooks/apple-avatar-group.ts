import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleAvatarGroup",
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
      "type": "AppleAvatarItem[]",
      "default": "[]",
      "description": "成员数组：{ name: string; src?: string; value?: string | number }[]。"
    },
    {
      "name": "max",
      "type": "number",
      "default": "4",
      "description": "最多显示的头像数；超出显示 +N，负数按 0 处理。"
    },
    {
      "name": "size",
      "type": "number",
      "default": "36",
      "description": "尺寸，数字按 px。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"成员\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "替代完整头像集合，包括默认的 +N。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
