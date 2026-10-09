import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleSnackbar",
  "source": "src/components/overlays.ts",
  "props": [
    {
      "name": "modelValue",
      "type": "boolean",
      "default": "true",
      "description": "是否显示，默认 true。"
    },
    {
      "name": "message",
      "type": "string",
      "default": "\"\"",
      "description": "正文文字；提供 default 插槽时以插槽内容为准。"
    },
    {
      "name": "title",
      "type": "string",
      "default": "\"\"",
      "description": "标题文字。"
    },
    {
      "name": "tone",
      "type": "'default' | 'info' | 'success' | 'warning' | 'danger' | 'error'",
      "default": "\"default\"",
      "description": "视觉语义颜色，不会自行触发业务操作。"
    },
    {
      "name": "duration",
      "type": "number",
      "default": "4000",
      "description": "自动关闭等待时间，单位毫秒；0 或负数常驻。鼠标悬停或焦点进入会暂停计时，离开继续。"
    },
    {
      "name": "action",
      "type": "string",
      "default": "\"\"",
      "description": "非空时显示操作按钮，仅发出 action，不会自动关闭。"
    },
    {
      "name": "closable",
      "type": "boolean",
      "default": "true",
      "description": "显示关闭按钮，不影响 duration 自动关闭。"
    },
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
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
      "type": "(value: undefined, reason: 'close' | 'timeout') => void",
      "description": "手动关闭或计时结束时触发，首个参数为 undefined。"
    },
    {
      "name": "action",
      "type": "() => void",
      "description": "点击操作按钮时触发，不会自动关闭。"
    },
    {
      "name": "after-close",
      "type": "() => void",
      "description": "退出过渡完成后触发。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "替代 title 与 message 的内容。"
    }
  ],
  "methods": [],
  "notes": [
    "直接使用时位置由外层布局决定。操作按钮仅发出 action；duration 单位为毫秒。"
  ]
})
