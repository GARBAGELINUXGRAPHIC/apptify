import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleButton",
  "source": "src/components/button.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "variant",
      "type": "'primary' | 'secondary' | 'outline' | 'danger'",
      "default": "\"primary\"",
      "description": "primary 为主要操作，secondary 和 outline 为描边按钮，danger 为危险操作。"
    },
    {
      "name": "size",
      "type": "'small' | 'medium' | 'large'",
      "default": "\"medium\"",
      "description": "按钮尺寸：small、medium、large。"
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
      "description": "按钮的可访问名称；iconOnly 时同时用作 title。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用控件的交互。选项自身的 disabled 仍然独立生效。"
    },
    {
      "name": "loading",
      "type": "boolean",
      "default": "false",
      "description": "显示加载图标并禁止点击；有 href 时也会退化为禁用的 button。"
    },
    {
      "name": "ripple",
      "type": "boolean",
      "default": "true",
      "description": "启用点击波纹，同时受全局波纹和动效设置约束。"
    },
    {
      "name": "href",
      "type": "string",
      "default": "undefined",
      "description": "非空且可用时渲染为 a；禁用或加载时渲染为 button，移除 href。"
    },
    {
      "name": "type",
      "type": "'button' | 'submit' | 'reset'",
      "default": "\"button\"",
      "description": "原生按钮类型。仅在渲染为 button 时使用，默认 button，避免意外提交表单。"
    }
  ],
  "events": [
    {
      "name": "click",
      "type": "(event: MouseEvent) => void",
      "description": "可用状态下点击时触发；href 模式不会自动阻止原生链接跳转。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "按钮文字；图标与加载指示由 props 控制。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
