import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "ApplePullRefresh",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "modelValue",
      "type": "boolean",
      "default": "false",
      "description": "刷新状态。交互开始更新为 true，调用 refresh 事件的 done() 或改为 false 结束。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用控件的交互。选项自身的 disabled 仍然独立生效。"
    },
    {
      "name": "threshold",
      "type": "number",
      "default": "72",
      "description": "经过阻尼处理后的下拉触发距离，单位 px，实际至少 1。仅滚动顶部开始的单指竖向手势参与。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"刷新内容\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    }
  ],
  "events": [
    {
      "name": "update:modelValue",
      "type": "(value: boolean) => void",
      "description": "交互更新时发出新模型值；可使用 v-model 接收。"
    },
    {
      "name": "refresh",
      "type": "(done: () => void) => void",
      "description": "开始刷新时触发。任务完成后调用 done()，或将模型改为 false。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "({ refresh: () => void, refreshing: boolean }) => VNode[]",
      "description": "需要刷新的内容，也可使用 refresh 手动开始。"
    }
  ],
  "methods": [],
  "notes": [
    "任务完成后必须调用 done() 或将模型设为 false。除了顶部触摸下拉，还提供可用键盘操作的刷新按钮。"
  ]
})
