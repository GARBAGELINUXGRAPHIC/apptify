import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleAside",
  "source": "src/components/navibar.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "hideOnPreview",
      "type": "boolean",
      "default": "true",
      "description": "图片预览期间隐藏导航并禁止交互，同时保留原占位；退出预览时恢复。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "侧栏内容；布局由调用方提供。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
