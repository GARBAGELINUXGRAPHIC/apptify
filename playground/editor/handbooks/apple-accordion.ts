import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleAccordion",
  "source": "src/components/content.ts",
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
      "type": "string | number | (string | number)[] | undefined",
      "default": "undefined",
      "description": "展开项 value；multiple=true 时使用 value 数组。单选收起最后一项时发出 undefined。省略模型时内部管理。"
    },
    {
      "name": "multiple",
      "type": "boolean",
      "default": "false",
      "description": "允许同时展开多项；开启时更新事件返回数组。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用控件的交互。选项自身的 disabled 仍然独立生效。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: string | number | (string | number)[] | undefined) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "change",
      "type": "(value: string | number | (string | number)[] | undefined) => void",
      "description": "用户提交选择或调整时发出当前值；直接从父组件赋值不会主动发出此事件。"
    }
  ],
  "slots": [
    {
      "name": "item",
      "type": "({ item: AppleItem, open: boolean }) => VNode[]",
      "description": "通用折叠项正文，替代 item.content。"
    },
    {
      "name": "item-${value}",
      "type": "({ item: AppleItem, open: boolean }) => VNode[]",
      "description": "具体项的正文，优先于通用 item 插槽。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
