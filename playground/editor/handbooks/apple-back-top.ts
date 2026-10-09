import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleBackTop",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "target",
      "type": "string",
      "default": "\"\"",
      "description": "滚动容器的 CSS 选择器。空字符串使用 window；目标应在组件挂载时已存在。"
    },
    {
      "name": "threshold",
      "type": "number",
      "default": "300",
      "description": "目标滚动位置达到此值后显示按钮，单位 px。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"回到顶部\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用控件的交互。选项自身的 disabled 仍然独立生效。"
    },
    {
      "name": "fixed",
      "type": "boolean",
      "default": "true",
      "description": "固定右下角；嵌入 FloatingGroup 时由组负责定位。"
    }
  ],
  "events": [
    {
      "name": "click",
      "type": "(event: MouseEvent) => void",
      "description": "执行回到顶部时发出原生事件，动画遵循动效偏好。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "替代默认向上箭头。"
    }
  ],
  "methods": [],
  "notes": [
    "示例使用可滚动容器演示阈值；target 为空时操作 window。目标在挂载时解析，更改目标后需要重新挂载组件。"
  ]
})
