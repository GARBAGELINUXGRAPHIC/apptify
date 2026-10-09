import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleDivider",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "undefined",
      "description": "分隔文字和可访问名称；default 插槽可替代可见文字。"
    },
    {
      "name": "vertical",
      "type": "boolean",
      "default": "false",
      "description": "使用竖向分隔线，设置 aria-orientation=vertical；布局高度由外层决定。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "替代可见分隔文字。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
