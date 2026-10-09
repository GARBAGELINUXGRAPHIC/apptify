import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleAutoSize",
  "source": "src/components/motion.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "axis",
      "type": "'height' | 'both'",
      "default": "\"height\"",
      "description": "height 动画调整高度，both 同时调整宽度与高度。使用 ResizeObserver 测量实际内容尺寸。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "尺寸变化的内容。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
