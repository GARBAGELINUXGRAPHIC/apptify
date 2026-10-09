import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleMenu",
  "source": "src/components/overlays.ts",
  "props": [
    {
      "name": "modelValue",
      "type": "boolean",
      "default": "undefined",
      "description": "打开状态；默认 undefined，允许内部管理。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"操作\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    },
    {
      "name": "items",
      "type": "AppleMenuItem[]",
      "default": "[]",
      "description": "菜单数组：{ label, value: string|number, disabled?, danger?, description?, icon?: Component }。选择后关闭。"
    },
    {
      "name": "selected",
      "type": "string | number",
      "default": "undefined",
      "description": "为指定 value 显示勾选标记；不会因选择事件自动更新此 prop。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用控件的交互。选项自身的 disabled 仍然独立生效。"
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
      "description": "选择可用菜单项时发出 value 和完整项，然后更新打开状态为 false。"
    }
  ],
  "slots": [
    {
      "name": "activator",
      "type": "({ props: Record<string, unknown>, open: () => void, close: () => void, isOpen: boolean }) => VNode[]",
      "description": "自定义菜单触发元素，绑定 props 保留交互。"
    },
    {
      "name": "item",
      "type": "({ item: AppleMenuItem }) => VNode[]",
      "description": "替代菜单按钮的内部内容。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
