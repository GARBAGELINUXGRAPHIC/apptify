import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleEmpty",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "title",
      "type": "string",
      "default": "\"这里还没有内容\"",
      "description": "标题文字。"
    },
    {
      "name": "description",
      "type": "string",
      "default": "\"\"",
      "description": "补充说明文字。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "icon",
      "type": "() => VNode[]（无 slot props）",
      "description": "替代默认空状态图标。"
    },
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "标题与说明后的附加内容或操作。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
