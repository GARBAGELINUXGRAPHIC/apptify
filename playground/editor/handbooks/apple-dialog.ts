import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleDialog",
  "source": "src/components/overlays.ts",
  "props": [
    {
      "name": "modelValue",
      "type": "boolean",
      "default": "false",
      "description": "是否打开。使用 v-model 接收关闭操作的 false。"
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
      "description": "正文文字；提供 default 插槽时以插槽内容为准。"
    },
    {
      "name": "ariaLabel",
      "type": "string",
      "default": "\"对话框\"",
      "description": "没有 title 时用于对话框的可访问名称。"
    },
    {
      "name": "persistent",
      "type": "boolean",
      "default": "false",
      "description": "阻止 Escape 和背景点击关闭；显式关闭、确认和取消仍可使用。"
    },
    {
      "name": "loading",
      "type": "boolean",
      "default": "false",
      "description": "阻止所有交互关闭、确认和取消，显示忙碌状态。"
    },
    {
      "name": "closeOnConfirm",
      "type": "boolean",
      "default": "true",
      "description": "确认后自动关闭。异步保存时可设 false，由应用控制 loading 和 modelValue。"
    },
    {
      "name": "confirmText",
      "type": "string",
      "default": "\"确定\"",
      "description": "确认按钮文字，空字符串隐藏按钮。"
    },
    {
      "name": "cancelText",
      "type": "string",
      "default": "\"取消\"",
      "description": "取消按钮文字，空字符串隐藏按钮。"
    },
    {
      "name": "showFooter",
      "type": "boolean",
      "default": "true",
      "description": "显示默认操作区；自定义 footer 插槽始终可以显示。Dialog 默认 true，Drawer/Sheet 默认 false。"
    },
    {
      "name": "closable",
      "type": "boolean",
      "default": "true",
      "description": "显示关闭按钮。"
    },
    {
      "name": "width",
      "type": "string | number",
      "default": "480",
      "description": "宽度。数字按 px，字符串作为 CSS 尺寸；仍受可用空间约束。"
    },
    {
      "name": "placement",
      "type": "'left' | 'right' | 'bottom'",
      "default": "\"right\"",
      "description": "抽屉方向为 left、right、bottom；Sheet 默认 bottom。Dialog 不使用方向来改变其居中布局。"
    },
    {
      "name": "tone",
      "type": "string",
      "default": "\"default\"",
      "description": "语义色；danger 使用危险确认按钮。"
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
      "type": "(value: unknown, reason: 'escape' | 'backdrop' | 'cancel' | 'confirm' | 'close') => void",
      "description": "交互关闭时发出结果和原因；确认 true，取消 false，直接关闭通常 undefined。外部直接设置 modelValue=false 不会主动发出 close。"
    },
    {
      "name": "confirm",
      "type": "(value: true) => void",
      "description": "点击确认时触发；closeOnConfirm=true 时随后关闭。"
    },
    {
      "name": "cancel",
      "type": "(value: false) => void",
      "description": "点击取消时触发，随后关闭。"
    },
    {
      "name": "open",
      "type": "() => void",
      "description": "面板挂载并注册焦点与层级管理后触发。"
    },
    {
      "name": "after-close",
      "type": "() => void",
      "description": "退出动效完成并释放层级状态后触发。"
    }
  ],
  "slots": [
    {
      "name": "title",
      "type": "() => VNode[]（无 slot props）",
      "description": "替代标题内容；仍应通过 title 或 ariaLabel 提供对话框名称。"
    },
    {
      "name": "default",
      "type": "({ close: (value?: unknown) => void }) => VNode[]",
      "description": "对话框正文，替代 message；调用 close(value) 交回结果。"
    },
    {
      "name": "footer",
      "type": "({ close: (value?: unknown) => void, confirm: () => void, cancel: () => void }) => VNode[]",
      "description": "替代默认按钮区；即使 showFooter=false 也会显示。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
