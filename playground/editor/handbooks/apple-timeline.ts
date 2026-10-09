import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleTimeline",
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
      "type": "AppleTimelineItem[]",
      "default": "[]",
      "description": "时间项：{ label: string; value: string | number; disabled?: boolean; description?: string; href?: string; content?: string } & { time?: string; tone?: 'default'|'success'|'danger' }。"
    },
    {
      "name": "orientation",
      "type": "'horizontal' | 'vertical'",
      "default": "\"vertical\"",
      "description": "时间线排列方向：vertical 或 horizontal。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"时间线\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "item",
      "type": "({ item: AppleTimelineItem }) => VNode[]",
      "description": "替代 description 部分；标题和 time 仍保留。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
