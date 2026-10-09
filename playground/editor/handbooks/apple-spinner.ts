import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleSpinner",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "size",
      "type": "number",
      "default": "22",
      "description": "尺寸，数字按 px。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"正在加载\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "加载图标旁的附加内容。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
