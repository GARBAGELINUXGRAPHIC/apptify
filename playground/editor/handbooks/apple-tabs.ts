import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleTabs",
  "source": "src/components/tabs.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "items",
      "type": "AppleItem[]",
      "default": "[]",
      "description": "按顺序显示的选项。每项 value 唯一，保留字符串和数字的类型区别。结构：{ label: string; value: string | number; disabled?: boolean; description?: string; href?: string; content?: string }。"
    },
    {
      "name": "modelValue",
      "type": "string | number",
      "default": "undefined",
      "description": "当前页签 value。省略时内部管理；无匹配或匹配项禁用时回退到第一个可用项。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"内容分类\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用控件的交互。选项自身的 disabled 仍然独立生效。"
    },
    {
      "name": "variant",
      "type": "'underline' | 'bar'",
      "default": "\"underline\"",
      "description": "underline 为下划线样式；bar 为页签栏样式。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: string | number) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "change",
      "type": "(value: string | number) => void",
      "description": "用户提交选择或调整时发出当前值；直接从父组件赋值不会主动发出此事件。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "({ item: AppleItem | undefined, value: string | number | undefined }) => VNode[]",
      "description": "当前面板内容；优先级低于对应的 panel-${value}。"
    },
    {
      "name": "panel-${value}",
      "type": "({ item: AppleItem }) => VNode[]",
      "description": "为具体页签 value 定义面板，例如 #panel-overview。"
    }
  ],
  "methods": [],
  "notes": [
    "支持方向键、Home/End，跳过禁用项。省略 v-model 时内部管理，不会自动请求面板内容。"
  ]
})
