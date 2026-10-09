import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleLink",
  "source": "src/components/link.ts",
  "props": [
    {
      "name": "as",
      "type": "'a' | 'button'",
      "default": "\"a\"",
      "description": "渲染为 a 或 button。执行页面内操作时使用 button；原生 type 默认 button，也可作为 attr 指定 submit。"
    },
    {
      "name": "href",
      "type": "string",
      "default": "undefined",
      "description": "链接地址。"
    },
    {
      "name": "external",
      "type": "boolean",
      "default": "false",
      "description": "a 模式使用 _blank 打开，并添加 noopener noreferrer 和外链标记。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "移除 href、设置 aria-disabled 并阻止 click；button 模式还设置原生 disabled。"
    },
    {
      "name": "icon",
      "type": "Component",
      "default": "undefined",
      "description": "Vue 图标组件，例如从 lucide-vue-next 导入的 Mail；不是图标名称字符串。"
    },
    {
      "name": "iconOnly",
      "type": "boolean",
      "default": "false",
      "description": "紧凑的纯图标布局。用 label 为按钮提供可访问名称。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "undefined",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    }
  ],
  "events": [
    {
      "name": "click",
      "type": "(event: MouseEvent) => void",
      "description": "可用状态下点击时触发；需要自定义导航时可调用 event.preventDefault()。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "链接或按钮内容。"
    }
  ],
  "methods": [],
  "notes": [
    "页面跳转使用 href；页面内操作使用 as=\"button\"。链接不提供 motion 或 ripple props。"
  ]
})
