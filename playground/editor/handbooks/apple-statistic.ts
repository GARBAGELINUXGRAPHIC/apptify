import { defineHandbook } from '../handbook'

export default defineHandbook({
  "name": "AppleStatistic",
  "source": "src/components/content.ts",
  "props": [
    {
      "name": "motion",
      "type": "'inherit' | 'auto' | 'full' | 'reduced' | 'none'",
      "default": "\"inherit\"",
      "description": "局部动效偏好。inherit 跟随外层；全局与系统的减少动效设置仍是上限。"
    },
    {
      "name": "value",
      "type": "string | number",
      "default": "0",
      "description": "数值使用 locale 本地化并按 precision 保留小数；字符串原样显示。"
    },
    {
      "name": "label",
      "type": "string",
      "default": "undefined",
      "description": "必填的统计名称。",
      "required": true
    },
    {
      "name": "prefix",
      "type": "string",
      "default": "undefined",
      "description": "数值前的文字。"
    },
    {
      "name": "suffix",
      "type": "string",
      "default": "undefined",
      "description": "数值后的文字。"
    },
    {
      "name": "precision",
      "type": "number",
      "default": "0",
      "description": "小数位数，实际限制为 0–20，仅影响数字 value。"
    },
    {
      "name": "locale",
      "type": "string",
      "default": "\"zh-CN\"",
      "description": "Intl 数字格式的地区标识，例如 zh-CN、en-US；使用有效地区标识。"
    },
    {
      "name": "description",
      "type": "string",
      "default": "undefined",
      "description": "补充说明文字。"
    }
  ],
  "events": [],
  "slots": [
    {
      "name": "default",
      "type": "() => VNode[]（无 slot props）",
      "description": "数值和说明之后的附加内容。"
    }
  ],
  "methods": [],
  "notes": [
    "使用真实内容与可访问名称；交互控件可通过 Tab 和原生键盘方式操作，动效遵循外层偏好。"
  ]
})
