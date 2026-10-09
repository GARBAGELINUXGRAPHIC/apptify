import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleStack",
  "source": "src/components/foundation.ts",
  "props": [
    {
      "name": "direction",
      "type": "'row' | 'column'",
      "default": "\"column\"",
      "description": "Flex 主轴方向：row 或 column。"
    },
    {
      "name": "gap",
      "type": "string | number",
      "default": "16",
      "description": "子项间距。数字按 px；字符串按 CSS 长度处理。"
    },
    {
      "name": "align",
      "type": "string",
      "default": "\"stretch\"",
      "description": "CSS align-items 值，例如 stretch、center、flex-start、flex-end。"
    },
    {
      "name": "wrap",
      "type": "boolean",
      "default": "true",
      "description": "row 时允许换行；column 始终使用 nowrap。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "参与 Flex 排列的子项。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
