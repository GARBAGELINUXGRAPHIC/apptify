import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleGrid",
  "source": "src/components/foundation.ts",
  "props": [
    {
      "name": "min",
      "type": "number",
      "default": "240",
      "description": "每列最小设计宽度，单位 px；空间不足时收缩到容器宽度，列数自动适应。"
    },
    {
      "name": "gap",
      "type": "number",
      "default": "20",
      "description": "网格间距，单位 px。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "参与自适应网格排列的子项。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
