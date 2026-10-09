import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleTooltip",
  "source": "src/components/overlays.ts",
  "props": [
    {
      "name": "text",
      "type": "string",
      "default": "undefined",
      "description": "必填的提示文字，用于面板内容和可访问名称。",
      "required": true
    },
    {
      "name": "placement",
      "type": "'top' | 'bottom' | 'left' | 'right'",
      "default": "\"top\"",
      "description": "期望提示方向：top、bottom、left、right；自动避让视口边缘。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用提示面板，不会禁用 default 插槽内的触发元素。"
    },
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "({ props: Record<string, unknown>, open: () => void, close: () => void, isOpen: boolean }) => VNode[]",
      "description": "作为底层 Popover 的 activator 透传，触发元素可绑定 props。"
    }
  ],
  "methods": [],
  "notes": [
    "仅用于短文字提示，默认插槽透传 Popover activator 参数；不应用 tooltip 承载需要焦点操作的表单。"
  ]
})
