import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleActionSheet",
  "source": "src/components/overlays.ts",
  "props": [
    {
      "name": "modelValue",
      "type": "boolean",
      "default": "false",
      "description": "是否打开动作面板，默认 false。"
    },
    {
      "name": "title",
      "type": "string",
      "default": "\"\"",
      "description": "标题文字。"
    },
    {
      "name": "message",
      "type": "string",
      "default": "\"\"",
      "description": "动作列表上方的说明文字，与 default 插槽内容同时显示。"
    },
    {
      "name": "items",
      "type": "AppleMenuItem[]",
      "default": "[]",
      "description": "动作数组：{ label, value: string|number, disabled?, danger?, description?, icon?: Component }。default 插槽替代整个动作列表。"
    },
    {
      "name": "cancelText",
      "type": "string",
      "default": "\"取消\"",
      "description": "取消按钮文字，空字符串隐藏按钮；取消返回 undefined 和 cancel 原因。"
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
      "name": "select",
      "type": "(value: string | number, item: AppleMenuItem) => void",
      "description": "选中可用动作时发出 value 与完整项，随后更新打开状态并发出 close。"
    },
    {
      "name": "close",
      "type": "(value: unknown, reason: 'select' | 'close' | 'cancel' | 'escape' | 'backdrop') => void",
      "description": "选中动作时 value 为动作值；取消和背景/Escape 关闭时通常为 undefined。自定义 close(value) 保留传入值。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "({ select: (item: AppleMenuItem) => void, close: (value?: unknown) => void }) => VNode[]",
      "description": "替代默认动作列表；调用 select(item) 保留选择事件与关闭行为，取消按钮仍保留。"
    }
  ],
  "methods": [],
  "notes": [
    "自定义 default 插槽覆盖动作列表，使用 select(item) 保留结果回传；取消按钮仍保留。"
  ]
})
