import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleSearch",
  "source": "src/components/foundation.ts",
  "props": [
    {
      "name": "modelValue",
      "type": "string",
      "default": "\"\"",
      "description": "搜索框的文字；输入和清空均返回字符串。"
    },
    {
      "name": "placeholder",
      "type": "string",
      "default": "\"搜索\"",
      "description": "尚未填写或选择时显示的占位文字，不能替代字段名称。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"搜索\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用输入和清空按钮。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: string) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "search",
      "type": "(value: string) => void",
      "description": "按 Enter 时发出当前查询文字；不会自动请求或过滤数据。"
    }
  ],
  "slots": [],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
