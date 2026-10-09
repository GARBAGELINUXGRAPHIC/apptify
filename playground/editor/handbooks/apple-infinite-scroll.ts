import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleInfiniteScroll",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "loading",
      "type": "boolean",
      "default": "false",
      "description": "外部加载状态；从 true 变为 false 时释放等待并重新观察。"
    },
    {
      "name": "error",
      "type": "boolean | string",
      "default": "false",
      "description": "true 显示默认错误，字符串显示指定错误；错误时不自动加载，提供重试按钮。"
    },
    {
      "name": "finished",
      "type": "boolean",
      "default": "false",
      "description": "已加载完毕；为 true 时停止自动加载并显示 finishedText。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用控件的交互。选项自身的 disabled 仍然独立生效。"
    },
    {
      "name": "distance",
      "type": "number",
      "default": "120",
      "description": "IntersectionObserver 的 rootMargin 预加载距离，单位 px，创建时使用，负数按 0。"
    },
    {
      "name": "finishedText",
      "type": "string",
      "default": "\"已经到底了\"",
      "description": "finished 为 true 时的文字。"
    }
  ],
  "events": [
    {
      "name": "load",
      "type": "(done: () => void) => void",
      "description": "观察到加载区或点击“加载更多”时触发；完成后调用 done()，或让 loading 从 true 变为 false。"
    },
    {
      "name": "retry",
      "type": "(done: () => void) => void",
      "description": "点击重试时触发；完成后释放等待，错误和 finished 状态由应用更新。"
    }
  ],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "已加载的列表内容。"
    }
  ],
  "methods": [],
  "notes": [
    "完成后释放等待；示例自动执行 done() 并在第三批结束，以避免观察器无限加载。distance 在观察器创建时读取。"
  ]
})
