import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleAvatar",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "src",
      "type": "string",
      "default": "undefined",
      "description": "图片地址；加载失败时使用回退内容。"
    },
    {
      "name": "name",
      "type": "string",
      "default": "\"用户\"",
      "description": "图片的替代文字，也是失败或无 src 时的回退文字来源，取去除两端空白后的前两个字符。"
    },
    {
      "name": "size",
      "type": "number",
      "default": "40",
      "description": "尺寸，数字按 px。"
    },
    {
      "name": "square",
      "type": "boolean",
      "default": "false",
      "description": "使用方形头像样式。"
    }
  ],
  "events": [
    {
      "name": "error",
      "type": "(event: Event) => void",
      "description": "头像图片加载失败时触发，并切换到插槽或姓名回退。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "无图片或加载失败时替代姓名回退文字。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
