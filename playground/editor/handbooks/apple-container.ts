import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleContainer",
  "source": "src/components/foundation.ts",
  "props": [
    {
      "name": "width",
      "type": "number | string",
      "default": "1200",
      "description": "内容最大宽度；数字按 px，字符串按 CSS 尺寸。实际宽度不会超过可用空间。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "容器内的内容。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
