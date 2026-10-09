import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleAlert",
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
      "default": "undefined",
      "description": "标题文字。"
    },
    {
      "name": "message",
      "type": "string",
      "default": "undefined",
      "description": "正文文字；提供 default 插槽时以插槽内容为准。"
    },
    {
      "name": "tone",
      "type": "'info' | 'success' | 'warning' | 'danger'",
      "default": "\"info\"",
      "description": "视觉语义颜色，不会自行触发业务操作。"
    },
    {
      "name": "closable",
      "type": "boolean",
      "default": "false",
      "description": "显示关闭按钮。"
    },
    {
      "name": "modelValue",
      "type": "boolean",
      "default": "true",
      "description": "是否显示，默认 true；关闭后更新为 false。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: boolean) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "close",
      "type": "() => void",
      "description": "点击关闭按钮时触发；此前已发出 update:modelValue(false)。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "替代 message 正文。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
