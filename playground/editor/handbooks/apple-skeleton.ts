import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleSkeleton",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "variant",
      "type": "'text' | 'avatar' | 'card' | 'list' | 'table' | 'image'",
      "default": "\"text\"",
      "description": "骨架类型：text、avatar、card、list、table、image。"
    },
    {
      "name": "lines",
      "type": "number",
      "default": "3",
      "description": "text 模式的行数，渲染时限制为 1–20。"
    },
    {
      "name": "rows",
      "type": "number",
      "default": "3",
      "description": "list/table 模式的行数，渲染时限制为 1–20。"
    },
    {
      "name": "columns",
      "type": "number",
      "default": "4",
      "description": "table 模式的列数，渲染时限制为 1–20。"
    },
    {
      "name": "avatar",
      "type": "boolean",
      "default": "false",
      "description": "text 模式在文字行旁显示头像占位；list 模式默认始终包含头像。"
    },
    {
      "name": "width",
      "type": "string | number",
      "default": "undefined",
      "description": "宽度。数字按 px，字符串作为 CSS 尺寸；仍受可用空间约束。"
    },
    {
      "name": "height",
      "type": "string | number",
      "default": "undefined",
      "description": "高度。数字按 px，字符串作为 CSS 尺寸。"
    },
    {
      "name": "animated",
      "type": "boolean",
      "default": "true",
      "description": "启用骨架动画，同时受动效设置约束。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "\"正在加载内容\"",
      "description": "控件名称或区域的可访问名称。无可见名称时应提供 aria-label。"
    }
  ],
  "events": [],
  "slots": [],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
