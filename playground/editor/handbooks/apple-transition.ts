import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleTransition",
  "source": "src/components/motion.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "name",
      "type": "'page' | 'slide-x' | 'slide-y' | 'fade'",
      "default": "\"slide-y\"",
      "description": "过渡样式：page、slide-x、slide-y、fade。减少动效时退化为淡入淡出，none 关闭 CSS 过渡。"
    },
    {
      "name": "mode",
      "type": "'out-in' | 'in-out' | 'default'",
      "default": "\"out-in\"",
      "description": "out-in 先离开再进入，in-out 先进入再离开，default 同时进行。"
    },
    {
      "name": "appear",
      "type": "boolean",
      "default": "true",
      "description": "首次渲染时也执行进入过渡。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "单个可过渡元素或组件；切换时提供不同 key。"
    }
  ],
  "methods": [],
  "notes": [
    "default 插槽只放一个可过渡根节点。切换内容使用 key；外部减少动效偏好仍约束过渡。"
  ]
})
