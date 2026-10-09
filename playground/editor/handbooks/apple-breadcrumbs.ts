import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleBreadcrumbs",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "items",
      "type": "AppleItem[]",
      "default": "[]",
      "description": "路径项：{ label: string; value: string | number; disabled?: boolean; description?: string; href?: string; content?: string }[]。最后一项始终显示为当前页文本；禁用项不生成可点击元素。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"当前位置\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    }
  ],
  "events": [
    {
      "name": "click",
      "type": "(item: AppleItem, event: MouseEvent) => void",
      "description": "点击可用的非末项时发出完整项和原生事件。接入 Router 时自行阻止默认导航。"
    }
  ],
  "slots": [],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
