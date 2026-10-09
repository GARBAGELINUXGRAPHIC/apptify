import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleFloatingGroup",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "backTop",
      "type": "boolean",
      "default": "true",
      "description": "在组内最后放置回到顶部按钮。"
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
      "description": "传给内置 BackTop 的滚动显示阈值，单位 px。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"快捷操作\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "附加操作，排列在内置回顶按钮前。"
    }
  ],
  "methods": [],
  "notes": [
    "默认固定右下并考虑安全区，回顶按钮排在附加操作之后。示例滚动容器用于体验 threshold。"
  ]
})
